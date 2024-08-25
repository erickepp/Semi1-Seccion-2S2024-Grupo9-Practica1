from flask import request, jsonify
from app.models.playlist import Playlist
from config.db_config import db
from config.s3_config import S3


def get_playlists_by_user(user_id):
    try:
        playlists = Playlist.query.filter_by(user_id=user_id).all()
        if not playlists:
            return jsonify([]), 404

        return jsonify([playlist.to_dict() for playlist in playlists]), 200
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500


def get_playlist(playlist_id):
    try:
        playlist = Playlist.query.get(playlist_id)
        if playlist:
            return jsonify(playlist.to_dict()), 200
        else:
            return jsonify({'message': 'Playlist no encontrada.'}), 404
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500


def register_playlist():
    try:
        data = request.form
        name = data.get('name')
        description = data.get('description')
        user_id = data.get('user_id')

        background = request.files.get('background')

        # Validar la entrada
        if not all([name, description, user_id, background]):
            return jsonify({'message': 'Todos los campos son necesarios.'}), 400

        # Subir fondo al bucket si se proporciona
        background_url = S3().upload_file(background, f'Fotos/{background.filename}')

        # Crear y agregar la nueva playlist a la base de datos
        new_playlist = Playlist(
            name=name,
            description=description,
            background=background_url,
            user_id=user_id
        )
        db.session.add(new_playlist)
        db.session.commit()

        return jsonify(new_playlist.to_dict()), 201
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500


def update_playlist(playlist_id):
    try:
        playlist = Playlist.query.get(playlist_id)
        if not playlist:
            return jsonify({'message': 'Playlist no encontrada.'}), 404

        # Validar y actualizar los campos proporcionados
        data = request.form
        name = data.get('name')
        description = data.get('description')

        background = request.files.get('background')

        if name:
            playlist.name = name
        if description:
            playlist.description = description
        if background:
            background_url = S3().upload_file(background, f'Fondos/{background.filename}')
            playlist.background = background_url

        db.session.commit()
        return jsonify(playlist.to_dict()), 200
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500


def delete_playlist(playlist_id):
    try:
        playlist = Playlist.query.get(playlist_id)
        if not playlist:
            return jsonify({'message': 'Playlist no encontrada.'}), 404

        # Eliminar la playlist de la base de datos
        db.session.delete(playlist)
        db.session.commit()

        return jsonify({'message': 'Playlist eliminada exitosamente.'}), 200
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500
