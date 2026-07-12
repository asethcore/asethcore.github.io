document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("graph-container");
  const expandBtn = document.getElementById("graph-expand-btn");

  if (!container || typeof ForceGraph === "undefined") return;

  fetch("/graph.json")
    .then((res) => res.json())
    .then((data) => {
      let hoverNode = null;
      const highlightNodes = new Set();
      const highlightLinks = new Set();

      const Graph = ForceGraph()(container)
        .width(container.clientWidth)
        .height(container.clientHeight)
        .graphData(data)
        .nodeRelSize(2.5)
        .nodeVal((node) => {
          if (hoverNode && (node === hoverNode || highlightNodes.has(node))) {
            return 2;
          }
          return 1;
        })
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
          if (node.url) window.location.href = node.url;
        });

      function updateGraphDimensions(w, h) {
        Graph.width(w);
        Graph.height(h);
        Graph.d3Force("center", d3.forceCenter(w / 2, h / 2));
        Graph.d3ReheatSimulation();
        Graph.zoomToFit(400, 80);
      }

      function toggleExpand(e) {
        e.stopPropagation();
        container.classList.toggle("expanded");

        setTimeout(() => {
          updateGraphDimensions(container.clientWidth, container.clientHeight);
        }, 350);
      }

      expandBtn.addEventListener("click", toggleExpand);

      document.addEventListener("click", (e) => {
        if (
          container.classList.contains("expanded") &&
          !container.contains(e.target)
        ) {
          container.classList.remove("expanded");
          setTimeout(() => {
            updateGraphDimensions(200, 200);
          }, 350);
        }
      });
    })
    .catch((err) => console.error("graph.js error:", err));
});
