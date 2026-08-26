const MICROS_URL = "https://micros.vaeseth.workers.dev";

const MONTHS = [
	"jan",
	"feb",
	"mar",
	"apr",
	"may",
	"jun",
	"jul",
	"aug",
	"sep",
	"oct",
	"nov",
	"dec",
];

function formatTime(iso) {
	const t = new Date(iso);
	if (isNaN(t)) return iso;

	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const day = new Date(t.getFullYear(), t.getMonth(), t.getDate());
	const days = Math.round((today - day) / 86400000);

	if (days === 0) {
		return t
			.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
			.replace(/^24:/, "00:");
	}
	if (days === 1) return "yesterday";

	const label = `${MONTHS[t.getMonth()]} ${t.getDate()}`;
	if (t.getFullYear() === now.getFullYear()) return label;
	return `${label}, ${t.getFullYear()}`;
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
