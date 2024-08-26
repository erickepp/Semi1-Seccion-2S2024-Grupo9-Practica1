from flask import jsonify
from app.models.song_playlist import SongPlaylist
from app.models.playlist import Playlist
from app.models.user import User


def get_songs_playlists_by_user(user_id):
    try:
        # Verifica si el usuario existe
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'Usuario no encontrado.'}), 404

        # Obtiene las playlists del usuario
        playlists = Playlist.query.filter_by(user_id=user_id).all()
        if not playlists:
            return jsonify([]), 200
        
        # Agrega canciones a cada playlist
        songs_playlists = []
        for playlist in playlists:
            playlist_dict = playlist.to_dict()
            playlist_id = playlist_dict.get('playlist_id')

            song_playlist = SongPlaylist.query.filter_by(playlist_id=playlist_id).all()

            playlist_dict.pop('user')
            playlist_dict['songs'] = [song.to_dict().get('song') for song in song_playlist]
            songs_playlists.append(playlist_dict)

        user_dict = user.to_dict()
        user_dict['playlists'] = songs_playlists

        # Devuelve la lista de playlists con canciones
        return jsonify(user_dict), 200
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500


def get_songs_playlist(playlist_id):
    try:
        # Verifica si la playlist existe
        playlist = Playlist.query.get(playlist_id)
        if not playlist:
            return jsonify({'message': 'Playlist no encontrada.'}), 404
        
        playlist_dict = playlist.to_dict()

        # Obtiene y agrega las canciones a la playlist
        songs_playlist = SongPlaylist.query.filter_by(playlist_id=playlist_id).all()
        playlist_dict['songs'] = [song.to_dict().get('song') for song in songs_playlist]

        return jsonify(playlist_dict), 200
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500
