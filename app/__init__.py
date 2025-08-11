import os
from flask import Flask, render_template
from .config import config
from .blueprints.core.routes import core_bp
from .blueprints.markov.routes import markov_bp


def create_app(config_name=None):
    app = Flask(__name__)

    # Configurations
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'default')

    app.config.from_object(config[config_name])

    app.register_blueprint(core_bp)
    app.register_blueprint(markov_bp, url_prefix='/markov')

    return app
