import * as fs from 'fs';
const config = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));

export const yt_api_key = config.yt_api_key;

export const prefix = config.prefix;

export const discord_token = config.discord_token;
