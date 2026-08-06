import spotipy
from spotipy.oauth2 import SpotifyOAuth
import json
import requests
from pathlib import Path
from dotenv import load_dotenv
import os

load_dotenv()

CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
REFRESH_TOKEN = os.getenv("SPOTIFY_REFRESH_TOKEN")

if not CLIENT_ID or not CLIENT_SECRET or not REFRESH_TOKEN:
    raise RuntimeError("CLIENT_ID, CLIENT_SECRET, and SPOTIFY_REFRESH_TOKEN are required")

oauth = SpotifyOAuth(
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET,
    redirect_uri="http://127.0.0.1:8888/callback",
    scope="user-read-currently-playing",
)
token = oauth.refresh_access_token(REFRESH_TOKEN)
sp = spotipy.Spotify(auth=token["access_token"])

PROJECT = Path(__file__).resolve().parent.parent
STATIC = PROJECT / "static"

MUSIC_JSON = STATIC / "music.json"
COVER_FILE = STATIC / "music-cover.jpg"

song = sp.current_user_playing_track()

if song and song["is_playing"] and song.get("item"):

    title = song["item"]["name"]
    artist = ", ".join(a["name"] for a in song["item"]["artists"])
    cover = song["item"]["album"]["images"][0]["url"]
    spotify_url = song["item"]["external_urls"]["spotify"]

    print("Downloading album cover...")

    response = requests.get(cover, timeout=15)
    response.raise_for_status()

    with open(COVER_FILE, "wb") as f:
        f.write(response.content)

    data = {
        "playing": True,
        "title": title,
        "artist": artist,
        "cover": f"/music-cover.jpg?v={song['item']['id']}",
        "spotify_url": spotify_url
    }

else:

    data = {
        "playing": False,
        "title": "listening",
        "artist": "to the world around him",
        "cover": "",
        "spotify_url": ""
    }

with open(MUSIC_JSON, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

print(f"♪ {data['title']} — {data['artist']}")
