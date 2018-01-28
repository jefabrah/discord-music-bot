/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var discord_js_1 = __webpack_require__(1);
	var client = new discord_js_1.Client();
	var fetchVideoInfo = __webpack_require__(5);
	var Playlist_1 = __webpack_require__(11);
	var Guild_1 = __webpack_require__(8);
	var Youtube_1 = __webpack_require__(9);
	var Music_1 = __webpack_require__(12);
	var config_1 = __webpack_require__(10);
	var db = new Playlist_1.Playlist();
	var yt = new Youtube_1.Youtube(config_1.yt_api_key);
	var currentGuild;
	var music;
	client.on('message', function (message) {
	    var member = message.member;
	    var mess = message.content.toLowerCase();
	    var args = message.content.split(' ').slice(1).join(" ");
	    if (!currentGuild) {
	        currentGuild = new Guild_1.Guild(message.guild.id);
	        music = new Music_1.Music(currentGuild, yt);
	    }
	    else if (currentGuild && currentGuild.id !== message.guild.id) {
	        message.reply("I'm currently on another server");
	        return;
	    }
	    // PLAY
	    if (mess.startsWith(config_1.prefix + "play")) {
	        if (!member.voiceChannel) {
	            message.reply('you need to be in a voice channel');
	        }
	        else if (currentGuild.queue.length > 0 || currentGuild.isPlaying) {
	            yt.getID(args, function (id) {
	                music.add_to_queue(id, message);
	                fetchVideoInfo(id, function (err, videoInfo) {
	                    if (err)
	                        throw new Error(err);
	                    message.reply(" added to queue: **" + videoInfo.title + "**");
	                    currentGuild.queueNames.push(videoInfo.title);
	                });
	            });
	        }
	        else {
	            currentGuild.isPlaying = true;
	            yt.getID(args, function (id) {
	                currentGuild.queue.push(id);
	                fetchVideoInfo(id, function (err, videoInfo) {
	                    if (err)
	                        throw new Error(err);
	                    currentGuild.queueNames.push(videoInfo.title);
	                    message.reply(" now playing: **" + videoInfo.title + "**");
	                    music.playMusic(id, message);
	                });
	            });
	        }
	        // SKIP
	    }
	    else if (mess.startsWith(config_1.prefix + "skip")) {
	        message.reply('Skipping ' + ("**" + currentGuild.queueNames[0] + "**"));
	        music.skip_song(message);
	    }
	    else if (mess.startsWith(config_1.prefix + "leave")) {
	        currentGuild.queue = [];
	        currentGuild.queueNames = [];
	        currentGuild.isPlaying = false;
	        currentGuild.voiceChannel.leave();
	    }
	    else if (mess.startsWith(config_1.prefix + "queue")) {
	        var message2 = "```";
	        for (var i = 0; i < currentGuild.queueNames.length; i++) {
	            var temp = (i + 1) + ": " + currentGuild.queueNames[i] + (i === 0 ? "**(Current Song)**" : "") + "\n";
	            if ((message2 + temp).length <= 2000 - 3) {
	                message2 += temp;
	            }
	            else {
	                message2 += "```";
	                message.channel.send(message2);
	                message2 = "```";
	            }
	        }
	        message2 += "```";
	        message.channel.send(message2);
	    }
	    else if (mess.startsWith(config_1.prefix + "create playlist")) {
	        var playlistName_1 = mess.replace(config_1.prefix + 'create playlist ', '');
	        console.log('creating playlist ' + playlistName_1);
	        db.savePlaylist({ name: playlistName_1 }).then(function () {
	            console.log('Created playlist ' + playlistName_1);
	            message.channel.send('Created playlist ' + playlistName_1);
	        })
	            .catch(function (err) {
	            console.error('Failed to created playlist ' + playlistName_1);
	            message.channel.send('Created playlist ' + playlistName_1);
	        });
	    }
	    else if (mess.startsWith(config_1.prefix + "add to playlist")) {
	        var playlistArgs = mess.replace(config_1.prefix + 'add to playlist ', '').split(':');
	        var songs_1 = playlistArgs[1].split(';').filter(function (song) { return song !== ''; });
	        var playlistName_2 = playlistArgs[0].trim();
	        console.log('Adding to playlist ' + playlistName_2);
	        db.getPlaylistByName(playlistName_2).then(function (playlistData) {
	            console.log('playlist data to add to:', playlistData);
	            if (playlistData.songs) {
	                playlistData.songs.concat(songs_1);
	            }
	            else {
	                playlistData.songs = songs_1;
	            }
	            db.savePlaylist({ name: playlistName_2, songs: songs_1 }).then(function (playlistData) {
	                console.log('Playlist successfully updated:', playlistData);
	            })
	                .catch(function (err) {
	                message.reply('Something went wrong. Womp womp...');
	            });
	        })
	            .catch(function (err) {
	            console.error('Error getting playlist:', err.message);
	            if (err.message === "could not load data") {
	                message.reply("Playlist \"" + playlistName_2 + "\" doesn't exist");
	            }
	        });
	    }
	    else if (mess.startsWith(config_1.prefix + "start playlist")) {
	        var playlistName = message.content.replace(config_1.prefix + 'start playlist ', '').trim();
	        currentGuild.queue = [];
	        console.log('starting playlist ' + playlistName);
	        message.reply('starting playlist ' + playlistName);
	        db.getPlaylistByName(playlistName).then(function (playlistData) {
	            var songIndex = 0;
	            var firstSongId = null;
	            var firstSongStarted = false;
	            function fetchSongs() {
	                var song = playlistData.songs[songIndex];
	                yt.getID(song, function (id) {
	                    if (songIndex === 0)
	                        firstSongId = id;
	                    music.add_to_queue(id, message);
	                    fetchVideoInfo(id, function (err, videoInfo) {
	                        if (err)
	                            throw new Error(err);
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
	            .catch(function (err) {
	            console.error('Error getting playlist');
	            message.reply('Error starting playlist:', err);
	        });
	    }
	});
	client.on('ready', function () {
	    console.log("I am ready!");
	});
	client.login(config_1.discord_token);


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = require("discord.js");

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("ytdl-core");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("request");

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("youtube-info");

/***/ },
/* 6 */,
/* 7 */
/***/ function(module, exports) {

	module.exports = require("jfs");

/***/ },
/* 8 */
/***/ function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var Guild = /** @class */ (function () {
	    function Guild(id) {
	        this.queue = [];
	        this.queueNames = [];
	        this.isPlaying = false;
	        this.dispatcher = null;
	        this.voiceChannel = null;
	        this.skipReq = 0;
	        this.id = id;
	    }
	    return Guild;
	}());
	exports.Guild = Guild;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var getYouTubeId = __webpack_require__(13);
	var request = __webpack_require__(3);
	var ytdl = __webpack_require__(2);
	var Youtube = /** @class */ (function () {
	    function Youtube(yt_api_key) {
	        var _this = this;
	        this.isYoutube = function (id) {
	            return id.toLowerCase().indexOf('youtube.com') > -1;
	        };
	        this.ytdl = ytdl; // from 'ytdl-core' module
	        this.getYoutubeId = getYouTubeId; // from 'get-youtube-id' module
	        this.getID = function (str, cb) {
	            if (_this.isYoutube(str)) {
	                cb(_this.getYoutubeId(str));
	            }
	            else {
	                _this.search_video(str, function (id) {
	                    cb(id);
	                });
	            }
	        };
	        this.search_video = function (query, cb) {
	            request("https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=" + encodeURIComponent(query) + "&key=" + _this.yt_api_key, function (error, response, body) {
	                var json = JSON.parse(body);
	                if (!json.items[0])
	                    cb("3_-a9nVZYjk");
	                else {
	                    cb(json.items[0].id.videoId);
	                }
	            });
	        };
	        this.yt_api_key = yt_api_key;
	    }
	    return Youtube;
	}());
	exports.Youtube = Youtube;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var fs = __webpack_require__(4);
	var config = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));
	exports.yt_api_key = config.yt_api_key;
	exports.prefix = config.prefix;
	exports.discord_token = config.discord_token;


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var Store = __webpack_require__(7);
	var db = new Store('playlistsDB.json');
	var Playlist = /** @class */ (function () {
	    function Playlist() {
	    }
	    Playlist.prototype.getPlaylistByName = function (playlistName) {
	        return new Promise(function (resolve, reject) {
	            db.get(playlistName, function (err, playlistData) {
	                if (err) {
	                    reject(err);
	                    return;
	                }
	                resolve(playlistData);
	            });
	        });
	    };
	    Playlist.prototype.savePlaylist = function (playlistData) {
	        return new Promise(function (resolve, reject) {
	            db.save(playlistData.name, playlistData, function (err) {
	                if (err) {
	                    console.error('Error during playlist save:', err);
	                    reject(err);
	                    return;
	                }
	                resolve(playlistData);
	            });
	        });
	    };
	    return Playlist;
	}());
	exports.Playlist = Playlist;


/***/ },
/* 12 */
/***/ function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var Music = /** @class */ (function () {
	    function Music(guild, youtube) {
	        var _this = this;
	        this.add_to_queue = function (id, message) {
	            if (_this.youtube.isYoutube(id)) {
	                _this.guild.queue.push(_this.youtube.getYoutubeId(id));
	            }
	            else {
	                _this.guild.queue.push(id);
	            }
	        };
	        this.skip_song = function (message) {
	            _this.guild.dispatcher.end();
	        };
	        this.playMusic = function (id, message) {
	            _this.guild.voiceChannel = message.member.voiceChannel;
	            _this.guild.voiceChannel.join().then(function (connection) {
	                console.log(_this);
	                var stream = _this.youtube.ytdl("https://www.youtube.com/watch?v=" + id, {
	                    filter: 'audioonly'
	                });
	                _this.guild.skipReq = 0;
	                _this.guild.dispatcher = connection.playStream(stream);
	                _this.guild.dispatcher.on('end', function () {
	                    _this.guild.skipReq = 0;
	                    _this.guild.queue.shift();
	                    _this.guild.queueNames.shift();
	                    if (_this.guild.queue.length === 0) {
	                        console.log('No more music in queue. Starting timeout');
	                        _this.guild.queue = [];
	                        _this.guild.queueNames = [];
	                        _this.guild.isPlaying = false;
	                        _this.connectionTimeout(message);
	                    }
	                    else {
	                        setTimeout(function () {
	                            _this.playMusic(_this.guild.queue[0], message);
	                        }, 200);
	                    }
	                });
	            })
	                .catch(function (err) {
	                console.error('error joining voice channel:', err);
	            });
	        };
	        this.connectionTimeout = function (message) {
	            setTimeout(function () {
	                if (!_this.guild.isPlaying) {
	                    _this.guild.voiceChannel.leave();
	                }
	            }, 120000);
	        };
	        this.guild = guild;
	        this.youtube = youtube;
	    }
	    return Music;
	}());
	exports.Music = Music;


/***/ },
/* 13 */
/***/ function(module, exports) {

	module.exports = require("get-youtube-id");

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map