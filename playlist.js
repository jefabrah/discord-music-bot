const Store = require('jfs');
const db = new Store('playlistsDB.json');
let playlistOne = {
  name: 'playlistOne',
  songs: ['bring me to life', 'dishonered ending song', 'DNA.'],
}

db.save(playlistOne.name, playlistOne, (err) => {
  if (err) {
    console.error('Error in playlist save:', err);
    return false;
  }
  return true;
});

// db.get(playlistOne.name, (err, obj) => {
//   if (err) {
//     console.log('Error while getting playlist:', err);
//     return false;
//   }
//   console.log('playlist retrieved', obj);
// });

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

module.exports = {
  getPlaylistByName,

}
