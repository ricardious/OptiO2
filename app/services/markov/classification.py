import numpy as np
from .chain import powers_diag


def f_series_from_diagonals(diag_list, i):
    f = []
    for n in range(1, len(diag_list) + 1):
        pii_n = diag_list[n - 1][i]
        corr = 0.0
        for k in range(1, n):
            corr += f[k - 1] * diag_list[n - k - 1][i]
        f.append(max(0.0, pii_n - corr))
    return f


def estimate_recurrence(A, max_n=30):
    diags = powers_diag(A, max_n)
    n = len(A)
    f_sum = np.zeros(n)
    f_series = []
    for i in range(n):
        fi = f_series_from_diagonals(diags, i)
        f_series.append([float(x) for x in fi])
        f_sum[i] = float(sum(fi))
    return f_sum.tolist(), f_series


def period_for_state(A, i, max_n=50, tol=1e-15):
    A = np.array(A, dtype=float)
    Tn = np.eye(A.shape[0])
    hits = []
    for n in range(1, max_n + 1):
        Tn = Tn @ A
        if Tn[i, i] > tol:
            hits.append(n)
    if not hits:
        return None
    from math import gcd
    d = hits[0]
    for h in hits[1:]:
        d = gcd(d, h)
    return int(d)
