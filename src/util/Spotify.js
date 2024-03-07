const clientId = '0b14b1c0eb664048bffb8acb810c0336'; // Insert client ID here.
const redirectUri = 'http://localhost:3000/'; // Have to add this to your accepted Spotify redirect URIs on the Spotify API.
let accessToken;

const Spotify = {
  getAccessToken() {
    if (accessToken) {
      return accessToken;
    }

    const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
    const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);
    if (accessTokenMatch && expiresInMatch) {
      accessToken = accessTokenMatch[1];
      const expiresIn = Number(expiresInMatch[1]);
      window.setTimeout(() => accessToken = '', expiresIn * 1000);
      window.history.pushState('Access Token', null, '/'); // This clears the parameters, allowing us to grab a new access token when it expires.
      return accessToken;
    } else {
      const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
      window.location = accessUrl;
    }
  },

  search(term) {
    const accessToken = Spotify.getAccessToken();
    return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then(response => {
      return response.json();
    }).then(jsonResponse => {
      if (!jsonResponse.tracks) {
        return [];
      }
      return jsonResponse.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        uri: track.uri
      }));
    });
  },

  savePlaylist(name, trackUris, playlistId) {
    if (!name || !trackUris.length) {
      return;
    }

    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };
    let userId;

    return fetch('https://api.spotify.com/v1/me', {headers: headers}
    ).then(response => response.json()
    ).then(jsonResponse => {
      userId = jsonResponse.id;
      if (playlistId) {
        // Update existing playlist name
        return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}`, {
          headers: headers,
          method: 'PUT',
          body: JSON.stringify({ name: name })
        }).then(response => {
          // Return playlistId for chaining
          return playlistId;
        });
      } else {
        // Create new playlist
        return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
          headers: headers,
          method: 'POST',
          body: JSON.stringify({ name: name })
        }).then(response => response.json()
        ).then(jsonResponse => {
          const newPlaylistId = jsonResponse.id;
          return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${newPlaylistId}/tracks`, {
            headers: headers,
            method: 'POST',
            body: JSON.stringify({ uris: trackUris })
          }).then(response => {
            // Return new playlistId for chaining
            return newPlaylistId;
          });
        });
      }
    });
  },

  getPlaylist(id) {
    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };

    return fetch(`https://api.spotify.com/v1/playlists/${id}/tracks`, {
      headers: headers
    }).then(response => response.json()
    ).then(jsonResponse => {
      if (!jsonResponse.items) {
        return [];
      }
      return jsonResponse.items.map(item => ({
        id: item.track.id,
        name: item.track.name,
        artist: item.track.artists[0].name,
        album: item.track.album.name,
        uri: item.track.uri
      }));
    });
  },

  getUserPlaylists() {
    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };

    return fetch('https://api.spotify.com/v1/me/playlists', {
      headers: headers
    }).then(response => response.json()
    ).then(jsonResponse => {
      if (!jsonResponse.items) {
        return [];
      }
      return jsonResponse.items.map(playlist => ({
        id: playlist.id,
        name: playlist.name
      }));
    });
  }
};

export default Spotify;
