from PIL import Image
from io import BytesIO
import sys, re

def scale_jpeg_to_height(content, new_height, quality=60, resample_method=Image.LANCZOS):
    """Given `content` (image bytes), resize to the given `new_height` and 
       return the bytes of a JPEG resized to that height."""
    image = Image.open(BytesIO(content))
    w, h = image.size
    ratio = w/h
    new_size = (int(ratio*new_height), int(new_height))
    copy = image.resize(new_size, resample_method)
    variant_content = BytesIO()
    copy.save(variant_content, format='JPEG', quality=quality)
    variant_content.seek(0)
    return variant_content.getvalue()


def usage_error_and_exit(msg=None):
    print("To test, provide two command line arguments [file.jpg] [height]")
    if msg:
        print("Also: {}".format(msg))
    sys.exit(1)

if __name__ == '__main__':
    if len(sys.argv) != 3:
        usage_error_and_exit()
    filename, new_height = sys.argv[1:]
    if not re.match('.*\.jpg', filename):
        usage_error_and_exit("Only jpegs right now thanks")
    try:
        new_height = int(new_height)
    except Exception as e:
        usage_error_and_exit("new height should be an integer")
    infile = Image.open(filename)
    inbytes = BytesIO()
    infile.save(inbytes, format='JPEG')
    inbytes.seek(0)
    outbytes = scale_jpeg_to_height(inbytes.getvalue(), new_height)
    outfile = 'test_resized.jpg'
    with open(outfile, 'wb') as f:
        f.write(outbytes)
    print("check out {} should be {} high".format(outfile, new_height))
