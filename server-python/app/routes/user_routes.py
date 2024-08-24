from flask import Blueprint
from app.controllers import user_controller as uc

bp = Blueprint('user_routes', __name__)


@bp.route('/users', methods=['GET'])
def get_users_route():
    return uc.get_users()


@bp.route('/users/<int:user_id>', methods=['GET'])
def get_user_route(user_id):
    return uc.get_user(user_id)


@bp.route('/users', methods=['POST'])
def post_user_route():
    return uc.register_user()


@bp.route('/users/<int:user_id>', methods=['PUT'])
def put_user_route(user_id):
    return uc.update_user(user_id)
