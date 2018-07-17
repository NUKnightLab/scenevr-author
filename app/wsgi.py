import os, sys

sys.stdout = sys.stderr

from server.api import app as application

if os.environ.get('FLASK_DEBUG', '').lower() == 'true':
    from werkzeug.debug import DebuggedApplication
    application.config['DEBUG'] = True
    application = DebuggedApplication(application, evalex=True)
