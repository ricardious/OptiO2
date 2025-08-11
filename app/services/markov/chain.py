import numpy as np


def matrix_power(A, n):
    A = np.array(A, dtype=float)
    return np.linalg.matrix_power(A, int(n))


def powers_diag(A, max_n):
    A = np.array(A, dtype=float)
    Tn = np.eye(A.shape[0])
    diags = []
    for n in range(1, max_n + 1):
        Tn = Tn @ A
        diags.append(np.diag(Tn).copy())
    return diags


def n_step_distribution(T, pi0, n):
    A = np.array(T, dtype=float)
    p0 = np.array(pi0, dtype=float)
    if p0.ndim != 1 or p0.shape[0] != A.shape[0]:
        raise ValueError("π0 debe tener dimensión N.")
    if not np.isclose(p0.sum(), 1.0):
        p0 = p0 / p0.sum()
    Tn = matrix_power(A, n)
    pn = p0 @ Tn
    return pn.tolist(), Tn.tolist()
