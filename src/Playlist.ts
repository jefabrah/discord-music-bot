import * as Store from 'jfs';
import { PlaylistData } from './types/dbTypes';
const db = new Store('playlistsDB.json');

export class Playlist {

  getPlaylistByName (playlistName): Promise<PlaylistData> {
    return new Promise((resolve, reject) => {
      db.get(playlistName, (err, playlistData) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(playlistData);
      });
    });
  }

  savePlaylist (playlistData): Promise<PlaylistData> {
    return new Promise((resolve, reject) => {
      db.save(playlistData.name, playlistData, (err) => {
        if (err) {
          console.error('Error during playlist save:', err);
          reject(err);
          return;
        }
        resolve(playlistData);
      });
    });
  }
}
