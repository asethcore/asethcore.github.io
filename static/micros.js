const MICROS_URL = "https://micros.vaeseth.workers.dev";

function formatTime(iso) {
	const t = new Date(iso);
	if (isNaN(t)) return iso;

	const pad = (n) => String(n).padStart(2, "0");
	return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())} ${pad(t.getHours())}:${pad(t.getMinutes())}`;
}

async function fetchMicros() {
	try {
		const res = await fetch(MICROS_URL, { cache: "no-store" });
		if (res.ok) {
			const data = await res.json();
			if (Array.isArray(data)) return data;
		}
	} catch (err) {
		console.error(err);
	}
	return null;
}

function renderMicros(micros) {
	const list = document.querySelector(".micros");
	if (!list) return;

	if (!Array.isArray(micros) || micros.length === 0) {
		list.innerHTML = '<p class="micros-loading">couldnt fetch micros rn, check back later</p>';
		return;
	}

	list.innerHTML = "";
	for (const micro of micros.slice(0, 15)) {
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

function refreshMicros() {
	fetchMicros().then((micros) => {
		if (micros) renderMicros(micros);
	});
}

// kick off immediately (no DOM wait) so data arrives ~with first paint
const firstLoad = fetchMicros();

document.addEventListener("DOMContentLoaded", () => {
	firstLoad.then(renderMicros);
});

setInterval(refreshMicros, 5000);
