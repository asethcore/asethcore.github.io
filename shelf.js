function drawShelfLines() {
  document.querySelectorAll(".bookshelf, .bookshelf-preview").forEach((shelf) => {
    shelf.querySelectorAll(".shelf-row-line").forEach((el) => el.remove());

    const spines = Array.from(shelf.querySelectorAll(".book-spine"));
    if (spines.length === 0) return;

    const rows = {};
    spines.forEach((spine) => {
      const bottom = Math.round(spine.offsetTop + spine.offsetHeight);
      if (!rows[bottom]) rows[bottom] = [];
      rows[bottom].push(spine);
    });

    Object.keys(rows).forEach((bottom) => {
      const line = document.createElement("div");
      line.className = "shelf-row-line";
      line.style.top = bottom + "px";
      shelf.appendChild(line);
    });
  });
}

window.addEventListener("load", drawShelfLines);
window.addEventListener("resize", drawShelfLines);
