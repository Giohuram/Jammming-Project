// PlaylistList.js
import React, { useState, useEffect } from 'react';
import Spotify from "../../util/Spotify";
import PlaylistListItem from "../PlaylistItem/PlaylistListItem";

const PlaylistList = ({ selectPlaylist }) => {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    const fetchPlaylists = async () => {
      const userPlaylists = await Spotify.getUserPlaylists();
      setPlaylists(userPlaylists);
    };
    fetchPlaylists();
  }, []);

  return (
    <div>
      <h2>My Playlists</h2>
      <ul>
        {playlists.map(playlist => (
          <PlaylistListItem 
            key={playlist.playlistId} 
            playlist={playlist} 
            onClick={() => selectPlaylist(playlist.playlistId)} 
          />
        ))}
      </ul>
    </div>
  );
};

export default PlaylistList;

