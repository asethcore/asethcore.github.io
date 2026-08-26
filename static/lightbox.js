(function () {
  const overlay = document.createElement("div");
  overlay.className = "lightbox";

  const img = document.createElement("img");
  overlay.appendChild(img);

  document.body.appendChild(overlay);

  function open(src) {
    img.src = src;
    overlay.classList.add("open");
  }

  function close() {
    overlay.classList.remove("open");
  }

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  document.addEventListener("click", (e) => {
    const link = e.target.closest(".photo-item, .image-item");
    if (link) {
      e.preventDefault();
      open(link.href);
    }
  });
})();
