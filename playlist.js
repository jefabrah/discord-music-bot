const Store = require('jfs');
const db = new Store('playlistsDB.json');

function getPlaylistByName (playlistName) {
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

function savePlaylist (playlistData) {
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

module.exports = {
  getPlaylistByName,
  savePlaylist,
}
