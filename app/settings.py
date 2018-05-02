"""
base configuration file
"""
from os.path import abspath, dirname, join
from os import environ as env

TEST_MODE = env.get('TEST_MODE') == 'True'

CORE_ROOT = dirname(abspath(__file__))
PROJECT_ROOT = dirname(CORE_ROOT)

SECRET_KEY = env['FLASK_SECRET_KEY']

if TEST_MODE:
    AWS_STORAGE_BUCKET_NAME = env['AWS_MOCK_STORAGE_BUCKET_NAME']
    AWS_STORAGE_BUCKET_URL = env['AWS_MOCK_STORAGE_BUCKET_URL']
else:
    AWS_STORAGE_BUCKET_NAME = env['AWS_STORAGE_BUCKET_NAME']
    AWS_STORAGE_BUCKET_URL = env['AWS_STORAGE_BUCKET_URL']

AWS_STORAGE_BUCKET_KEY = env['AWS_STORAGE_BUCKET_KEY']
AWS_ACCESS_KEY_ID = env['AWS_ACCESS_KEY_ID']
AWS_SECRET_ACCESS_KEY = env['AWS_SECRET_ACCESS_KEY']
