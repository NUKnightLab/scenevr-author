"""Derived from
    https://www.toptal.com/aws/service-oriented-architecture-aws-lambda"""
from PIL import Image
import boto
from boto.s3.connection import OrdinaryCallingFormat
from resize import scale_jpeg_to_height
from io import BytesIO

sizes = {
    'thumbnail': 540,
    's': 1024,
    'm': 2048,
    'l': 4096
}

# How are credentials established?
conn = boto.connect_s3(calling_format=OrdinaryCallingFormat())


def _get_adjacent_key(bucket, key_name, new_file_name):
    parts = key_name.split('/')
    parts[-1] = new_file_name
    new_key_path = '/'.join(parts)


def handle_resize(event, context):
    # Obtain the bucket name and key for the event
    bucket_name = event['Records'][0]['s3']['bucket']['name']
    key_path = event['Records'][0]['s3']['object']['key']

    bucket = conn.get_bucket(bucket_name)
    key = bucket.get_key(key_path)
    input_bytes = BytesIO()
    key.get_contents_to_file(input_bytes)
    input_bytes.seek(0)
    resized = scale_jpeg_to_height(input_bytes.get_value, sizes['thumbnail'])

    new_key = _get_adjacent_key(bucket, key_path, 'image-thumbnail.jpg')
    new_key.set_contents_from_string(resized, policy='public-read')
