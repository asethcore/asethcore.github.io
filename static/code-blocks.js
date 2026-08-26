const NAME_FIXUPS = {
  shellscript: "bash",
};

function setupCodeBlocks() {
  document.querySelectorAll(".post-body pre").forEach((pre) => {
    if (pre.parentElement.classList.contains("code-block-wrapper")) return;

    const code = pre.querySelector("code");
    if (!code) return;

    const rawLang = code.getAttribute("data-lang") || "text";
    const displayLabel = NAME_FIXUPS[rawLang] || rawLang;

    const header = document.createElement("div");
    header.className = "code-header";

    const label = document.createElement("span");
    label.textContent = displayLabel;

    const button = document.createElement("button");
    button.className = "code-copy-btn";
    button.textContent = "copy";
    button.addEventListener("click", () => {
      navigator.clipboard.writeText(code.textContent).then(() => {
        button.textContent = "copied";
        setTimeout(() => {
          button.textContent = "copy";
        }, 1500);
      });
    });

    header.appendChild(label);
    header.appendChild(button);

    const wrapper = document.createElement("div");
    wrapper.className = "code-block-wrapper";
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(header);
    wrapper.appendChild(pre);
  });
}

window.addEventListener("load", setupCodeBlocks);
