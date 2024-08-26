from flask import request, jsonify
from app.models.song_playlist import SongPlaylist
from app.models.playlist import Playlist
from app.models.song import Song
from app.models.user import User
from config.db_config import db


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


def register_song_playlist():
    try:
        data = request.json
        song_id = data.get('song_id')
        playlist_id = data.get('playlist_id')

        # Validar los datos recibidos
        if not song_id or not playlist_id:
            return jsonify({'message': 'El song_id y el playlist_id son necesarios.'}), 400

        # Verificar si la canción y la playlist existen
        song = Song.query.get(song_id)
        playlist = Playlist.query.get(playlist_id)

        if not song:
            return jsonify({'message': 'Canción no encontrada.'}), 404
        if not playlist:
            return jsonify({'message': 'Playlist no encontrada.'}), 404

        # Verificar si la canción ya está en la playlist
        existing_song_playlist = SongPlaylist.query.filter_by(song_id=song_id, playlist_id=playlist_id).first()
        if existing_song_playlist:
            return jsonify({'message': 'La canción ya está en la playlist.'}), 400

        # Crear y agregar la nueva entrada a la tabla de SongPlaylist
        song_playlist = SongPlaylist(song_id=song_id, playlist_id=playlist_id)
        db.session.add(song_playlist)
        db.session.commit()

        return jsonify(song_playlist.to_dict()), 201
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500


def delete_song_playlist(song_id, playlist_id):
    try:
        # Verificar si la canción existe
        song = Song.query.get(song_id)
        if not song:
            return jsonify({'message': 'Canción no encontrada.'}), 404

        # Verificar si la playlist existe
        playlist = Playlist.query.get(playlist_id)
        if not playlist:
            return jsonify({'message': 'Playlist no encontrada.'}), 404

        # Buscar la entrada en SongPlaylist para la canción y la playlist especificadas
        song_playlist = SongPlaylist.query.filter_by(song_id=song_id, playlist_id=playlist_id).first()
        if not song_playlist:
            return jsonify({'message': 'La canción no se encuentra en la playlist.'}), 404

        # Eliminar la entrada de SongPlaylist
        db.session.delete(song_playlist)
        db.session.commit()

        return jsonify({'message': 'Canción eliminada de la playlist exitosamente.'}), 200
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500
