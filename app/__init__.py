from flask import Flask
from .config import config
import os

def create_app(config_name=None):
    app = Flask(__name__)

    # Configurations
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'default')

    app.config.from_object(config[config_name])

    @app.get("/")
    def hello_world():
        return f'Hello World! Mode: {config_name}'

    return app
