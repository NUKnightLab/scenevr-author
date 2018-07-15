"""
base configuration file
"""
from os.path import abspath, dirname, join
from os import environ as env
import sys

TEST_MODE = env.get('TEST_MODE') == 'True'

CORE_ROOT = dirname(abspath(__file__))
PROJECT_ROOT = dirname(CORE_ROOT)

SECRET_KEY = env['FLASK_SECRET_KEY']

AWS_STORAGE_BUCKET_URL = env['AWS_STORAGE_BUCKET_URL']
SCENEVR_DIST_ROOT_URL = env['SCENEVR_DIST_ROOT_URL']

try:
    # these aren't required for local as they're set with defaults.
    AWS_STORAGE_BUCKET_NAME = env['AWS_STORAGE_BUCKET_NAME']
    AWS_STORAGE_KEY_PREFIX = env['AWS_STORAGE_KEY_PREFIX']
except KeyError as e:
    if not TEST_MODE:
        print("Missing environment variable {}".format(e))
        sys.exit(-1)

AWS_ACCESS_KEY_ID = env['AWS_ACCESS_KEY_ID']
AWS_SECRET_ACCESS_KEY = env['AWS_SECRET_ACCESS_KEY']
