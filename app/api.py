from flask import Flask, request, redirect, url_for, session, jsonify, g, render_template
import os, sys
import requests
from functools import wraps
from flask_sqlalchemy import SQLAlchemy
import traceback
import base64
import models
import settings
import re
import google_auth_oauthlib.flow

if settings.TEST_MODE:
    import mock_storage as storage
else:
    import storage as storage

settings_module      = os.environ.get('FLASK_CONFIG_MODULE','config.DevConfig')

# cribbed from https://developers.google.com/api-client-library/python/auth/web-app
# This variable specifies the name of a file that contains the OAuth 2.0
# information for this application, including its client_id and client_secret.
CLIENT_SECRETS_FILE = "scenevr_client_secret.json"

# This OAuth 2.0 access scope allows us to request some basic information
# which, at this point, we don't.
SCOPES = ['profile']

# Initialize Flask app. Some say we should use a factory, but then I don't know how to do the decorators.
app = Flask(__name__)
app.secret_key = os.environ['FLASK_SECRET_KEY']
app.config.from_object(settings_module)
app.logger.debug('config: {}'.format(settings_module))
from models import db
db.app = app
db.init_app(app)



@app.context_processor
def inject_urls():
    """
    Inject urls into the templates.
    Template variable will always have a trailing slash.
    """
    if settings.TEST_MODE:
        storage_url = settings.AWS_MOCK_STORAGE_BUCKET_URL
    else:
        storage_url = settings.AWS_STORAGE_BUCKET_URL

    if not storage_url.endswith('/'):
        storage_url += '/'

    return dict(
        STORAGE_URL=storage_url, storage_url=storage_url)



def _user_set(issuer=None, subject=None):

  """Given a two part user ID established with OAuth, find or create that user."""
  if not issuer or not subject:
      raise Exception("Issuer and subject are required right now")
  user = models.User.query.filter_by(oauth_issuer=issuer, oauth_subject=subject).first()
  if user is None:
      user = models.User(oauth_issuer=issuer, oauth_subject=subject)
      db.session.add(user)
      db.session.commit()
  g.user = user
  session['user_id'] = user.id

def _user_remove():
    try:
        session.pop('user_id')
    except KeyError: pass

def require_user(f):
  """
  Decorator to enforce authenticated user
  Adds user to request and kwargs
  """
  @wraps(f)
  def decorated_function(*args, **kwargs):
    user = g.get('user', None)
    if user is None:
      return redirect(url_for('google_authorize'))
    request.user = user
    user.visits += 1
    db.session.add(user)
    db.session.commit()
    kwargs['user'] = user
    return f(*args, **kwargs)
  return decorated_function

@app.before_request
def establish_user():
    """Make sure that if we have a user ID, that user is available to everything else in a consistent fashion."""
    user_id = session.get('user_id', None)
    if user_id:
        g.user = models.User.query.get(user_id)
    else:
        g.user = None

@app.route("/")
def hello():
  return "Eventually this should show the SceneVR home page. <a href='/home'>Click here</a> to try the login"

@app.route('/home')
@require_user
def home(user=None):
  """Entry point to the application for an authenticated user."""
  user = g.user
  return render_template('hello.html', user=user)

@app.route('/home')
def my_form_post():
    user = g.user
    return render_template('hello.html', user=user)

@app.route('/home/update', methods=['POST'])
def update_form():
    user = g.user
    text = request.form['text']
    project = models.Project(user_id=user.id, name=text)
    scene = models.Scene(project_id=project.id, text="", image_url="")
    db.session.add(project)
    db.session.add(scene)
    db.session.commit()

    return render_template('hello.html', user=user)

@app.route('/home/<project_id>')
def getScenes(project_id):
    #user = g.user
    #text = request.form['text']
    scenes = models.Scene.query.filter_by(project_id=project_id)

    return render_template('scenes.html', scenes=scenes, project_id=project_id)

@app.route('/home/<project_id>/update', methods=['POST'])
def updateScenes(project_id):
    """
    Save storymap image
    @id = storymap id
    @name = file name
    @content = data:URL representing the file's data as base64 encoded string
    """
    try:
        user = g.user
        #print(request.files)
        text = request.form['text']
        file = request.files['image_url']
        filename = file.filename
        content_type = file.content_type
        content = base64.b64encode(file.read())
        # print(content)
        # m = re.match('data:(.+);base64,(.+)', content)
        # if m:
        #     content_type = m.group(1)
        #     content = m.group(2).decode('base64')
        # else:
        #     raise Exception('Expected content as data-url')

        key_name = storage.key_name(str(user.id), str(project_id), filename)
        storage.save_from_data(key_name, content_type, content)

        scene = models.Scene(project_id=project_id, text=text, image_url=key_name)
        db.session.add(scene)
        db.session.commit()

        scenes = models.Scene.query.filter_by(project_id=project_id)

        return render_template('scenes.html', scenes=scenes, project_id=project_id, user_id=user.id)
    except storage.StorageException as e:
        traceback.print_exc()
        return jsonify({'error': str(e), 'error_detail': e.detail})
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)})

@app.route("/logout/")
def logout():
    _user_remove()
    return redirect('https://www.google.com/accounts/Logout')


@app.route('/google/authorize')
def google_authorize():
  """Begin the OAuth process. Assumes Google for now."""
  # Create flow instance to manage the OAuth 2.0 Authorization Grant Flow steps.
  flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
      CLIENT_SECRETS_FILE, scopes=SCOPES)

  flow.redirect_uri = url_for('google_authorized', _external=True)

  authorization_url, state = flow.authorization_url(
      # Enable offline access so that you can refresh an access token without
      # re-prompting the user for permission. Recommended for web server apps.
      access_type='offline',
      # Enable incremental authorization. Recommended as a best practice.
      include_granted_scopes='true')

  # Store the state so the callback can verify the auth server response.
  session['state'] = state

  return redirect(authorization_url)


@app.route('/google/authorized')
def google_authorized():
  """Post authentication callback. This application URL must also be whitelisted with the Google OAuth credentials used
     to create CLIENT_SECRETS_FILE."""
  import google.oauth2.id_token
  import google.auth.transport.requests
  # Specify the state when creating the flow in the callback so that it can
  # verified in the authorization server response.
  state = session['state']

  flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
      CLIENT_SECRETS_FILE, scopes=SCOPES, state=state)
  flow.redirect_uri = url_for('google_authorized', _external=True)

  # Use the authorization server's response to fetch the OAuth 2.0 tokens.
  authorization_response = request.url
  flow.fetch_token(authorization_response=authorization_response)

  # Store credentials in the session.
  # ACTION ITEM: In a production app, you likely want to save these
  #              credentials in a persistent database instead.
  credentials = flow.credentials
  grequest = google.auth.transport.requests.Request()
  verified_jwt = google.oauth2.id_token.verify_oauth2_token(credentials.id_token,grequest)
  _user_set(issuer=verified_jwt['iss'], subject=verified_jwt['sub'])
  # For now, we will always redirect a freshly authenticated user to 'home' no matter where they were trying to go in the first place.
  return redirect(url_for('home'))

if __name__ == "__main__":
    if len(sys.argv) == 2 and sys.argv[1] == 'initdb':
        db.create_all()
        print("Initialized database")
        sys.exit()
    if os.path.isfile('local_only.crt') and os.path.isfile('local_only.key'):
        app.run(ssl_context=('local_only.crt', 'local_only.key'))
    else:
        print("Can't find SSL files. See README for instructions, or make sure you're running from the correct directory.")
        sys.exit()
