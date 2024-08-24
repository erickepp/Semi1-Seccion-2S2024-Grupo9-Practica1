from flask import Flask
from flask_cors import CORS
from config.db_config import init_db
from app.routes import user_routes
from app.routes import song_routes

def create_app():
    app = Flask(__name__)
    app.url_map.strict_slashes = False
    CORS(app)

    init_db(app)

    app.register_blueprint(user_routes.bp)
    app.register_blueprint(song_routes.bp)

    return app
