const watch = require('node-watch');
const readLastLines = require('read-last-lines');
const axios = require('axios');

const DCS_LOG_FILE_PATH = 'dcs.log';
const BOT_URL = 'https://magios-datacollector-bot.herokuapp.com';
const SERVER_ID = '2';

console.log('magios-datacollector-dcs has started!!');

watch(DCS_LOG_FILE_PATH, { recursive: true }, function(evt, name) {
  
    readLastLines.read(DCS_LOG_FILE_PATH, 1)
        .then((line) => {

            if (line.indexOf('event:type=birth') >= 0) {

                const lineArray = line.split(',');
                const strDate = lineArray[0].split('INFO')[0].trim();

                const username = getValue(lineArray, 'initiatorPilotName=');

                axios.post(BOT_URL + '/user-join-server', {
                    username: username,
                    date: strDate,
                    serverId: SERVER_ID
                  }).then(function (response) {
                    console.log('Message sent - Username:' + username + ' has connected.');
                  }).catch(function (error) {
                    console.log(error);
                  });
            }
        });
});

getValue = (array, key) => {
    const value = array.find(value => value.indexOf(key) >= 0);
    if (value) {
        return value.split('=')[1]
    } else {
        return null;
    }
}

//Comando para generar el ejecutable:
//pkg .\magios-datacollector-dcs.js --targets node10-win-x64 --targets node10-win-x64