from marshmallow import Schema, fields, ValidationError
import numpy as np


class MarkovInputSchema(Schema):
    transition_matrix = fields.String(required=True)
    steps = fields.Integer(load_default=1)
    max_n = fields.Integer(load_default=30)
    tol = fields.Float(load_default=1e-9)

    @staticmethod
    def parse_matrix(txt: str):
        rows = [r for r in (line.strip() for line in txt.splitlines()) if r]
        m = []
        for r in rows:
            parts = [p for p in r.replace(",", " ").split() if p]
            m.append([float(x) for x in parts])
        return m

    @staticmethod
    def validate_square_stochastic(M, tol=1e-9):
        A = np.array(M, dtype=float)
        if A.ndim != 2 or A.shape[0] != A.shape[1]:
            raise ValidationError("La matriz debe ser cuadrada NxN.")
        if (A < -tol).any():
            raise ValidationError("No se permiten probabilidades negativas.")
        rowsum = A.sum(axis=1)
        if not np.allclose(rowsum, 1.0, atol=1e-8):
            raise ValidationError(f"Cada fila debe sumar 1 (actual: {rowsum}).")

    def load_and_validate(self, data):
        obj = self.load(data)
        M = self.parse_matrix(obj["transition_matrix"])
        self.validate_square_stochastic(M, tol=obj.get("tol", 1e-9))
        max_n = max(1, int(obj.get("max_n", 30)))
        return M, int(obj.get("steps", 1)), max_n
