const cors = {
  "Access-Control-Allow-Origin": "https://asethcore.github.io",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Max-Age": "86400",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: cors,
      });
    }

    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " + btoa(`${env.CLIENT_ID}:${env.CLIENT_SECRET}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: env.REFRESH_TOKEN,
      }),
    });

    const token = await tokenRes.json();

    if (!token.access_token) {
      return new Response(JSON.stringify(token), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...cors,
        },
      });
    }

    const playingRes = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      }
    );

    if (playingRes.status === 204) {
      return new Response(
        JSON.stringify({
          playing: false,
          title: "listening",
          artist: "to the world around him",
          cover: "",
          spotify_url: "",
        }),
        {
          headers: {
            "Content-Type": "application/json",
            ...cors,
          },
        }
      );
    }

    const song = await playingRes.json();

    return new Response(
      JSON.stringify({
        playing: song.is_playing,
        title: song.item.name,
        artist: song.item.artists.map((a) => a.name).join(", "),
        cover: song.item.album.images[0].url,
        spotify_url: song.item.external_urls.spotify,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...cors,
        },
      }
    );
  },
};
