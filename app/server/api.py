from flask import Flask, request, session, jsonify, g, Response
from flask import render_template, send_from_directory, redirect, url_for
import os
import sys
import requests
from functools import wraps
from flask_sqlalchemy import SQLAlchemy
import traceback
import models
import settings
import re
import hashlib
from urllib.parse import urljoin

import google_auth_oauthlib.flow
import google.oauth2.credentials
import googleapiclient.discovery

import storage

from models import db

settings_module = os.environ.get('FLASK_CONFIG_MODULE', 'config.DevConfig')

# cribbed from
#   https://developers.google.com/api-client-library/python/auth/web-app
# This variable specifies the name of a file that contains the OAuth 2.0
# information for this application, including its client_id and client_secret.
CLIENT_SECRETS_FILE = "scenevr_client_secret.json"

# This OAuth 2.0 access scope allows us to request some basic information
# which, at this point, we don't.
SCOPES = ['profile']

# Initialize Flask app. Some say we should use a factory, but then I
# don't know how to do the decorators.
app = Flask(__name__, static_folder="../static", template_folder="../static")
app.secret_key = os.environ['FLASK_SECRET_KEY']
app.config.from_object(settings_module)
app.logger.debug('config: {}'.format(settings_module))
db.app = app
db.init_app(app)

if settings.TEST_MODE:   # might be more elegant to bootstrap in settings/app:
    storage_obj = storage.LocalStorage(app)
else:
    storage_obj = storage.S3Storage(bucket=settings.AWS_STORAGE_BUCKET_NAME,
                                    url_root=settings.AWS_STORAGE_BUCKET_URL,
                                    prefix=settings.AWS_STORAGE_KEY_PREFIX)


@app.context_processor
def inject_urls():
    """
    Inject urls into the templates.
    """

    return dict(
        STORAGE_URL=settings.AWS_STORAGE_BUCKET_URL,
        STATIC_MEDIA_URL=settings.STATIC_MEDIA_URL,
        SCENEVR_DIST_ROOT_URL=settings.SCENEVR_DIST_ROOT_URL
        )


def _get_uid(user_string):
    """Generate a unique identifer for user string"""
    return hashlib.md5(user_string).hexdigest()


def _user_set(issuer=None, subject=None):
    """Given a two part user ID from with OAuth, find or create that user."""
    if not issuer or not subject:
        raise Exception("Issuer and subject are required right now")
    user = models.User.query.filter_by(
        oauth_issuer=issuer, oauth_subject=subject).first()
    if user is None:
        credentials = google.oauth2.credentials.Credentials(
            **session['credentials'])

        oauth2 = googleapiclient.discovery.build(
            'oauth2', 'v2', credentials=credentials)
        userinfo = oauth2.userinfo().get().execute()
        name = userinfo['name']
        picture = userinfo['picture']
        g_id = userinfo['id']

        session['credentials'] = credentials_to_dict(credentials)

        user = models.User(oauth_issuer=issuer, oauth_subject=subject,
                           name=name, picture=picture, g_id=g_id)
        db.session.add(user)
        db.session.commit()
    g.user = user
    session['user_id'] = user.id


def _user_remove():
    try:
        session.pop('user_id')
    except KeyError:
        pass


def require_user(f):
    """
    Decorator to enforce authenticated user
    If g.user isn't present bounce to authorization
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if g.user is None:
            return redirect(url_for('google_authorize'))
        return f(*args, **kwargs)
    return decorated_function


def ajax(f):
    """Use this decorator to keep clear which endpoints are for AJAX use"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            # AJAX endpoints probably need a different way to 'require user'
            response = f(*args, **kwargs)
            return jsonify(response)
        except Exception as e:
            app.logger.warn("Ajax Error: {} {}".format(type(e), e))
            return jsonify({"error": "Ajax Error: {} {}".format(type(e), e)})
    return decorated_function


@app.before_request
def establish_user():
    """Make sure that if we have a user ID, that user is available
    to everything else in a consistent fashion."""
    user_id = session.get('user_id', None)
    if user_id:
        g.user = models.User.query.get(user_id)
    else:
        g.user = None


@app.route('/', defaults={'path': ''})
def index(path, user=None):
    return render_template('index.html')


@app.route('/demo.html')
def demo_html():
    return render_template('demo.html')


@app.route('/demo.json')
def demo_json():
    return Response(render_template('demo.json'), mimetype='application/json')


# support all of the React Router paths with one URL. They don't all
# require user though, is this going to break?
@app.route('/<path:path>')
@require_user
def router(path, user=None):
    return render_template('router.html')


@app.route("/projects", methods=['GET'])
@ajax
def projects():
    user = g.user
    user_name = user.name
    user_picture = user.picture
    projects = models.Project.query.filter_by(user_id=user.id)
    projectArray = []
    for project in projects:
        projectDict = {'id': project.id, 'title': project.title,
                       'desc': project.desc, 'date': project.date,
                       'thumbnail': project.thumbnail}
        projectArray.append(projectDict)
    return {'projectArray': projectArray, 'userName': user_name,
            'userPicture': user_picture}


@app.route('/create-project', methods=['POST'])
@ajax
def create_project():
    user = g.user
    project = models.Project(user_id=user.id)
    db.session.add(project)
    db.session.commit()
    return {'project_id': project.id,
            'title': project.title,
            'desc': project.desc}


@app.route("/project-details/<project_id>", methods=['GET', 'POST'])
@ajax
def project_details(project_id):
    if request.method == 'POST':
        data = request.get_json()
        project = models.Project.query.get(project_id)
        project.title = data['titleData']
        project.desc = data['descData']
        db.session.add(project)
        db.session.commit()
        scenesData = data['sceneData']
        scenes = models.Scene.query.filter_by(
            project_id=project_id).order_by(models.Scene.order)
        for index, scene in enumerate(scenes):
            scene.caption = scenesData[index]['desc']
            scene.image_dir = scenesData[index]['image_dir']
            db.session.add(scene)
        # update thumbnail of project to be first scene
        if scenesData:
            project = models.Project.query.get(project_id)
            project.thumbnail = scenes[0].thumbnail
            db.session.add(project)

        write_json_data(project_id)

        db.session.commit()
        # always the same as what is posted? is there a better response?
        return data
    if request.method == 'GET':
        project = models.Project.query.get(project_id)
        scenesData = []
        scenes = models.Scene.query.filter_by(
            project_id=project_id).order_by(models.Scene.order)
        for scene in scenes:
            sceneData = {'order': scene.order,
                         'image_dir': scene.image_dir,
                         'thumbnail': scene.thumbnail,
                         'desc': scene.caption}
            scenesData.append(sceneData)
        return {'title': project.title,
                'desc': project.desc,
                'scenesData': scenesData}


@app.route('/delete-scene/<project_id>', methods=['POST'])
@ajax
def delete_scene(project_id):
    data = request.get_json()
    order = data['sceneOrder']
    scene = models.Scene.query.filter_by(
        project_id=project_id, order=order).first()
    db.session.delete(scene)
    db.session.commit()
    return {'order': order}


@app.route("/upload-image/<project_id>/<order>", methods=['GET'])
@ajax
def get_scene(project_id, order):
    scene = models.Scene.query.filter_by(
        project_id=project_id, order=order).first()
    if not scene:
        data = {'scene_exists': 'False'}
    else:
        data = {'scene_exists': 'True', 'scene_id': scene.id,
                'scene_thumbnail': scene.thumbnail, 'desc': scene.caption}
    return data


@app.route("/upload-image/<project_id>/<order>", methods=['POST'])
@ajax
def create_scene(project_id, order):
    try:
        user = g.user

        project = models.Project.query.get(project_id)
        if project.user != user:
            raise Exception("You don't have permission to change that project")
        caption = request.form.get('caption', None)
        file = request.files.get('file', None)
        order = int(request.form['order'])

        filename = file.filename
        content_type = file.content_type
        content = file.read()
        key_name = storage_obj.key_name(
            str(user.id), str(project_id), filename)
        storage_obj.save_scene_images(key_name, content_type, content)
        image_dir = urljoin(settings.AWS_STORAGE_BUCKET_URL, key_name)
        if not image_dir.endswith('/'):
            image_dir = "{}/".format(image_dir)

        scene = models.Scene.query.filter_by(
            project_id=project_id, order=order).first()
        if scene:
            scene.image_dir = image_dir
            scene.caption = caption
        else:
            scene = models.Scene(
                project=project,
                caption=caption,
                image_dir=image_dir,
                order=order)

        db.session.add(scene)

        if scene.order == 0:
            project.thumbnail = scene.thumbnail
            db.session.add(project)

        db.session.commit()

        write_json_data(project_id)

        return {'image_dir': image_dir,
                'caption': caption,
                'sceneId': scene.id}
    except storage.StorageException as e:
        traceback.print_exc()
        return {'error': str(e), 'error_detail': e.detail}
    except Exception as e:
        traceback.print_exc()
        return {'error': str(e)}


@app.route('/publish/<project_id>', methods=['POST'])
@ajax
def publish_project(project_id):
    """Save published project"""
    write_json_data(project_id)
    embed_url = write_embed_published(project_id)

    return {'embed_url': embed_url}


def write_json_data(project_id):
    user = g.user
    project = models.Project.query.get(project_id)
    data = {
        'title': project.title,
        'desc': project.desc
    }
    sceneArray = []
    for scene in project.scenes:
        sceneDict = {'caption': scene.caption,
                     'image_dir': scene.image_dir,
                     'thumbnailPath': scene.thumbnail}
        sceneArray.append(sceneDict)
    data['scenes'] = sceneArray

    key_name = storage_obj.key_name(
        str(user.id), str(project_id), 'data.json')

    storage_obj.save_as_json(key_name, data)


def write_embed_published(project_id):
    """Create or update the embed HTML page which hosts the given project ID.
       Assumes that the project data has already been written and its
       representation can be found at a predictable place. As this is though,
       why not just leave it relative in the template?
       TODO: Consider doing just that.
    """
    user = g.user

    json_key_name = storage_obj.key_name(
        str(user.id), str(project_id), 'data.json')
    embed_key_name = storage_obj.key_name(
        str(user.id), str(project_id), 'index.html')

    content = render_template('embed.html',
                              json_url=urljoin(
                                    settings.AWS_STORAGE_BUCKET_URL,
                                    json_key_name
                              ),
                              scenevr_dist_root_url=settings.SCENEVR_DIST_ROOT_URL)
    embed_url = urljoin(settings.AWS_STORAGE_BUCKET_URL, embed_key_name)
    storage_obj.save(embed_key_name, 'text/html', content)
    return embed_url


@app.route("/logout/")
def logout():
    _user_remove()
    return_url = urljoin(request.base_url,'/')
    return redirect("https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue={}".format(return_url))


@app.route('/google/authorize')
def google_authorize():
    """Begin the OAuth process. Assumes Google for now."""
    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE, scopes=SCOPES)

    flow.redirect_uri = url_for('google_authorized', _external=True)

    authorization_url, state = flow.authorization_url(
        # Enable offline access so that you can refresh an access token without
        # re-prompting the user for permission. Recommended for web server apps
        access_type='offline',
        # Enable incremental authorization. Recommended as a best practice.
        include_granted_scopes='true')

    # Store the state so the callback can verify the auth server response.
    session['state'] = state

    return redirect(authorization_url)


@app.route('/google/authorized')
def google_authorized():
    """Post authentication callback. This application URL must also be whitelisted
    with the Google OAuth credentials used to create CLIENT_SECRETS_FILE."""
    import google.oauth2.id_token
    import google.auth.transport.requests
    from oauthlib.oauth2.rfc6749.errors import OAuth2Error
    try:
        # Specify the state when creating the flow in the callback so that it
        # can be verified in the authorization server response.
        state = session['state']

        flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
            CLIENT_SECRETS_FILE, scopes=SCOPES, state=state)
        flow.redirect_uri = url_for('google_authorized', _external=True)

        # Use the authorization server's response to fetch the OAuth 2.0 tokens
        authorization_response = request.url
        flow.fetch_token(authorization_response=authorization_response)

        # Store credentials in the session.
        # ACTION ITEM: In a production app, you likely want to save these
        #              credentials in a persistent database instead.
        credentials = flow.credentials
        session['credentials'] = credentials_to_dict(credentials)

        grequest = google.auth.transport.requests.Request()
        verified_jwt = google.oauth2.id_token.verify_oauth2_token(
            credentials.id_token, grequest)
        _user_set(issuer=verified_jwt['iss'], subject=verified_jwt['sub'])
        # For now, we will always redirect a freshly authenticated user to
        # 'home' no matter where they were trying to go in the first place.
        return redirect(url_for('router', path="list-projects"))
    except OAuth2Error as e:
        app.logger.warn("Error with authorization: {} {}".format(type(e), e))
        # should reset redirect url and then bounce to auth again
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
        print("""Can't find SSL files. See README for instructions, or make sure
        you're running from the correct directory.""")
        sys.exit()
