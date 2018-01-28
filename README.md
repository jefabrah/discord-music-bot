# Discord Music Bot

### NOTE: ffmpeg needs to be installed and be located in PATH


## GETTING STARTED

#### Things you will need
-	node & npm intsalled
-	a youtube api key
- 	a discord bot & bot token
-	ffmpeg in your ~PATH


#### Getting the project running

1.	clone the project `git clone https://github.com/jefabrah/discord-music-bot.git`

2.	install all node modules in directory `npm install`

3.	create a `settings.json` file with the following in the main directory:

	```json
	{
	  "yt_api_key": "youtube_api_key", /* your youtube api key here */
	  "discord_token": "discord_bot_token", /* your discord bot token here */
	  "prefix": "~" /* the prefix you want for your server */
	}
	```

4.	install and run webpack to build the js bundle

	`npm install --global webpack`
	
	`webpack`

5. run the now built `bundle.js`:
	
	`node bundle.js`