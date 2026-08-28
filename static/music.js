let currentSong = "";
let currentProgress = 0;
let currentDuration = 0;
let progressAnimId = null;
let lastTickTime = 0;

function renderProgress() {
  const track = document.querySelector(".music-progress-track");
  if (!track) return;

  const pct =
    currentDuration > 0 ? (currentProgress / currentDuration) * 100 : 0;
  track.style.setProperty(
    "--progress",
    `${Math.min(100, Math.max(0, pct))}%`
  );
}

function startProgressTicker() {
  stopProgressTicker();
  lastTickTime = performance.now();

  function loop(now) {
    if (currentDuration > 0) {
      currentProgress += now - lastTickTime;
      lastTickTime = now;
      if (currentProgress >= currentDuration) currentProgress = currentDuration;
      renderProgress();
    }
    progressAnimId = requestAnimationFrame(loop);
  }

  progressAnimId = requestAnimationFrame(loop);
}

function stopProgressTicker() {
  if (progressAnimId) {
    cancelAnimationFrame(progressAnimId);
    progressAnimId = null;
  }
}

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

        if (title._stopAnimation) {
          title._stopAnimation();
        }

        title.innerHTML = `<span>${music.title}</span>`;
        animateTitle(title);
      }

      artist.textContent = music.artist;

      bg.style.backgroundImage = `url(${music.cover})`;

      if (cover) {
        cover.src = music.cover;
      }

      if (titleLink) {
        titleLink.href = music.spotify_url;
      }

      currentProgress = music.progress_ms || 0;
      currentDuration = music.duration_ms || 0;
      renderProgress();
      startProgressTicker();
    } else {
      currentSong = "";

      if (title._stopAnimation) {
        title._stopAnimation();
      }

      box.classList.remove("playing");

      title.textContent = "listening";
      artist.textContent = "to the world around him";

      bg.style.backgroundImage = "";

      if (cover) {
        cover.src = "/blogs/images/cover.jpg";
      }

      if (titleLink) {
        titleLink.removeAttribute("href");
      }

      stopProgressTicker();
      currentProgress = 0;
      currentDuration = 0;
      renderProgress();
    }
  } catch (err) {
    console.error(err);
  }
}

function animateTitle(el) {
  const span = el.querySelector("span");

  if (!span) return;

  const distance = span.scrollWidth - el.clientWidth;

  if (distance <= 0) return;

  let running = true;

  el._stopAnimation = () => {
    running = false;
  };

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function move(ms, transform) {
    return new Promise((resolve) => {
      span.style.transition = `transform ${ms}ms linear`;
      span.style.transform = transform;
      void span.offsetWidth;
      setTimeout(resolve, ms + 60);
    });
  }

  async function loop() {
    span.style.transition = "none";
    span.style.transform = "translateX(0)";
    void span.offsetWidth;

    while (running) {
      await sleep(2000);
      if (!running) break;

      await move((distance / 35) * 1000, `translateX(-${distance}px)`);

      if (!running) break;

      await sleep(2000);
      if (!running) break;

      await move((distance / 50) * 1000, "translateX(0)");
    }
  }

  loop();
}

(function () {
  const box = document.querySelector(".music-box");
  const title = document.querySelector(".music-title");

  if (!box || !title) return;

  box.addEventListener("mouseenter", () => {
    if (title._stopAnimation) {
      title._stopAnimation();
    }
  });

  box.addEventListener("mouseleave", () => {
    if (title._stopAnimation) {
      title._stopAnimation();
    }
    setTimeout(() => {
      animateTitle(title);
    }, 500);
  });
})();

updateMusic();
setInterval(updateMusic, 2000);

