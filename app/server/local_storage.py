"""
"""
import os, os.path
import sys
import time
import traceback
import base64
import json
from functools import wraps
import requests
import settings
import re
from io import BytesIO
from PIL import Image

FILE_SYSTEM_ROOT="_local_storage"

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
    return '/'.join(args)

def save_from_data(key_name, content_type, content):
    """
    Save content with content-type to key_name
    TODO: some important things happening here but not in regular storage.
    Is this factored correctly? That version doesn't handle images correctly...
    """
    file_path = os.path.join(FILE_SYSTEM_ROOT,key_name)
    directory_path = os.path.split(file_path)[0]
    os.makedirs(directory_path, exist_ok=True)
    content_type = content_type.rsplit('/', 1)[0]
    if content_type == 'image':
        im = Image.open(BytesIO(base64.b64decode(content)))
        im = im.resize((int(im.width/2),int(im.height/2)),Image.ANTIALIAS)
        im.save(file_path,optimize=True, quality=65)
        # with open(file_path,'wb') as f:
        #     f.write(content)
    elif content_type == 'application':
        with open(file_path,'w') as f:
            json.dump(content, f)
    else:
        with open(file_path,'w') as f:
            f.write(content)
