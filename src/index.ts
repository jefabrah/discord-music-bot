import { Client } from 'discord.js';
const client = new Client();
import * as ytdl from 'ytdl-core';
import * as request from 'request';
import * as fs from 'fs';
import * as getYouTubeID from 'get-youtube-id';
import * as fetchVideoInfo from 'youtube-info';
import { Playlist } from './Playlist';
import { Guild } from './Guild';
import { Youtube } from './Youtube';
import { Music } from './Music';
import { yt_api_key, prefix, discord_token } from './config';
const db = new Playlist();
const yt = new Youtube(yt_api_key);
let currentGuild: Guild;
let music: Music;

client.on('message', function (message) {
  const member = message.member;
  const mess = message.content.toLowerCase();
  const args = message.content.split(' ').slice(1).join(" ");
  if (!currentGuild) {
    currentGuild = new Guild(message.guild.id);
    music = new Music(currentGuild, yt);
  }
  else if (currentGuild && currentGuild.id !== message.guild.id) {
    message.reply(`I'm currently on another server`);
    return;
  }

  // PLAY
  if (mess.startsWith(prefix + "play")) {
    if (!member.voiceChannel) {
      message.reply('you need to be in a voice channel');
    }
    else if (currentGuild.queue.length > 0 || currentGuild.isPlaying) {
      yt.getID(args, function (id) {
        music.add_to_queue(id, message);
        fetchVideoInfo(id, function (err, videoInfo) {
          if (err) throw new Error(err);
          message.reply(" added to queue: **" + videoInfo.title + "**");
          currentGuild.queueNames.push(videoInfo.title);
        });
      });
    } else {
      currentGuild.isPlaying = true;
      yt.getID(args, function (id) {
        currentGuild.queue.push(id);
        fetchVideoInfo(id, function (err, videoInfo) {
          if (err) throw new Error(err);
          currentGuild.queueNames.push(videoInfo.title);
          message.reply(" now playing: **" + videoInfo.title + "**");
          music.playMusic(id, message);
        });
      });
    }
  // SKIP
  } else if (mess.startsWith(prefix + "skip")) {
    message.reply('Skipping ' + `**${currentGuild.queueNames[0]}**`);
    music.skip_song(message);
  } else if (mess.startsWith(prefix + "leave")) {
    currentGuild.queue = [];
    currentGuild.queueNames = [];
    currentGuild.isPlaying = false;
    currentGuild.voiceChannel.leave();
  } else if (mess.startsWith(prefix + "queue")) {
    var message2 = "```";
    for (var i = 0; i < currentGuild.queueNames.length; i++) {
      var temp = (i + 1) + ": " + currentGuild.queueNames[i] + (i === 0 ? "**(Current Song)**" : "") + "\n";
      if ((message2 + temp).length <= 2000 - 3) {
        message2 += temp;
      } else {
        message2 += "```";
        message.channel.send(message2);
        message2 = "```";
      }
    }
    message2 += "```";
    message.channel.send(message2);
  }
  // CREATE PLAYLIST
  else if (mess.startsWith(prefix + "create playlist")) {
    const playlistName = mess.replace(prefix + 'create playlist ', '');
    console.log('creating playlist ' + playlistName);
    db.savePlaylist({ name: playlistName }).then(() => {
      console.log('Created playlist ' + playlistName);
      message.channel.send('Created playlist ' + playlistName);
    })
      .catch((err) => {
        console.error('Failed to created playlist ' + playlistName);
        message.channel.send('Created playlist ' + playlistName);
      });
  }
  // ADD TO PLAYLIST
  else if (mess.startsWith(prefix + "add to playlist")) {
    const playlistArgs = mess.replace(prefix + 'add to playlist ', '').split(':');
    let songs = playlistArgs[1].split(';').filter(song => song !== '');
    const playlistName = playlistArgs[0].trim();
    console.log('Adding to playlist ' + playlistName);
    db.getPlaylistByName(playlistName).then((playlistData) => {
      console.log('playlist data to add to:', playlistData);
      if (playlistData.songs) {
        playlistData.songs.concat(songs);
      }
      else {
        playlistData.songs = songs;
      }
      db.savePlaylist({ name: playlistName, songs }).then((playlistData) => {
        console.log('Playlist successfully updated:', playlistData);
      })
        .catch((err) => {
          message.reply('Something went wrong. Womp womp...');
        })
    })
      .catch((err) => {
        console.error('Error getting playlist:', err.message);
        if (err.message === "could not load data") {
          message.reply(`Playlist "${playlistName}" doesn't exist`);
        }
      });
  }
  // START PLAYLIST
  else if (mess.startsWith(prefix + "start playlist")) {
    const playlistName = message.content.replace(prefix + 'start playlist ', '').trim();
    currentGuild.queue = [];
    console.log('starting playlist ' + playlistName);
    message.reply('starting playlist ' + playlistName);
    db.getPlaylistByName(playlistName).then((playlistData) => {
      let songIndex = 0;
      let firstSongId = null;
      let firstSongStarted = false;
      function fetchSongs() {
        const song = playlistData.songs[songIndex]
        yt.getID(song, function (id) {
          if (songIndex === 0) firstSongId = id;
          music.add_to_queue(id, message);
          fetchVideoInfo(id, function (err, videoInfo) {
            if (err) throw new Error(err);
            message.reply(" added to queue: **" + videoInfo.title + "**");
            currentGuild.queueNames.push(videoInfo.title);
            if (firstSongId && !firstSongStarted) {
              music.playMusic(firstSongId, message);
              firstSongStarted = true;
            }
            if (songIndex < playlistData.songs.length - 1) {
              fetchSongs();
            }
            songIndex++;
          });
        });

      }
      fetchSongs();
    })
      .catch((err) => {
        console.error('Error getting playlist');
        message.reply('Error starting playlist:', err);
      })
  }

});



client.on('ready', function () {
  console.log("I am ready!");
});
client.login(discord_token);
