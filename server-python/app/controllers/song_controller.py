from flask import request, jsonify
from app.models.song import Song
from config.db_config import db
from config.s3_config import S3


def get_songs():
    try:
        songs = Song.query.all()
        return jsonify([song.to_dict() for song in songs]), 200
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500


def get_song(song_id):
    try:
        song = Song.query.get(song_id)
        if song:
            return jsonify(song.to_dict()), 200
        else:
            return jsonify({'message': 'Canción no encontrada.'}), 404
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500


def register_song():
    try:
        data = request.form
        name = data.get('name')
        duration = data.get('duration')
        artist = data.get('artist')

        photo = request.files.get('photo')
        file = request.files.get('file')

        # Validar la entrada
        if not all([name, duration, artist, photo, file]):
            return jsonify({'message': 'Todos los campos son necesarios.'}), 400
        
        # Subir archivos al bucket
        s3 = S3()
        photo_url = s3.upload_file(photo, f'Fotos/{photo.filename}')
        file_url = s3.upload_file(file, f'Canciones/{file.filename}')

        # Crear y agregar el nuevo usuario a la base de datos
        new_song = Song(
            name=name,
            photo=photo_url,
            duration=duration,
            artist=artist,
            file=file_url
        )
        db.session.add(new_song)
        db.session.commit()

        return jsonify(new_song.to_dict()), 201
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500


def update_song(song_id):
    try:
        song = Song.query.get(song_id)
        if not song:
            return jsonify({'message': 'Canción no encontrada.'}), 404

        # Validar y actualizar los campos proporcionados
        data = request.form
        name = data.get('name')
        duration = data.get('duration')
        artist = data.get('artist')

        photo = request.files.get('photo')
        file = request.files.get('file')

        if name:
            song.name = name
        if duration:
            song.duration = duration
        if artist:
            song.artist = artist
        if photo:
            photo_url = S3().upload_file(photo, f'Fotos/{photo.filename}')
            song.photo = photo_url
        if photo:
            file_url = S3().upload_file(file, f'Canciones/{file.filename}')
            song.file = file_url

        db.session.commit()
        return jsonify(song.to_dict()), 200
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500


def delete_song(song_id):
    try:
        song = Song.query.get(song_id)
        if not song:
            return jsonify({'message': 'Canción no encontrada.'}), 404

        # Eliminar la canción de la base de datos
        db.session.delete(song)
        db.session.commit()

        return jsonify({'message': 'Canción eliminada exitosamente.'}), 200
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500
