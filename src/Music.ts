import * as request from 'request';
import { Youtube } from './Youtube';
import { Guild } from './Guild';
import { Message } from 'discord.js';

export class Music {
  private guild: Guild;
  private youtube: Youtube;

  constructor(guild, youtube) {
    this.guild = guild;
    this.youtube = youtube;
  }

  add_to_queue = (id: string, message: Message) => {
    if (this.youtube.isYoutube(id)) {
      this.guild.queue.push(this.youtube.getYoutubeId(id));
    } else {
      this.guild.queue.push(id);
    }
  }

  skip_song = (message: Message) =>  {
    this.guild.dispatcher.end();
  }

  playMusic = (id: string, message: Message) => {
    this.guild.voiceChannel = message.member.voiceChannel;
    this.guild.voiceChannel.join().then((connection) => {
      console.log(this);
      const stream = this.youtube.ytdl("https://www.youtube.com/watch?v=" + id, {
        filter: 'audioonly'
      });
      this.guild.skipReq = 0;
      this.guild.dispatcher = connection.playStream(stream);
      this.guild.dispatcher.on('end', () => {
        this.guild.skipReq = 0;
        this.guild.queue.shift();
        this.guild.queueNames.shift();
        if (this.guild.queue.length === 0) {
          console.log('No more music in queue. Starting timeout');
          this.guild.queue = [];
          this.guild.queueNames = [];
          this.guild.isPlaying = false;
          this.connectionTimeout(message);
        } else {
          setTimeout(() => {
            this.playMusic(this.guild.queue[0], message);
          }, 200);
        }
      });
    })
      .catch(err => {
        console.error('error joining voice channel:', err);
      });
  }

  connectionTimeout = (message: Message) => {
    setTimeout(() => {
      if (!this.guild.isPlaying) {
        this.guild.voiceChannel.leave();
      }
    }, 120000);
  }
}
