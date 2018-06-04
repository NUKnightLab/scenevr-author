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
import hashlib
import urllib

import google_auth_oauthlib.flow
import google.oauth2.credentials
import googleapiclient.discovery

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
app = Flask(__name__, static_folder="../static", template_folder="../static")
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

    storage_url = settings.AWS_STORAGE_BUCKET_URL

    if not storage_url.endswith('/'):
        storage_url += '/'

    return dict(
        STORAGE_URL=storage_url, storage_url=storage_url)

def _get_uid(user_string):
    """Generate a unique identifer for user string"""
    return hashlib.md5(user_string).hexdigest()

def _user_set(issuer=None, subject=None):

  """Given a two part user ID established with OAuth, find or create that user."""
  if not issuer or not subject:
      raise Exception("Issuer and subject are required right now")
  user = models.User.query.filter_by(oauth_issuer=issuer, oauth_subject=subject).first()
  if user is None:
      credentials = google.oauth2.credentials.Credentials(
      **session['credentials'])

      oauth2 = googleapiclient.discovery.build('oauth2', 'v2', credentials=credentials)
      userinfo = oauth2.userinfo().get().execute()
      name = userinfo['name']
      picture = userinfo['picture']
      g_id = userinfo['id']

      session['credentials'] = credentials_to_dict(credentials)

      user = models.User(oauth_issuer=issuer, oauth_subject=subject, name=name, picture=picture, g_id=g_id)
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



@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
@require_user
def index(path, user=None):
    return render_template('index.html')

@app.route("/projects", methods=['GET'])
def projects():
    user = g.user
    projects = models.Project.query.filter_by(user_id=user.id)
    projectArray = []
    for project in projects:
        projectDict = {'id':project.id, 'title':project.title, 'desc':project.desc, 'date': project.date}
        projectArray.append(projectDict)
    return jsonify(projectArray)

@app.route('/create-project', methods=['POST'])
def create_project():
    user = g.user
    project = models.Project(user_id=user.id)
    db.session.add(project)
    db.session.commit()
    data = {'project_id': project.id, 'title': project.title, 'desc': project.desc}
    return jsonify(data)


@app.route("/project-details/<project_id>", methods=['GET', 'POST'])
def project_details(project_id):
    if request.method == 'POST':
        data = request.get_json()
        project = models.Project.query.get(project_id)
        project.title = data['titleData']
        project.desc = data['descData']
        db.session.add(project)
        scenesData = data['sceneData']
        scenes = models.Scene.query.filter_by(project_id=project_id).order_by(models.Scene.order)
        for index, scene in enumerate(scenes):
            scene.order = scenesData[index]['order']
            db.session.add(scene)
        db.session.commit()
        return jsonify(data)
    if request.method == 'GET':
        project = models.Project.query.get(project_id)
        scenesData = []
        scenes = models.Scene.query.filter_by(project_id=project_id).order_by(models.Scene.order)
        for scene in scenes:
            sceneData = {'order': scene.order, 'src': scene.image_url, 'desc': scene.caption}
            scenesData.append(sceneData)
        data = {'title': project.title, 'desc': project.desc, 'scenesData': scenesData}
        return jsonify(data)

@app.route("/upload-image/<project_id>", methods=['POST'])
def create_scene(project_id):
    try:
        user = g.user
        #print(request.files)
        print(request.files)

        caption = request.form.get('caption', None)
        file = request.files.get('file', None)
        order = request.form.get('order', None)
        scene_id = request.form.get('sceneId', None)

        print(file)
        print(caption)

        filename = file.filename
        content_type = file.content_type
        content = base64.b64encode(file.read())
        key_name = storage.key_name(str(user.id), str(project_id), filename)
        storage.save_from_data(key_name, content_type, content)
        image_url = settings.AWS_STORAGE_BUCKET_URL + key_name
        if scene_id:
            scene = models.Scene.query.get(scene_id)
            scene.image_url = image_url
            scene.caption = caption
        else:
            scene = models.Scene(project_id=project_id, caption=caption, image_url=image_url, order=order)

        db.session.add(scene)
        db.session.commit()

        return jsonify({'image_url': image_url, 'caption':caption, 'sceneId':scene.id})
    except storage.StorageException as e:
        traceback.print_exc()
        return jsonify({'error': str(e), 'error_detail': e.detail})
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)})


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
        image_url = settings.AWS_STORAGE_BUCKET_URL + key_name
        scene = models.Scene(project_id=project_id, text=text, image_url=image_url)
        db.session.add(scene)
        db.session.commit()

        scenes = models.Scene.query.filter_by(project_id=project_id)

        return redirect('/home/' + str(project_id))
    except storage.StorageException as e:
        traceback.print_exc()
        return jsonify({'error': str(e), 'error_detail': e.detail})
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)})


def write_json_data(project_id):
    try:
        user = g.user

        key_name = storage.key_name(str(user.id), str(project_id), 'data.json')
        content_type =  'application/json'

        scenes = models.Scene.query.filter_by(project_id=project_id)
        data = {}
        sceneArray = []
        for scene in scenes:
            sceneDict = {'text':scene.text, 'path':scene.image_url, 'thumbnailPath':scene.image_url}
            sceneArray.append(sceneDict)
        data['scenes'] = sceneArray
        print(data)
        content = data

        storage.save_from_data(key_name, content_type, content)
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)})

def write_embed_published(project_id):
    try:
        user = g.user

        json_key_name = storage.key_name(str(user.id), str(project_id), 'data.json')
        embed_key_name = storage.key_name(str(user.id), str(project_id), 'index.html')
        content_type =  'text/html'

        content = render_template('embed.html',
            json_url=settings.AWS_STORAGE_BUCKET_URL+json_key_name
        )
        embed_url=settings.AWS_STORAGE_BUCKET_URL+embed_key_name
        storage.save_from_data(embed_key_name, 'text/html', content)
        return embed_url
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)})

@app.route('/home/<project_id>/publish', methods=['POST'])
def storymap_publish(project_id):
    """Save published storymap"""
    write_json_data(project_id)
    embed_url = write_embed_published(project_id)

        # data = _request_get_required('d')

        # key_prefix = storage.key_prefix(user['uid'], id)
        # content = json.loads(data)
        # storage.save_json(key_prefix+'published.json', content)
        #
        # user['storymaps'][id]['published_on'] = _utc_now()
        # _user.save(user)
        #
        # _write_embed_published(key_prefix, user['storymaps'][id])
        #
        # return jsonify({'meta': user['storymaps'][id]})
    return redirect(embed_url)
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
  session['credentials'] = credentials_to_dict(credentials)

  grequest = google.auth.transport.requests.Request()
  verified_jwt = google.oauth2.id_token.verify_oauth2_token(credentials.id_token,grequest)
  _user_set(issuer=verified_jwt['iss'], subject=verified_jwt['sub'])
  # For now, we will always redirect a freshly authenticated user to 'home' no matter where they were trying to go in the first place.
  return redirect(url_for('index'))

def credentials_to_dict(credentials):
  return {'token': credentials.token,
          'refresh_token': credentials.refresh_token,
          'token_uri': credentials.token_uri,
          'client_id': credentials.client_id,
          'client_secret': credentials.client_secret,
          'scopes': credentials.scopes}


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
