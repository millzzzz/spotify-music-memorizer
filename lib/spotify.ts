import SpotifyWebApi from 'spotify-web-api-js';

const spotifyApi = new SpotifyWebApi();

export const setAccessToken = (token: string) => {
  spotifyApi.setAccessToken(token);
};

export const getMyPlaylists = () => {
  return spotifyApi.getUserPlaylists();
};

export const transferPlayback = async (deviceId: string) => {
  const accessToken = spotifyApi.getAccessToken();
  if (!accessToken) {
    throw new Error('Access token not found');
  }

  const response = await fetch(`https://api.spotify.com/v1/me/player`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      device_ids: [deviceId],
      play: false,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Spotify API Error:', errorBody);
    throw new Error(`Failed to transfer playback: ${response.statusText}`);
  }
}

export const addToQueue = async (trackUri: string) => {
  const accessToken = spotifyApi.getAccessToken();
  if (!accessToken) {
    throw new Error('Access token not found');
  }

  const response = await fetch(`https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(trackUri)}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Spotify API Error:', errorBody);
    throw new Error(`Failed to add to queue: ${response.statusText}`);
  }
};

export default spotifyApi; 