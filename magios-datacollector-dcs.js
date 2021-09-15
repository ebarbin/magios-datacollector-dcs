const watch = require('node-watch');
const readLastLines = require('read-last-lines');
const axios = require('axios');

const DCS_LOG_FILE_PATH = 'dcs.log';
const BOT_URL = 'https://magios-datacollector-bot.herokuapp.com/';

console.log('magios-datacollector-dcs has started!!');

watch(DCS_LOG_FILE_PATH, { recursive: true }, function(evt, name) {
  
    readLastLines.read(DCS_LOG_FILE_PATH, 1)
        .then((line) => {

            if (line.indexOf('event:type=birth') >= 0) {

                if (line.split(',').find(value => value.indexOf('initiatorPilotName=') >= 0)) {
                    const username = line.split(',').find(value => value.indexOf('initiatorPilotName=') >= 0).split('=')[1];

                    axios.get(BOT_URL + username).then(function (response) {
                        console.log('Message sent - Username:' + username + ' has connected.');
                    }).catch(function (error) {
                        console.log('Error: ' + error);
                    });
                }
            }
        });
});
//Comando para generar el ejecutable:
//pkg .\magios-datacollector-dcs.js --targets node10-win-x64 --targets node10-win-x64