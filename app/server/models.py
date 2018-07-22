
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import relationship
from urllib.parse import urljoin
import uuid


db = SQLAlchemy()


def generate_uuid():
    return str(uuid.uuid4())


class User(db.Model):
    """Represent a user of the system."""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200))
    picture = db.Column(db.String(200))
    g_id = db.Column(db.String(200))
    # for Google OAuth, we can get an issuer/subject which
    # together constitute an alternate primary key
    oauth_issuer = db.Column(db.String(200))
    oauth_subject = db.Column(db.String(200))

    uuid = db.Column(db.String,
                     name="uuid",
                     primary_key=False,
                     default=generate_uuid)
    visits = db.Column(db.Integer, default=0)

    projects = relationship("Project", back_populates="user")

    @property
    def filepath(self):
        assert self.uuid is not None
        return self.uuid


class Project(db.Model):
    __tablename__ = 'projects'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200))
    desc = db.Column(db.String(200))
    date = db.Column(db.String(200))
    thumbnail = db.Column(db.String(200))
    uuid = db.Column(db.String, name="uuid",
                     primary_key=False, default=generate_uuid)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    user = relationship("User", back_populates="projects")
    scenes = relationship("Scene", back_populates="project", lazy="joined", order_by="Scene.order")

    @property
    def filepath(self):
        assert self.uuid is not None
        return '/'.join([self.user.filepath, self.uuid])


class Scene(db.Model):
    __tablename__ = 'scenes'

    id = db.Column(db.Integer, primary_key=True)
    image_dir = db.Column(db.String(200))
    caption = db.Column(db.String(200))
    order = db.Column(db.Integer)
    uuid = db.Column(db.String, name="uuid",
                     primary_key=False, default=generate_uuid)

    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'))
    project = relationship("Project", back_populates="scenes")

    @property
    def thumbnail(self):
        return urljoin(self.image_dir, 'image-thumbnail.jpg')

    @property
    def filepath(self):
        assert self.uuid is not None
        return '/'.join([self.project.filepath, self.uuid])
