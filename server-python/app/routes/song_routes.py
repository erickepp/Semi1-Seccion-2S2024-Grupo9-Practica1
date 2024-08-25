from flask import Blueprint
from app.controllers import song_controller as sc

bp = Blueprint('song_routes', __name__)


@bp.route('/songs', methods=['GET'])
def get_songs_route():
    return sc.get_songs()


@bp.route('/songs/<int:song_id>', methods=['GET'])
def get_song_route(song_id):
    return sc.get_song(song_id)


@bp.route('/songs', methods=['POST'])
def post_song_route():
    return sc.register_song()


@bp.route('/songs/<int:song_id>', methods=['PATCH'])
def patch_song_route(song_id):
    return sc.update_song(song_id)


@bp.route('/songs/<int:song_id>', methods=['DELETE'])
def delete_song_route(song_id):
    return sc.delete_song(song_id)
