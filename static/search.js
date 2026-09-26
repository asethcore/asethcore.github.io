// Site search over Zola's elasticlunr index.
(function () {
  var toggle = document.getElementById("search-toggle");
  var panel = document.getElementById("search-panel");
  var input = document.getElementById("search-input");
  var list = document.getElementById("search-results");
  if (!toggle || !panel || !input || !list) return;

  var idx = null;
  try {
    if (window.elasticlunr && window.searchIndex) idx = window.elasticlunr.Index.load(window.searchIndex);
  } catch (e) { idx = null; }

  function rel(url) {
    try { return new URL(url, window.location.origin).pathname; } catch (e) { return url; }
  }

  function snippet(body, q) {
    var text = (body || "").replace(/\s+/g, " ").trim();
    if (!text) return "";
    var i = text.toLowerCase().indexOf(q.toLowerCase().split(/\s+/)[0] || "");
    if (i === -1) return text.slice(0, 140) + (text.length > 140 ? "…" : "");
    var start = Math.max(0, i - 60);
    return (start > 0 ? "…" : "") + text.slice(start, start + 160) + "…";
  }

  function render(q) {
    list.innerHTML = "";
    q = (q || "").trim();
    if (!q) return;
    if (!idx) {
      var li = document.createElement("li");
      li.className = "search-empty";
      li.textContent = "search index still loading…";
      list.appendChild(li);
      return;
    }
    var hits = [];
    try {
      hits = idx.search(q, { fields: { title: { boost: 2 }, body: { boost: 1 } }, expand: true }).slice(0, 8);
    } catch (e) { hits = []; }
    if (!hits.length) {
      var none = document.createElement("li");
      none.className = "search-empty";
      none.textContent = "nothing found";
      list.appendChild(none);
      return;
    }
    hits.forEach(function (h) {
      var doc = {};
      try { doc = idx.documentStore.getDoc(h.ref) || {}; } catch (e) {}
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = rel(h.ref);
      var t = document.createElement("span");
      t.className = "search-title";
      t.textContent = doc.title || rel(h.ref);
      a.appendChild(t);
      var s = snippet(doc.body, q);
      if (s) {
        var sp = document.createElement("span");
        sp.className = "search-snippet";
        sp.textContent = s;
        a.appendChild(sp);
      }
      var u = document.createElement("span");
      u.className = "search-url";
      u.textContent = rel(h.ref);
      a.appendChild(u);
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  function open() {
    panel.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    input.focus();
  }

  function close(refocus) {
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    input.value = "";
    list.innerHTML = "";
    if (refocus) toggle.focus({ preventScroll: true });
  }

  function isOpen() { return !panel.hidden; }

  toggle.addEventListener("click", function (e) {
    e.stopPropagation();
    if (isOpen()) close(true);
    else open();
  });

  panel.addEventListener("click", function (e) { e.stopPropagation(); });

  document.addEventListener("click", function () { if (isOpen()) close(false); });

  input.addEventListener("input", function () { render(input.value); });

  input.addEventListener("keydown", function (e) {
    if (e.key === "Escape") close(true);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen()) { close(true); return; }
    if (e.key === "/" && !isOpen()) {
      var tag = (document.activeElement && document.activeElement.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
      open();
    }
  });
})();
