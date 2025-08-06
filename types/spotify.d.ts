interface Window {
  onSpotifyWebPlaybackSDKReady: () => void;
  Spotify: {
    Player: new (options: Spotify.PlayerOptions) => Spotify.Player;
  }
} 