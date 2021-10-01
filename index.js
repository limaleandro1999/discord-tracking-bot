require('dotenv').config();

const Discord = require('discord.js');
const moment = require('moment');
const { rastro } = require('rastrojs');

const bot = new Discord.Client();

moment.locale('pt-BR');

bot.on('ready', () => {
  console.log('bot is ready!');
});

bot.on('message', async (message) => {
  const { content } = message;
  if (content.startsWith('!rastreia')) {
    const trackingCodes = content.split(' ')[1].split(',');
    const results = await trackCodes(trackingCodes);

    results.forEach((track) => {
      if (track.lastUpdate) {
        message.reply(`
          Código: ${track.code}
          Último local: ${track.lastUpdate.locale}
          Status: ${track.lastUpdate.status}
          Atualizado em: ${moment(
            convertTZ(track.lastUpdate.trackedAt, 'America/Fortaleza')
          ).format('LLLL')}
        `);
      } else {
        message.reply(`
          Código: ${track.code}
          Sem informações de rastreio`);
      }
    });
  }
});

bot.login(process.env.TOKEN);

async function trackCodes(trackingCodes = []) {
  const tracks = await rastro.track(trackingCodes);
  const parsedTracks = tracks.map(parseTracks);

  return parsedTracks;
}

function parseTracks({ code, tracks }) {
  return {
    code,
    lastUpdate: tracks ? tracks[tracks.length - 1] : null,
  };
}

function convertTZ(date, tzString) {
  return new Date(
    (typeof date === 'string' ? new Date(date) : date).toLocaleString('en-US', {
      timeZone: tzString,
    })
  );
}
