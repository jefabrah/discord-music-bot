export class Guild {
  public id: string;
  public queue: string[] = [];
  public queueNames: string[] = [];
  public isPlaying: boolean = false;
  public dispatcher: any = null;
  public voiceChannel: any = null;
  public skipReq: number = 0;

  constructor(id) {
    this.id = id;
  }
}
