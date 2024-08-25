from flask import Blueprint, request, jsonify
from app.controllers import favorite_controller as fc

bp = Blueprint('favorite_routes', __name__)


# GET /favorites?user_id=value
@bp.route('/favorites', methods=['GET'])
def get_favorites_by_user_route():
    user_id = request.args.get('user_id', type=int)
    if not user_id:
        return jsonify({'message': 'ID de usuario es requerido.'}), 400
    return fc.get_favorites_by_user(user_id)


@bp.route('/favorites', methods=['POST'])
def register_favorite_route():
    return fc.register_favorite()


# GET /favorites?song_id=value&user_id=value
@bp.route('/favorites', methods=['DELETE'])
def delete_favorite_route():
    song_id = request.args.get('song_id')
    user_id = request.args.get('user_id')
    if not song_id or not user_id:
        return jsonify({'message': 'El song_id y el user_id son necesarios.'}), 400
    return fc.delete_favorite(song_id, user_id)
