document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("graph-container");
  if (!container) {
    console.warn("graph.js: #graph-container not found");
    return;
  }

  if (typeof ForceGraph === "undefined") {
    console.error("graph.js: ForceGraph library not loaded");
    return;
  }

  const rect = container.getBoundingClientRect();
  const width = rect.width || 200;
  const height = rect.height || 200;

  fetch("/graph.json")
    .then((res) => {
      if (!res.ok) throw new Error("failed to load graph.json");
      return res.json();
    })
    .then((data) => {
      let hoverNode = null;
      const highlightNodes = new Set();
      const highlightLinks = new Set();

      const Graph = ForceGraph()(container)
        .width(width)
        .height(height)
        .graphData(data)
        .nodeRelSize(2.5)

        .onNodeHover((node) => {
          highlightNodes.clear();
          highlightLinks.clear();

          if (node) {
            hoverNode = node;
            highlightNodes.add(node);
            data.links.forEach((link) => {
              if (link.source.id === node.id || link.target.id === node.id) {
                highlightLinks.add(link);
                highlightNodes.add(link.source);
                highlightNodes.add(link.target);
              }
            });
          } else {
            hoverNode = null;
          }

          Graph.nodeColor(Graph.nodeColor())
            .linkColor(Graph.linkColor())
            .linkWidth(Graph.linkWidth());

          container.style.cursor = node ? "pointer" : null;
        })

        .nodeColor((node) => {
          if (hoverNode) {
            if (node === hoverNode) return "#6699cc";
            if (highlightNodes.has(node)) return "#b0b0b0";
            return "rgba(200, 200, 200, 0.2)";
          }

          if (node.type === "source") return "#6699cc";
          if (node.type === "target") return "#b0b0b0";
          return "#9ccc65";
        })
        .linkColor((link) => {
          if (hoverNode) {
            return highlightLinks.has(link)
              ? "#6699cc"
              : "rgba(100, 100, 100, 0.1)";
          }
          return "#555555";
        })
        .linkWidth((link) => (highlightLinks.has(link) ? 2 : 1))

        .nodeLabel((node) => node.title || node.id)
        .onNodeClick((node) => {
          if (node.url) {
            window.location.href = node.url;
          }
        });
    })
    .catch((err) => {
      console.error("graph.js: error loading graph", err);
    });
});
