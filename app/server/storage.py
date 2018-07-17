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
from io import BytesIO
from PIL import Image

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
        self.save(name, "application/json",
                  json.dumps(d, indent=2).encode('utf-8'))

    def save_scene_images(self, name, content_type, content):
        """Given an image for a scene, save it correctly,
           ensuring that variations are also created.
           (At this time, we'll probably do that all sequentially but in AWS
            we may want to offload most of the work to lambda or some other
            async process.)
        """
        orig = "{}/original.jpg".format(name)
        self.save(orig, content_type, content)
        self._resize_scene_images(name, content_type, content)

    def _resize_scene_images(name, content_type, content):
        """If the storage has responsibility for making variant images
        implement that here"""
        pass

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
        if type(content) == str:
            content = content.encode('utf-8')
        fq_path.open('wb').write(content)

    def _resize_scene_images(self, name, content_type, content):
        scene_image_dir = self.storage_root.joinpath(name)
        scene_image_dir.mkdir(parents=True, exist_ok=True)
        # TODO: actually change the images
        orig = Image.open(BytesIO(content))
        sizes = {
            'thumbnail': 540,
            's': 1024,
            'm': 2048,
            'l': 4096
        }
        orig = Image.open(scene_image_dir.joinpath('original.jpg'))
        w, h = orig.size
        for tag, new_height in sizes.items():
            new_size = compute_size(w, h, new_height)
            var_path = scene_image_dir.joinpath('image-{}.jpg'.format(tag))
            copy = orig.resize(new_size, Image.LANCZOS)
            copy.save(var_path, quality=60)


def compute_size(w, h, nh):
    ratio = w/h
    return (int(ratio*nh), int(nh))
