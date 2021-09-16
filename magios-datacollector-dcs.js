const moment = require('moment');
const cron = require('node-cron');
const axios = require('axios');
const fs = require('fs');

const DCS_LOG_FILE_PATH = 'dcs.log';

const BOT_URL = 'https://magios-datacollector-bot.herokuapp.com';
const SERVER_ID = '2';

console.log('magios-datacollector-dcs has started!!');

fs.writeFileSync(DCS_LOG_FILE_PATH, '');
console.log('dcs.log is empty now.');

let lastAlive = null;

cron.schedule('*/1 * * * *', () => {
    console.log('Running a task every 1 minute');

    const blockLines = fs.readFileSync(DCS_LOG_FILE_PATH, 'utf8');
    fs.writeFileSync(DCS_LOG_FILE_PATH, '');

    const rawLines = blockLines.split('\n');
    rawLines.forEach(line => {

        if (line.indexOf('NET: added client') >= 0) {

            const aux1 = line.split('INFO');
            const strDate = aux1[0].trim();

            const values = aux1[1].trim().split('NET: added client')[1].substring(4).split('name=')[1].split('addr=');

            const username = values[0];
            const ip = values[1];

            if (username) {
                axios.post(BOT_URL + '/user-join-server', {
                    username: username,
                    date: strDate,
                    ip: ip,
                    serverId: SERVER_ID
                }).then(function (response) {
                    console.log('Message sent - Username:' + username + ' has connected.');
                }).catch(function (error) {
                    console.log(error);
                });
            }

        } else if (line.indexOf('Scripting: event') >= 0) {

            let now = moment();

            if (!lastAlive || now.diff(lastAlive, 'minutes') >= 10) {
                lastAlive = now;
                axios.get(BOT_URL + '/server-alive/' + SERVER_ID).then(function (response) {
                    console.log('Sending Server ' + SERVER_ID + ' is alive.');
                }).catch(function (error) {
                    console.log(error);
                });
            }
            
        }
    })

});

//Comando para generar el ejecutable:
//pkg .\magios-datacollector-dcs.js --targets node10-win-x64