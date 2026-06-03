import random
import networkx as nx
from typing import Dict, Any

def generate_subgraph(account_id: str) -> Dict[str, Any]:
    """
    Generates a simulated transaction graph (mule ring) centered around the given account_id.
    Computes GNN heuristics: PageRank, Betweenness Centrality, Degree Centrality, and Community Detection.
    """
    # Create a directed graph to represent flow of funds
    G = nx.DiGraph()
    
    # We will simulate a "Funnel" or "Layering" typology around the target account.
    G.add_node(account_id, type="target")
    
    # Generate 4-8 neighbor accounts
    num_neighbors = random.randint(4, 8)
    neighbors = [f"AC-{random.randint(100000, 999999)}" for _ in range(num_neighbors)]
    
    for neighbor in neighbors:
        G.add_node(neighbor, type="neighbor")
        # Random directed edges to simulate transactions
        if random.random() > 0.5:
            G.add_edge(neighbor, account_id, weight=random.uniform(100, 5000))
        else:
            G.add_edge(account_id, neighbor, weight=random.uniform(100, 5000))
            
    # Add some inter-connectivity between neighbors to form a 'ring'
    for _ in range(num_neighbors):
        n1 = random.choice(neighbors)
        n2 = random.choice(neighbors)
        if n1 != n2 and not G.has_edge(n1, n2):
            G.add_edge(n1, n2, weight=random.uniform(50, 1000))

    # Compute graph metrics (Network Intelligence Layer)
    try:
        pagerank = nx.pagerank(G, weight='weight')
    except Exception:
        pagerank = {n: 0.1 for n in G.nodes()}
        
    betweenness = nx.betweenness_centrality(G)
    degree_centrality = nx.degree_centrality(G)
    
    # Simple community detection (Connected components in undirected version)
    undirected_G = G.to_undirected()
    communities = list(nx.connected_components(undirected_G))
    community_map = {}
    for idx, comm in enumerate(communities):
        for node in comm:
            community_map[node] = idx

    # Calculate layout positions using a perfect shell layout
    # Center shell contains the target account, outer shell contains the neighbors
    pos = nx.shell_layout(G, nlist=[[account_id], neighbors])
    
    nodes_data = []
    for node in G.nodes():
        x, y = pos[node]
        
        # Add slight random jitter to outer shell to make it feel organic but still clean
        if node != account_id:
            x += random.uniform(-0.1, 0.1)
            y += random.uniform(-0.1, 0.1)
            
        # Map from [-1, 1] to [20, 80] to leave generous padding on all sides for the UI
        mapped_x = (x + 1) / 2 * 60 + 20
        mapped_y = (y + 1) / 2 * 60 + 20
        
        # Base risk on PageRank and if it's the target account
        base_risk = 85 if node == account_id else random.randint(40, 75)
        
        nodes_data.append({
            "id": node,
            "x": mapped_x,
            "y": mapped_y,
            "r": 12 if node == account_id else random.randint(6, 10),
            "risk": base_risk,
            "metrics": {
                "pagerank": round(pagerank.get(node, 0), 4),
                "betweenness": round(betweenness.get(node, 0), 4),
                "degree": round(degree_centrality.get(node, 0), 4),
                "community": community_map.get(node, 0)
            }
        })
        
    edges_data = []
    for u, v, d in G.edges(data=True):
        edges_data.append({
            "from": u,
            "to": v,
            "weight": round(d.get("weight", 0), 2)
        })
        
    return {
        "account_id": account_id,
        "nodes": nodes_data,
        "edges": edges_data,
        "summary": {
            "node_count": G.number_of_nodes(),
            "edge_count": G.number_of_edges(),
            "avg_pagerank": round(sum(pagerank.values()) / max(1, len(pagerank)), 4),
            "communities": len(communities)
        }
    }
