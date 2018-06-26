"""
base configuration file
"""
from os.path import abspath, dirname, join
from os import environ as env

TEST_MODE = env.get('TEST_MODE') == 'True'

CORE_ROOT = dirname(abspath(__file__))
PROJECT_ROOT = dirname(CORE_ROOT)

SECRET_KEY = env['FLASK_SECRET_KEY']

try:
    AWS_STORAGE_BUCKET_NAME = env['AWS_STORAGE_BUCKET_NAME']
    AWS_STORAGE_BUCKET_URL = env['AWS_STORAGE_BUCKET_URL']
    AWS_STORAGE_BUCKET_KEY = env['AWS_STORAGE_BUCKET_KEY']
except KeyError as e:
    if not TEST_MODE:
        print("Missing environment variable {}".format(e))
        import sys; sys.exit(-1)

AWS_ACCESS_KEY_ID = env['AWS_ACCESS_KEY_ID']
AWS_SECRET_ACCESS_KEY = env['AWS_SECRET_ACCESS_KEY']
