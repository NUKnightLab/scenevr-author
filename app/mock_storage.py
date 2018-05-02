"""
S3-based storage backend

Object Keys
http://docs.aws.amazon.com/AmazonS3/latest/dev/UsingMetadata.html
"""
import os
import sys
import time
import traceback
import base64
import json
from functools import wraps
import requests
import settings

_bucket = settings.AWS_STORAGE_BUCKET_NAME

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

def key_prefix(*args):
    return '%s/%s/' % (settings.AWS_STORAGE_BUCKET_KEY, '/'.join(args))

def key_name(*args):
    return '%s/%s' % (settings.AWS_STORAGE_BUCKET_KEY, '/'.join(args))


@_reraise_s3response
@_mock_in_test_mode
def list_keys(key_prefix, n, marker=''):
    """
    List keys that start with key_prefix (<> key_prefix itself)
    @n = number of items to return
    @marker = name of last item
    """
    key_list = []
    i = 0

    for i, item in enumerate(_bucket.list(prefix=key_prefix, marker=marker)):
        if i == n:
            break
        if item.name == key_prefix:
            continue
        key_list.append(item)
    return key_list, (i == n)

@_mock_in_test_mode
def get_contents_as_string(src_key):
    return src_key.get_contents_as_string()

@_mock_in_test_mode
def all_keys():
    for item in _bucket.list(prefix=settings.AWS_STORAGE_BUCKET_KEY):
        if item.name == key_prefix:
            continue
        yield item.key


def save_from_data(key_name, content_type, content):
    """
    Save content with content-type to key_name
    """
    file_path = settings.AWS_STORAGE_BUCKET_NAME + "/" + key_name
    directory_path = file_path.rsplit('/', 1)[0]
    os.makedirs(directory_path, exist_ok=True)
    content_type = content_type.rsplit('/', 1)[0]
    if content_type == 'image':
        content = base64.b64decode(content)
        with open(file_path,'wb') as f:
            f.write(content)
    elif content_type == 'application':
        with open(file_path,'w') as f:
            json.dump(content, f)
    else:
        with open(file_path,'w') as f:
            f.write(content)
