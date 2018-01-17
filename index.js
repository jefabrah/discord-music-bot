const Discord = require("discord.js");
const client = new Discord.Client();
const ytdl = require("ytdl-core");
const request = require("request");
const fs = require("fs");
const getYouTubeID = require("get-youtube-id");
const fetchVideoInfo = require("youtube-info");
const db = require('./playlist');

var config = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));

const yt_api_key = config.yt_api_key;
const prefix = config.prefix;
const discord_token = config.discord_token;

var guilds = {};


client.login(discord_token);

client.on('message', function (message) {
    const member = message.member;
    const mess = message.content.toLowerCase();
    const args = message.content.split(' ').slice(1).join(" ");

    if (!guilds[message.guild.id]) {
        guilds[message.guild.id] = {
            que: [],
            queNames: [],
            isPlaying: false,
            dispatcher: null,
            voiceChannel: null,
            skipReq: 0,
        };
    }

    if (mess.startsWith(prefix + "play")) {
        if (typeof member.voiceChannel.name !== 'string') {
            message.reply('you need to be in a voice channel');
        }
        else if (guilds[message.guild.id].que.length > 0 || guilds[message.guild.id].isPlaying) {
            getID(args, function (id) {
                add_to_que(id, message);
                fetchVideoInfo(id, function (err, videoInfo) {
                    if (err) throw new Error(err);
                    message.reply(" added to que: **" + videoInfo.title + "**");
                    guilds[message.guild.id].queNames.push(videoInfo.title);
                });
            });
        } else {
            isPlaying = true;
            getID(args, function (id) {
                const guild = guilds[message.guild.id];
                guild
                guilds[message.guild.id].que.push(id);
                playMusic(id, message);
                fetchVideoInfo(id, function (err, videoInfo) {
                    if (err) throw new Error(err);
                    guilds[message.guild.id].queNames.push(videoInfo.title);
                    message.reply(" now playing: **" + videoInfo.title + "**");
                });
            });
        }
    } else if (mess.startsWith(prefix + "skip")) {
        message.reply('Skipping ' + `**${guilds[message.guild.id].queNames[0]}**`);
        skip_song(message);
    } else if (mess.startsWith(prefix + "leave")) {
        guilds[message.guild.id].que = [];
        guilds[message.guild.id].queNames = [];
        guilds[message.guild.id].isPlaying = false;
        guilds[message.guild.id].voiceChannel.leave();
    } else if (mess.startsWith(prefix + "que")) {
        var message2 = "```";
        for (var i = 0; i < guilds[message.guild.id].queNames.length; i++) {
            var temp = (i + 1) + ": " + guilds[message.guild.id].queNames[i] + (i === 0 ? "**(Current Song)**" : "") + "\n";
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
    else if (mess.startsWith(prefix + "start playlist")) {
        const playlistName = message.content.replace(prefix + 'start playlist ', '').trim();
        const guild = guilds[message.guild.id];
        guild.que = [];
        console.log('starting playlist ' + playlistName);
        message.reply('starting playlist ' + playlistName);
        db.getPlaylistByName(playlistName).then((playlistData) => {
            let songIndex = 0;
            let firstSongId = null;
            let firstSongStarted = false;
            function fetchSongs() {
                const song = playlistData.songs[songIndex]
                getID(song, function (id) {
                    if (songIndex === 0) firstSongId = id;
                    add_to_que(id, message);
                    fetchVideoInfo(id, function (err, videoInfo) {
                        if (err) throw new Error(err);
                        message.reply(" added to que: **" + videoInfo.title + "**");
                        guilds[message.guild.id].queNames.push(videoInfo.title);
                        if (firstSongId && !firstSongStarted) {
                             playMusic(firstSongId, message);
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

function skip_song(message) {
    guilds[message.guild.id].dispatcher.end();
}

function playMusic(id, message) {
    guilds[message.guild.id].voiceChannel = message.member.voiceChannel;
    guilds[message.guild.id].voiceChannel.join().then(function (connection) {
        stream = ytdl("https://www.youtube.com/watch?v=" + id, {
            filter: 'audioonly'
        });
        guilds[message.guild.id].skispReq = 0;

        guilds[message.guild.id].dispatcher = connection.playStream(stream);
        guilds[message.guild.id].dispatcher.on('end', function () {
            guilds[message.guild.id].skipReq = 0;
            guilds[message.guild.id].que.shift();
            guilds[message.guild.id].queNames.shift();
            if (guilds[message.guild.id].que.length === 0) {
                guilds[message.guild.id].que = [];
                guilds[message.guild.id].queNames = [];
                guilds[message.guild.id].isPlaying = false;
                connectionTimeout(message);
            } else {
                setTimeout(function () {
                    playMusic(guilds[message.guild.id].que[0], message);
                }, 200);
            }
        });
    });
}

function getID(str, cb) {
    if (isYoutube(str)) {
        cb(getYouTubeID(str));
    } else {
        search_video(str, function (id) {
            cb(id);
        });
    }
}

function add_to_que(strID, message) {
    if (isYoutube(strID)) {
        guilds[message.guild.id].que.push(getYouTubeID(strID));
    } else {
        guilds[message.guild.id].que.push(strID);
    }
}

function search_video(query, callback) {
    request("https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=" + encodeURIComponent(query) + "&key=" + yt_api_key, function (error, response, body) {
        var json = JSON.parse(body);
        if (!json.items[0]) callback("3_-a9nVZYjk");
        else {
            callback(json.items[0].id.videoId);
        }
    });
}

function isYoutube(str) {
    return str.toLowerCase().indexOf("youtube.com") > -1;
}

function connectionTimeout(message) {
    setTimeout(() => {
        if (!guilds[message.guild.id].isPlaying) {
            guilds[message.guild.id].voiceChannel.leave();
        }
    }, 120000);
}
