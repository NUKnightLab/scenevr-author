"""
base configuration file
"""
from os.path import abspath, dirname, join
from os import environ as env
import sys

USE_LOCAL_STORAGE = env.get('TEST_MODE') == True or env.get(
    'USE_LOCAL_STORAGE') == 'True'

CORE_ROOT = dirname(abspath(__file__))
PROJECT_ROOT = dirname(CORE_ROOT)

SECRET_KEY = env['FLASK_SECRET_KEY']

STATIC_MEDIA_URL = env['STATIC_MEDIA_URL']
AWS_STORAGE_BUCKET_URL = env['AWS_STORAGE_BUCKET_URL']
SCENEVR_DIST_ROOT_URL = env['SCENEVR_DIST_ROOT_URL']

try:
    # these aren't required for local as they're set with defaults.
    AWS_STORAGE_BUCKET_NAME = env['AWS_STORAGE_BUCKET_NAME']
    AWS_STORAGE_KEY_PREFIX = env['AWS_STORAGE_KEY_PREFIX']
except KeyError as e:
    if not USE_LOCAL_STORAGE:
        print("Missing environment variable {}".format(e))
        sys.exit(-1)

AWS_ACCESS_KEY_ID = env['AWS_ACCESS_KEY_ID']
AWS_SECRET_ACCESS_KEY = env['AWS_SECRET_ACCESS_KEY']
