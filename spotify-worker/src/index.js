const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Max-Age": "86400",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...cors,
    },
  });
}

async function getAccessToken(env) {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + btoa(`${env.CLIENT_ID}:${env.CLIENT_SECRET}`),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: env.REFRESH_TOKEN,
    }),
  });
  return res.json();
}

function mapTrack(t) {
  if (!t) return null;
  return {
    title: t.name,
    artist: t.artists.map((a) => a.name).join(", "),
    cover: t.album?.images?.[0]?.url || "",
    spotify_url: t.external_urls?.spotify || "",
  };
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    const token = await getAccessToken(env);

    if (!token.access_token) {
      return json(token, 500);
    }

    const headers = { Authorization: `Bearer ${token.access_token}` };

    const [playingRes, queueRes, recentRes] = await Promise.all([
      fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        headers,
      }),
      fetch("https://api.spotify.com/v1/me/player/queue", { headers }),
      fetch("https://api.spotify.com/v1/me/player/recently-played?limit=10", {
        headers,
      }),
    ]);

    let song = null;
    if (playingRes.ok && playingRes.status !== 204) {
      song = await playingRes.json();
    }

    const body = {
      playing: song?.is_playing ?? false,
      title: song?.item?.name || "listening",
      artist:
        song?.item?.artists.map((a) => a.name).join(", ") ||
        "to the world around him",
      cover: song?.item?.album?.images?.[0]?.url || "",
      spotify_url: song?.item?.external_urls?.spotify || "",
      progress_ms: song?.progress_ms ?? 0,
      duration_ms: song?.item?.duration_ms ?? 0,
      queue: [],
      recently_played: [],
    };

    if (queueRes.ok && queueRes.status !== 204) {
      const q = await queueRes.json();
      body.queue = (q.queue || []).map(mapTrack).filter(Boolean);
    }

    if (recentRes.ok && recentRes.status !== 204) {
      const r = await recentRes.json();
      body.recently_played = (r.items || [])
        .map((entry) => ({ ...mapTrack(entry.track), played_at: entry.played_at }))
        .filter(Boolean);
    }

    return json(body);
  },
};
