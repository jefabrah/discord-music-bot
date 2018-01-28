import * as getYouTubeId from 'get-youtube-id';
import * as request from 'request';
import * as ytdl from 'ytdl-core';

export class Youtube {
  private yt_api_key: string;

  constructor(yt_api_key) {
    this.yt_api_key = yt_api_key;
  }

  isYoutube = (id: string): boolean => {
    return id.toLowerCase().indexOf('youtube.com') > -1;
  }

  ytdl = ytdl // from 'ytdl-core' module

  getYoutubeId = getYouTubeId // from 'get-youtube-id' module

  getID = (str, cb) => {
    if (this.isYoutube(str)) {
      cb(this.getYoutubeId(str));
    } else {
      this.search_video(str, function (id) {
        cb(id);
      });
    }
  }
  
  search_video = (query, cb) => {
    request("https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=" + encodeURIComponent(query) + "&key=" + this.yt_api_key, function (error, response, body) {
      var json = JSON.parse(body);
      if (!json.items[0]) cb("3_-a9nVZYjk");
      else {
        cb(json.items[0].id.videoId);
      }
    });
  }

}
