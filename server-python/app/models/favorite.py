from config.db_config import db

class Favorite(db.Model):
    __tablename__ = 'Me_gusta'

    song_id = db.Column('id_cancion', db.Integer, db.ForeignKey('Cancion.id_cancion', ondelete='CASCADE'), primary_key=True)
    user_id = db.Column('id_usuario', db.Integer, db.ForeignKey('Usuario.id_usuario', ondelete='CASCADE'), primary_key=True)

    song = db.relationship('Song', backref='favorites', lazy=True)
    user = db.relationship('User', backref='favorites', lazy=True)

    def to_dict(self):
        return {
            'song': self.song.to_dict(),
            'user': self.user.to_dict()
        }
