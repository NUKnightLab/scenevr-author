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
import boto3
from pathlib import Path
from botocore.exceptions import ClientError
import settings
from io import BytesIO
from PIL import Image

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
        # Credentials resolve through boto3's default provider chain: the
        # environment in development, the EC2 instance role via IMDS in
        # production. Role credentials carry a session token and expire, so
        # they must not be overridden here.
        self._conn = boto3.client('s3')
        self._bucket_name = bucket
        # Fail at startup rather than on the first save if the bucket is
        # unreachable, matching the old get_bucket() behaviour.
        self._conn.head_bucket(Bucket=bucket)
        self.url_root = url_root
        self.prefix = prefix

    def save(self, key_name, content_type, content):
        """
        Save content with content-type to key_name
        """
        if self.prefix:
            key_name = '{}/{}'.format(self.prefix, key_name)
        if isinstance(content, str):
            content = content.encode('utf-8')
        try:
            self._conn.put_object(
                Bucket=self._bucket_name,
                Key=key_name,
                Body=content,
                ContentType=content_type,
                ACL='public-read')
        except ClientError as e:
            print(traceback.format_exc())
            error = e.response.get('Error', {})
            raise StorageException(error.get('Message', str(e)), error)

    def _resize_scene_images(self, name, content_type, content):
        sizes = {
            'thumbnail': 540,
            's': 1024,
            'm': 2048,
            'l': 4096
        }
        orig = Image.open(BytesIO(content))
        w, h = orig.size
        for tag, new_height in sizes.items():
            new_size = compute_size(w, h, new_height)
            variant_name = "{}/image-{}.jpg".format(name, tag)
            copy = orig.resize(new_size, Image.LANCZOS)
            variant_content = BytesIO()
            copy.save(variant_content, format='JPEG', quality=60)
            variant_content.seek(0)
            self.save(variant_name, content_type, variant_content.getvalue())


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
