from config.db_config import db

class Song(db.Model):
    __tablename__ = 'Cancion'

    song_id = db.Column('id_cancion', db.Integer, primary_key=True, autoincrement=True)
    name = db.Column('nombre', db.String(150), nullable=False)
    photo = db.Column('foto', db.Text, nullable=False)
    duration = db.Column('duracion', db.String(150), nullable=False)
    artist = db.Column('artista', db.String(150), nullable=False)
    file = db.Column('archivo', db.Text)

    def to_dict(self):
        return {
            'song_id': self.song_id,
            'name': self.name,
            'photo': self.photo,
            'duration': self.duration,
            'artist': self.artist,
            'file': self.file
        }
