from flask import render_template, request
from . import markov_bp

from ...schemas.markov import MarkovInputSchema
from ...services.markov.graph import (
    adjacency_from_T, reachability, scc_kosaraju,
    closed_classes, absorbing_states, is_irreducible, cytoscape_elements
)
from ...services.markov.classification import estimate_recurrence, period_for_state


@markov_bp.get("/")
def markov_index():
    demo = "0.7 0.3\n0.4 0.6"
    return render_template(
        "pages/markov/index.html",
        title="Cadenas de Markov",
        form_data={"transition_matrix": demo, "max_n": 30}
    )


@markov_bp.post("/analyze")
def markov_analyze():
    schema = MarkovInputSchema()
    try:
        T, _steps, max_n = schema.load_and_validate(request.form)
    except Exception as e:
        return render_template(
            "pages/markov/index.html",
            title="Cadenas de Markov",
            error=str(e),
            form_data=request.form
        ), 400

    adj = adjacency_from_T(T)
    R = reachability(adj)
    comps = scc_kosaraju(adj)
    closed, node2c = closed_classes(adj)
    absor = absorbing_states(T)
    irreducible = is_irreducible(adj)

    periods = [period_for_state(T, i, max_n=max_n) for i in range(len(T))]

    f_sum, f_series = estimate_recurrence(T, max_n=max_n)

    cy_elements = cytoscape_elements(T)

    results = {
        "classes": [[i + 1 for i in c] for c in comps],
        "closed_classes": [[i + 1 for i in c] for c in closed],
        "absorbing": [i + 1 for i in absor],
        "irreducible": irreducible,
        "periods": {f"state_{i + 1}": p for i, p in enumerate(periods)},
        "f_sum": {f"state_{i + 1}": round(val, 6) for i, val in enumerate(f_sum)},
    }

    reminders = [
        "La matriz debe ser cuadrada (N×N).",
        "Probabilidades no negativas.",
        "Cada fila debe sumar 1 (matriz estocástica).",
        "Accesibilidad i→j: existe n con (Tⁿ)_{ij} > 0.",
        "Comunicación i ↔ j: i accesible desde j y j desde i (misma clase).",
        "Conjunto cerrado: sin salidas hacia fuera de la clase.",
        "Estado absorbente: p_ii = 1 y p_ij = 0 j≠i.",
        "Irreducible: una sola clase que contiene todos los estados.",
        "Periodo d(i)=gcd{ n : (Tⁿ)_{ii} > 0 }. d=1 ⇒ aperiódico.",
        "Recurrencia: en finito, clases cerradas ⇒ recurrentes; fuera ⇒ transitorios (f_ii<1).",
    ]

    return render_template(
        "pages/markov/index.html",
        title="Cadenas de Markov — Análisis",
        form_data=request.form,
        cy_elements=cy_elements,
        results=results,
        reminders=reminders
    )
