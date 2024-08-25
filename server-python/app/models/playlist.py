from config.db_config import db

class Playlist(db.Model):
    __tablename__ = 'Playlist'

    playlist_id = db.Column('id_playlist', db.Integer, primary_key=True, autoincrement=True)
    name = db.Column('nombre', db.String(150), nullable=False)
    description = db.Column('descripcion', db.String(150), nullable=False)
    background = db.Column('fondo', db.Text)
    user_id = db.Column('id_usuario', db.Integer, db.ForeignKey('Usuario.id_usuario', ondelete='CASCADE'), nullable=False)

    user = db.relationship('User', backref='playlists', lazy=True)

    def to_dict(self):
        return {
            'playlist_id': self.playlist_id,
            'name': self.name,
            'description': self.description,
            'background': self.background,
            'user': self.user.to_dict()
        }
