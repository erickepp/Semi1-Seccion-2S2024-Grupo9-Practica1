from flask import Blueprint, request, jsonify
from app.controllers import playlist_controller as pc

bp = Blueprint('playlist_routes', __name__)


# GET /playlists?user_id=value
@bp.route('/playlists', methods=['GET'])
def get_playlists_by_user_route():
    user_id = request.args.get('user_id', type=int)
    if not user_id:
        return jsonify({'message': 'ID de usuario es requerido.'}), 400
    return pc.get_playlists_by_user(user_id)


@bp.route('/playlists/<int:playlist_id>', methods=['GET'])
def get_playlist_route(playlist_id):
    return pc.get_playlist(playlist_id)


@bp.route('/playlists', methods=['POST'])
def post_playlist_route():
    return pc.register_playlist()


@bp.route('/playlists/<int:playlist_id>', methods=['PATCH'])
def patch_playlist_route(playlist_id):
    return pc.update_playlist(playlist_id)


@bp.route('/playlists/<int:playlist_id>', methods=['DELETE'])
def delete_playlist_route(playlist_id):
    return pc.delete_playlist(playlist_id)
