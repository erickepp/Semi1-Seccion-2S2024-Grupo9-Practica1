from flask import Blueprint, request, jsonify
from app.controllers import song_playlist_controller as spc

bp = Blueprint('song_playlist_routes', __name__)


# GET /songs/playlists/?user_id=value
@bp.route('/songs/playlists', methods=['GET'])
def get_songs_playlists_by_user_route():
    user_id = request.args.get('user_id', type=int)
    if not user_id:
        return jsonify({'message': 'ID de usuario es requerido.'}), 400
    return spc.get_songs_playlists_by_user(user_id)


@bp.route('/songs/playlists/<int:playlist_id>', methods=['GET'])
def get_songs_playlist_route(playlist_id):
    return spc.get_songs_playlist(playlist_id)


@bp.route('/songs/playlists', methods=['POST'])
def post_song_playlist_route():
    return spc.register_song_playlist()


# GET /songs/playlists?song_id=value&playlist_id=value
@bp.route('/songs/playlists', methods=['DELETE'])
def delete_song_playlist():
    song_id = request.args.get('song_id')
    playlist_id = request.args.get('playlist_id')
    if not song_id or not playlist_id:
        return jsonify({'message': 'El song_id y el playlist_id son necesarios.'}), 400
    return spc.delete_song_playlist(song_id, playlist_id)
