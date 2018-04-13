
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    """Represent a user of the system."""
    id = db.Column(db.Integer, primary_key=True)
    # for Google OAuth, we can get an issuer/subject which
    # together constitute an alternate primary key
    oauth_issuer = db.Column(db.String(200))
    oauth_subject = db.Column(db.String(200))

    visits = db.Column(db.Integer, default=0)
