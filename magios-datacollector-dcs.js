const watch = require('node-watch');
const readLastLines = require('read-last-lines');
const moment = require('moment');

const axios = require('axios');
const fs = require('fs');

const DCS_LOG_FILE_PATH = 'dcs.log';
const LAST_LINE_FILE_PATH = 'lastline';

const BOT_URL = 'https://magios-datacollector-bot.herokuapp.com';
const SERVER_ID = '2';

console.log('magios-datacollector-dcs has started!!');

let lastDateRegister = null;
try {
    lastDateRegister = fs.readFileSync(LAST_LINE_FILE_PATH, 'utf8');
} catch(e) {
}

let sendData = false;
watch(DCS_LOG_FILE_PATH, { recursive: true }, function(evt, name) {
  
    readLastLines.read(DCS_LOG_FILE_PATH)
        .then((blockLines) => {

            const rawLines = blockLines.split('\n');
            rawLines.forEach(line => {

                sendData = false;

                if (line.indexOf('event:type=birth') >= 0) {
    
                    const lineArray = line.split(',');
                    const strDate = lineArray[0].split('INFO')[0].trim();
    
                    const username = getValue(lineArray, 'initiatorPilotName=');

                    if (username) {
                        if (lastDateRegister) {
                            const lastRegDate = moment(lastDateRegister, 'DD-MM-YYYY HH:mm.sss');
                            const currentRegDate = moment(strDate, 'DD-MM-YYYY HH:mm.sss');

                            if (lastRegDate.isBefore(currentRegDate)) {
                                sendData = true;
                            }

                        } else {
                            sendData = true;
                        }

                        if (sendData) {

                            axios.post(BOT_URL + '/user-join-server', {
                                username: username,
                                date: strDate,
                                serverId: SERVER_ID
                              }).then(function (response) {
        
                                lastDateRegister = strDate;
                                fs.writeFileSync("lastline", lastDateRegister);
        
                                console.log('Message sent - Username:' + username + ' has connected.');
                              }).catch(function (error) {
                                console.log(error);
                              });

                        }
                    }
                }
            })

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
//pkg .\magios-datacollector-dcs.js --targets node10-win-x64