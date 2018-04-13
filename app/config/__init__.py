class Config(object):
    DEBUG=True
    SQLALCHEMY_DATABASE_URI = 'sqlite:////tmp/scenevr.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    LEVEL = 'default'

class DevConfig(Config):
    DEBUG=True
    LEVEL = 'dev'
