declare namespace Spotify {
  interface PlayerOptions {
    name: string;
    getOAuthToken: (cb: (token: string) => void) => void;
    volume?: number;
  }

  interface Player {
    addListener(event: 'ready', listener: (data: { device_id: string }) => void): void;
    addListener(event: 'not_ready', listener: (data: { device_id: string }) => void): void;
    connect(): Promise<boolean>;
    disconnect(): void;
    pause(): Promise<void>;
  }
}

interface Window {
  onSpotifyWebPlaybackSDKReady: () => void;
  Spotify: {
    Player: new (options: Spotify.PlayerOptions) => Spotify.Player;
  };
} 