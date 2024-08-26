from config.db_config import db

class SongPlaylist(db.Model):
    __tablename__ = 'Lista_canciones'

    song_id = db.Column('id_cancion', db.Integer, db.ForeignKey('Cancion.id_cancion', ondelete='CASCADE'), primary_key=True)
    playlist_id = db.Column('id_playlist', db.Integer, db.ForeignKey('Playlist.id_playlist', ondelete='CASCADE'), primary_key=True)

    song = db.relationship('Song', backref='playlists', lazy=True)
    playlist = db.relationship('Playlist', backref='songs', lazy=True)

    def to_dict(self):
        return {
            'song': self.song.to_dict(),
            'playlist': self.playlist.to_dict()
        }
