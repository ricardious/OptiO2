from flask import render_template
from . import core_bp


@core_bp.get("/")
def index():
    return render_template("pages/index.html", title="IO2 — USAC")


@core_bp.get("/about")
def about():
    return render_template("pages/index.html", title="About · IO2")  # Cambia por tu template real
