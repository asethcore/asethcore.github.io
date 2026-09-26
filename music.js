let currentSong = "";

async function updateMusic() {
  try {
    const res = await fetch(
      "https://spotify-worker.vaeseth.workers.dev?t=" + Date.now()
    );

    const music = await res.json();

    const box = document.querySelector(".music-box");
    const bg = document.querySelector(".music-background");
    const cover = document.querySelector(".music-cover");
    const title = document.querySelector(".music-title");
    const titleLink = document.querySelector(".music-title-link");
    const artist = document.querySelector(".music-artist");

    if (!box) return;

    if (music.playing) {
      box.classList.add("playing");

      if (music.title !== currentSong) {
        currentSong = music.title;
        title.textContent = music.title;
      }

      artist.textContent = music.artist;

      bg.style.backgroundImage = `url(${music.cover})`;

      if (cover) {
        cover.src = music.cover;
      }

      if (titleLink) {
        titleLink.href = music.spotify_url;
      }
    } else {
      currentSong = "";

      box.classList.remove("playing");

      title.textContent = "listening";
      artist.textContent = "to the world around him";

      bg.style.backgroundImage = "";

      if (cover) {
        cover.src = "/blogs/images/cover-idle.jpg";
      }

      if (titleLink) {
        titleLink.removeAttribute("href");
      }
    }
  } catch (err) {
    console.error(err);
  }
}

updateMusic();
setInterval(updateMusic, 5000);

