async function updateMusic() {
    try {
        const res = await fetch("/music.json?t=" + Date.now());
        const music = await res.json();

        const box = document.querySelector(".music-box");
        const bg = document.querySelector(".music-background");
        const title = document.querySelector(".music-title");
        const artist = document.querySelector(".music-artist");

        if (!box) return;

        if (music.playing) {
            box.classList.add("playing");

            title.textContent = music.title;
            artist.textContent = music.artist;

            bg.style.backgroundImage = `url(${music.cover})`;

            box.onclick = () => window.open(music.spotify_url, "_blank");
        } else {
            box.classList.remove("playing");

            title.textContent = "listening";
            artist.textContent = "to the world around him";

            bg.style.backgroundImage = "";

            box.onclick = null;
        }
    } catch (err) {
        console.error(err);
    }
}

updateMusic();
setInterval(updateMusic, 2000);
