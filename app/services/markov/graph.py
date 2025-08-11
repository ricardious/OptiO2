from typing import List, Dict, Tuple, Set


def adjacency_from_T(T, tol=1e-15):
    n = len(T)
    adj = [[] for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if T[i][j] > tol:
                adj[i].append(j)
    return adj


def reachability(adj: List[List[int]]) -> List[List[bool]]:
    n = len(adj)
    R = [[False] * n for _ in range(n)]
    for s in range(n):
        stack = [s]
        seen = {s}
        while stack:
            u = stack.pop()
            R[s][u] = True
            for v in adj[u]:
                if v not in seen:
                    seen.add(v)
                    stack.append(v)
    return R


def scc_kosaraju(adj: List[List[int]]) -> List[List[int]]:
    n = len(adj)
    radj = [[] for _ in range(n)]
    for u in range(n):
        for v in adj[u]:
            radj[v].append(u)

    order = []
    seen = [False] * n

    def dfs1(u):
        seen[u] = True
        for v in adj[u]:
            if not seen[v]:
                dfs1(v)
        order.append(u)

    for u in range(n):
        if not seen[u]:
            dfs1(u)

    comp = [-1] * n
    comps = []

    def dfs2(u, cid):
        comp[u] = cid
        comps[cid].append(u)
        for v in radj[u]:
            if comp[v] == -1:
                dfs2(v, cid)

    for u in reversed(order):
        if comp[u] == -1:
            comps.append([])
            dfs2(u, len(comps) - 1)

    return comps


def scc_graph(adj, comps):
    ncomp = len(comps)
    node2c = {}
    for cid, nodes in enumerate(comps):
        for u in nodes: node2c[u] = cid
    out = [set() for _ in range(ncomp)]
    for u in range(len(adj)):
        cu = node2c[u]
        for v in adj[u]:
            cv = node2c[v]
            if cu != cv:
                out[cu].add(cv)
    return out, node2c


def closed_classes(adj) -> Tuple[List[List[int]], List[int]]:
    comps = scc_kosaraju(adj)
    out, node2c = scc_graph(adj, comps)
    closed = [i for i, outs in enumerate(out) if len(outs) == 0]
    return [comps[i] for i in closed], node2c


def absorbing_states(T, tol=1e-12) -> List[int]:
    n = len(T)
    res = []
    for i in range(n):
        row = T[i]
        if abs(row[i] - 1.0) <= tol and sum(row[j] for j in range(n) if j != i) <= tol:
            res.append(i)
    return res


def cytoscape_elements(T, tol=1e-15):
    n = len(T)
    nodes = [{"data": {"id": f"s{i + 1}", "label": f"{i + 1}"}} for i in range(n)]
    edges = []
    for i in range(n):
        for j in range(n):
            w = T[i][j]
            if w > tol:
                edges.append({"data": {"id": f"e{i + 1}-{j + 1}", "source": f"s{i + 1}", "target": f"s{j + 1}",
                                       "w": round(w, 4)}})
    return nodes + edges


def is_irreducible(adj) -> bool:
    comps = scc_kosaraju(adj)
    return len(comps) == 1 and len(comps[0]) == len(adj)
