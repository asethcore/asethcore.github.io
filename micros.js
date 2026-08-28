const MICROS_URL = "https://micros.vaeseth.workers.dev";

function formatTime(iso) {
	const t = new Date(iso);
	if (isNaN(t)) return iso;

	const pad = (n) => String(n).padStart(2, "0");
	return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())} ${pad(t.getHours())}:${pad(t.getMinutes())}`;
}

async function loadMicros() {
	const list = document.querySelector(".micros");
	if (!list) return;

	let micros = [];
	try {
		const res = await fetch(MICROS_URL, { cache: "no-store" });
		if (res.ok) micros = await res.json();
	} catch (err) {
		console.error(err);
	}

	if (!Array.isArray(micros) || micros.length === 0) return;

	list.innerHTML = "";
	for (const micro of micros) {
		const article = document.createElement("article");
		article.className = "micro";

		const date = document.createElement("span");
		date.className = "micro-date";
		date.textContent = formatTime(micro.time);

		const p = document.createElement("p");
		p.textContent = micro.text;

		article.appendChild(date);
		article.appendChild(p);
		list.appendChild(article);
	}
}

loadMicros();
setInterval(loadMicros, 5000);
