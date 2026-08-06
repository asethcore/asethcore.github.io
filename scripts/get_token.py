import spotipy
from spotipy.oauth2 import SpotifyOAuth

CLIENT_ID = "your_client_id"
CLIENT_SECRET = "your_client_secret"

sp = spotipy.Spotify(
    auth_manager=SpotifyOAuth(
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        redirect_uri="http://127.0.0.1:8888/callback",
        scope="user-read-currently-playing",
        open_browser=True
    )
)

print("Token created")
print(sp.current_user())
