"""
S3-based storage backend

Object Keys
http://docs.aws.amazon.com/AmazonS3/latest/dev/UsingMetadata.html
"""
import os
import sys
import time
import traceback
import json
from functools import wraps
import boto
from moto import mock_s3
from boto.exception import S3ResponseError
from boto.s3.connection import OrdinaryCallingFormat
import requests
import settings

# Get settings module
if settings.TEST_MODE:
    _mock = mock_s3()
    _mock.start()

    _conn = boto.connect_s3()
    _bucket = _conn.create_bucket(settings.AWS_STORAGE_BUCKET_NAME)

    _mock.stop()
else:
    _conn = boto.connect_s3(
            settings.AWS_ACCESS_KEY_ID,
            settings.AWS_SECRET_ACCESS_KEY, calling_format=OrdinaryCallingFormat())
    _bucket = _conn.get_bucket(settings.AWS_STORAGE_BUCKET_NAME)

class StorageException(Exception):
    """
    Adds 'detail' attribute to contain response body
    """
    def __init__(self, message, detail):
        super(Exception, self).__init__(message)
        self.detail = detail


def _mock_in_test_mode(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if settings.TEST_MODE:
            _mock.start(reset=False)
            result = f(*args, **kwargs)
            _mock.stop()
            return result
        else:
            return f(*args, **kwargs)
    return decorated_function


def _reraise_s3response(f):
    """Decorator trap and re-raise S3ResponseError as StorageException"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except S3ResponseError as e:
            print(traceback.format_exc())
            raise StorageException(e.message, e.body)
    return decorated_function


def key_id():
    """
    Get id for key
    """
    return repr(time.time())

def key_name(*args):
    return '%s/%s' % (settings.AWS_STORAGE_BUCKET_KEY, '/'.join(args))


@_reraise_s3response
@_mock_in_test_mode
def list_key_names(key_prefix, n, marker=''):
    """
    List key names that start with key_prefix (<> key_prefix itself)
    @n = number of items to return
    @marker = name of last item
    """
    name_list = []
    i = 0

    for i, item in enumerate(_bucket.list(prefix=key_prefix, marker=marker)):
        if i == n:
            break
        if item.name == key_prefix:
            continue
        name_list.append(item.name)
    return name_list, (i == n)


@_reraise_s3response
@_mock_in_test_mode
def save_from_data(key_name, content_type, content):
    """
    Save content with content-type to key_name
    """
    key = _bucket.get_key(key_name)
    if not key:
        key = _bucket.new_key(key_name)
        key.content_type = content_type
    key.set_contents_from_string(content, policy='public-read')
