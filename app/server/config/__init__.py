from os import environ
class Config(object):
    DEBUG=True
    # TODO use repo directory instead of tmp if we can get it from flask app.instance_path
    # or maybe just use Postgres
    SQLALCHEMY_DATABASE_URI = environ.get('DATABASE_URI','sqlite:////tmp/scenevr.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    LEVEL = 'default'

class DevConfig(Config):
    DEBUG=True
    LEVEL = 'dev'
