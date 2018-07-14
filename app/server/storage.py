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
from pathlib import Path
from boto.exception import S3ResponseError
from boto.s3.connection import OrdinaryCallingFormat
import requests
import settings

# Get settings module
if not settings.TEST_MODE:
    _conn = boto.connect_s3(
        settings.AWS_ACCESS_KEY_ID,
        settings.AWS_SECRET_ACCESS_KEY,
        calling_format=OrdinaryCallingFormat())
    _bucket = _conn.get_bucket(settings.AWS_STORAGE_BUCKET_NAME)


class StorageException(Exception):
    """
    Adds 'detail' attribute to contain response body
    """

    def __init__(self, message, detail):
        super(Exception, self).__init__(message)
        self.detail = detail


class StorageBase(object):
    def save(self, name, content_type, content):
        """Given some content, save it to the storage under name
        so that it can reliably be retrieved"""
        raise NotImplementedError

    def save_as_json(self, name, d):
        self.save(name, "application/json", json.dumps(d, indent=2).encode('utf-8'))

    def key_id(self):
        "Get id for key"
        return repr(time.time())

    def key_name(self, *args):
        return '/'.join(args)


class S3Storage(StorageBase):
    def __init__(self,
                 bucket=None,
                 url_root=None,
                 prefix=None):
        self._conn = boto.connect_s3(
            settings.AWS_ACCESS_KEY_ID,
            settings.AWS_SECRET_ACCESS_KEY,
            calling_format=OrdinaryCallingFormat())
        self._bucket = _conn.get_bucket(bucket)
        self.url_root = url_root
        self.prefix = prefix

    def save(self, name, content_type, content):
        """
        Save content with content-type to key_names
        TODO: probably can't use save_contents_from_string for images
        """
        try:
            key = self._bucket.get_key(key_name)
            if not key:
                key = self._bucket.new_key(key_name)
                key.content_type = content_type
            key.set_contents_from_string(content, policy='public-read')
        except S3ResponseError as e:
            print(traceback.format_exc())
            raise StorageException(e.message, e.body)


class LocalStorage(StorageBase):
    def __init__(self, app):
        self.storage_root = Path(app.static_folder, 'local')

    def save(self, name, content_type, content):
        fq_path = self.storage_root.joinpath(name)
        fq_path.parent.mkdir(parents=True, exist_ok=True)
        fq_path.open('wb').write(content)
