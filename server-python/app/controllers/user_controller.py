import bcrypt
from datetime import datetime
from flask import request, jsonify
from app.models.user import User
from config.db_config import db
from config.s3_config import S3


def get_users():
    try:
        users = User.query.all()
        return jsonify([user.to_dict() for user in users]), 200
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500


def get_user(user_id):
    try:
        user = User.query.get(user_id)
        if user:
            return jsonify(user.to_dict()), 200
        else:
            return jsonify({'message': 'Usuario no encontrado.'}), 404
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500


def register_user():
    try:
        data = request.form
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        email = data.get('email')
        password = data.get('password')
        confirm_password = data.get('confirm_password')
        birth_date_str = data.get('birth_date')

        photo = request.files.get('photo')

        # Validar la entrada
        if not all([first_name, last_name, photo, email, password, confirm_password, birth_date_str]):
            return jsonify({'message': 'Todos los campos son necesarios.'}), 400
        
        if password != confirm_password:
            return jsonify({'message': 'Las contraseñas no coinciden.'}), 400

        # Convertir la cadena de birth_date a objeto de fecha
        try:
            birth_date = datetime.strptime(birth_date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'message': 'Fecha de nacimiento inválida.'}), 400
        
        # Subir archivo al bucket
        file_url = S3().upload_file(photo, f'Fotos/{photo.filename}')

        # Encriptar la contraseña del usuario
        hashed_password_bytes = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        hashed_password = hashed_password_bytes.decode('utf-8')

        # Crear y agregar el nuevo usuario a la base de datos
        new_user = User(
            first_name=first_name,
            last_name=last_name,
            photo=file_url,
            email=email,
            password=hashed_password,
            confirm_password=hashed_password,
            birth_date=birth_date
        )
        db.session.add(new_user)
        db.session.commit()

        return jsonify(new_user.to_dict()), 201
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500


def update_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'Usuario no encontrado.'}), 404

        # Validar y actualizar los campos proporcionados
        data = request.form
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        email = data.get('email')
        password = data.get('password')

        photo = request.files.get('photo')

        if password:
            hashed_password_bytes = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            hashed_password = hashed_password_bytes.decode('utf-8')
            user.password = hashed_password
            user.confirm_password = hashed_password

        if first_name:
            user.first_name = first_name
        if last_name:
            user.last_name = last_name
        if photo:
            file_url = S3().upload_file(photo, f'Fotos/{photo.filename}')
            user.photo = file_url
        if email:
            user.email = email

        db.session.commit()
        return jsonify(user.to_dict()), 200
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500
