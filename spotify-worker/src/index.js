export default {
  async fetch(request, env) {
    // Get a fresh Spotify access token
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          btoa(`${env.CLIENT_ID}:${env.CLIENT_SECRET}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: env.REFRESH_TOKEN,
      }),
    });

    const token = await tokenRes.json();

    if (!token.access_token) {
      return Response.json(token, { status: 500 });
    }

    // Ask Spotify what's playing
    const playingRes = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      }
    );

    if (playingRes.status === 204) {
      return Response.json({
        playing: false,
        title: "listening",
        artist: "to the world around him",
        cover: "",
        spotify_url: "",
      });
    }

    const song = await playingRes.json();

    return Response.json({
      playing: song.is_playing,
      title: song.item.name,
      artist: song.item.artists.map(a => a.name).join(", "),
      cover: song.item.album.images[0].url,
      spotify_url: song.item.external_urls.spotify,
    });
  },
};
