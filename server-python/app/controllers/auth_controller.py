import bcrypt
from flask import request, jsonify
from app.models.user import User
 
def authenticate():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        # Validar la entrada
        if not email or not password:
            return jsonify({'message': 'Todos los campos son necesarios.'}), 400
        
        # Buscar el usuario por correo electrónico
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({'message': 'Usuario no encontrado.'}), 404
        
        # Comparar la contraseña
        if not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
            return jsonify({'message': 'Contraseña incorrecta.'}), 401
        
        return jsonify({'message': 'Autenticación exitosa.', 'user': user.to_dict()}), 200   
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500
