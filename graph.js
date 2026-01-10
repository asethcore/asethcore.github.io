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
      ForceGraph()(container)
        .width(width)
        .height(height)
        .graphData(data)
        .nodeRelSize(2.5)
        .nodeColor((node) => {
          if (node.type === "source") return "#6699cc";
          if (node.type === "target") return "#b0b0b0";
          return "#9ccc65";
        })
        .linkColor(() => "#555555")
        .nodeLabel((node) => node.title || node.id)
        .nodeAutoColorBy("group")
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
