from flask import request, jsonify
from app.models.favorite import Favorite
from app.models.song import Song
from app.models.user import User
from config.db_config import db


def get_favorites_by_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'Usuario no encontrado.'}), 404

        favorites = Favorite.query.filter_by(user_id=user_id).all()
        
        # Crea una lista de canciones
        songs = []
        for favorite in favorites:
            songs.append(favorite.to_dict().get('song'))

        return jsonify({'user': user.to_dict(), 'songs': songs}), 200
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500


def register_favorite():
    try:
        data = request.json
        song_id = data.get('song_id')
        user_id = data.get('user_id')

        # Validar los datos recibidos
        if not song_id or not user_id:
            return jsonify({'message': 'El song_id y el user_id son necesarios.'}), 400

        # Verificar si la canción y la usuario existen
        song = Song.query.get(song_id)
        user = User.query.get(user_id)

        if not song:
            return jsonify({'message': 'Canción no encontrada.'}), 404
        if not user:
            return jsonify({'message': 'Usuario no encontrado.'}), 404

        # Verificar si la canción ya está en los favoritos del usuario
        existing_favorite = Favorite.query.filter_by(song_id=song_id, user_id=user_id).first()
        if existing_favorite:
            return jsonify({'message': 'La canción ya está en los favoritos del usuario.'}), 400

        # Crear y agregar la nueva entrada a la tabla de favoritos
        new_favorite = Favorite(song_id=song_id, user_id=user_id)
        db.session.add(new_favorite)
        db.session.commit()

        return jsonify(new_favorite.to_dict()), 201
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500


def delete_favorite(song_id, user_id):
    try:
        # Verificar si el usuario existe
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'Usuario no encontrado.'}), 404

        # Verificar si la canción existe
        song = Song.query.get(song_id)
        if not song:
            return jsonify({'message': 'Canción no encontrada.'}), 404

        # Buscar la entrada de favoritos para la canción y el usuario especificado
        favorite = Favorite.query.filter_by(song_id=song_id, user_id=user_id).first()
        if not favorite:
            return jsonify({'message': 'Canción no encontrada en los favoritos del usuario.'}), 404

        # Eliminar la entrada de favoritos
        db.session.delete(favorite)
        db.session.commit()

        return jsonify({'message': 'Canción eliminada de los favoritos exitosamente.'}), 200
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500
