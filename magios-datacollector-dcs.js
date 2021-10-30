const moment = require('moment');
const cron = require('node-cron');
const axios = require('axios');
const fs = require('fs');

const DCS_LOG_FILE_PATH = 'dcs.log';

const BOT_URL = 'https://magios-datacollector-bot.herokuapp.com';
const SERVER_ID = 1;

const TAG = '[magios-datacollector-dcs]';

console.log(TAG + ' - Log analizer from Server ' + SERVER_ID + ' has started!!');

const programStatus = {
    lastAlive: null,
    pause: false,
    lastProcessDate: moment()
}

console.log(TAG + ' - Getting last alive date...');
axios.get(BOT_URL + '/api/server-alive/' + SERVER_ID).then(res => {
    const response = res.data.response;
    if (response && response.status) {
        console.log(TAG + ' - Last alive was: ' + response.updated);
        programStatus.lastProcessDate = moment(response.updated, 'YYYY-MM-DD HH:mm:ss.SSS')
    } else {
        console.log(TAG + ' - Last alive is missing. We will use use current date: ' + programStatus.lastProcessDate.format('DD/MM/YYYY HH:mm:ss'));
    }
})

cron.schedule('*/1 * * * *', () => {

    console.log(TAG + ' - Running a task every 1 minute');
    const blockLines = fs.readFileSync(DCS_LOG_FILE_PATH, 'utf8');

    const rawLines = blockLines.split('\n');
    console.log(TAG + ' - Analyzing ' + rawLines.length + ' lines.');

    rawLines.forEach(async (line) => {

        const currentLineDateStr = line.substring(0, 23);
        const currentLineDate = moment(currentLineDateStr, 'YYYY-MM-DD HH:mm:ss.SSS');

        if (currentLineDate.isAfter(programStatus.lastProcessDate)) {

            programStatus.lastProcessDate = currentLineDate;

            if (programStatus.pause) {
                programStatus.pause = false;
                console.log(TAG + ' - Flag pause disabled.');
            }

            if (line.indexOf('NET: added client') >= 0) {

                const values = line.split('INFO')[1].trim().split('NET: added client')[1].substring(4).split('name=')[1].split('addr=');
                const username = values[0].trim();

                if (username) {
                    await axios.post(BOT_URL + '/api/user/event/'+ SERVER_ID, { username: username, event: 'connect', date: currentLineDateStr });
                }

            } else if (line.indexOf('INFO  NET  simulation paused') >= 0) {

                console.log(TAG + ' - Flag pause enable.');
                programStatus.pause = true;

            } else if (line.indexOf('initiatorPilotName=') >= 0) {
                if (line.indexOf('Scripting: event:type=takeoff') >= 0) {

                    let user = line.split(',').find(value => value.indexOf('initiatorPilotName=') >= 0).split('=')[1];
                    let place = line.split(',').find(value => value.indexOf('place=') >= 0).split('=')[1];

                    await axios.post(BOT_URL + '/api/user/event/'+ SERVER_ID, { username: user, event: 'takeoff', date: currentLineDateStr, place: place });

                } else if (line.indexOf('Scripting: event:type=land') >= 0) {
                    
                    let user = line.split(',').find(value => value.indexOf('initiatorPilotName=') >= 0).split('=')[1];
                    let place = line.split(',').find(value => value.indexOf('place=') >= 0).split('=')[1];

                    await axios.post(BOT_URL + '/api/user/event/'+ SERVER_ID, { username: user, event: 'land', date: currentLineDateStr, place: place });

                } else if (line.indexOf('Scripting: event:type=crash') >= 0) {
    
                    let user = line.split(',').find(value => value.indexOf('initiatorPilotName=') >= 0).split('=')[1];
                    await axios.post(BOT_URL + '/api/user/event/'+ SERVER_ID, { username: user, event: 'crash', date: currentLineDateStr });

                } else if (line.indexOf('Scripting: event:type=shot') >= 0) {
    
                    let user = line.split(',').find(value => value.indexOf('initiatorPilotName=') >= 0).split('=')[1];
                    let weapon = line.split(',').find(value => value.indexOf('weapon=') >= 0).split('=')[1];

                    await axios.post(BOT_URL + '/api/user/event/'+ SERVER_ID, { username: user, event: 'shot', date: currentLineDateStr, weapon: weapon });

                } else if (line.indexOf('Scripting: event:type=hit') >= 0) {
    
                    let user = line.split(',').find(value => value.indexOf('initiatorPilotName=') >= 0).split('=')[1];
                    let weapon = line.split(',').find(value => value.indexOf('weapon=') >= 0).split('=')[1];
                    let target = line.split(',').find(value => value.indexOf('target=') >= 0).split('=')[1];

                    await axios.post(BOT_URL + '/api/user/event/'+ SERVER_ID, { username: user, event: 'hit', date: currentLineDateStr, weapon: weapon, target: target });

                } else if (line.indexOf('Scripting: event:type=kill') >= 0) {
    
                    let user = line.split(',').find(value => value.indexOf('initiatorPilotName=') >= 0).split('=')[1];
                    let weapon = line.split(',').find(value => value.indexOf('weapon=') >= 0).split('=')[1];
                    let target = line.split(',').find(value => value.indexOf('target=') >= 0).split('=')[1];

                    await axios.post(BOT_URL + '/api/user/event/'+ SERVER_ID, { username: user, event: 'kill', date: currentLineDateStr, weapon: weapon, target: target });

                } else if (line.indexOf('Scripting: event:type=pilot dead') >= 0) {
    
                    let user = line.split(',').find(value => value.indexOf('initiatorPilotName=') >= 0).split('=')[1];

                    await axios.post(BOT_URL + '/api/user/event/'+ SERVER_ID, { username: user, event: 'pilot dead', date: currentLineDateStr });

                } else if (line.indexOf('Scripting: event:type=relinquished') >= 0) {
    
                    let user = line.split(',').find(value => value.indexOf('initiatorPilotName=') >= 0).split('=')[1];
                    
                    await axios.post(BOT_URL + '/api/user/event/'+ SERVER_ID, { username: user, event: 'relinquished', date: currentLineDateStr });

                } else if (line.indexOf('Scripting: event:targetPilotName=') >= 0) {
    
                    let user = line.split(',').find(value => value.indexOf('targetPilotName=') >= 0).split('=')[1];
                    let event = line.split(',').find(value => value.indexOf('type=') >= 0).split('=')[1];
                    let weapon = line.split(',').find(value => value.indexOf('weapon=') >= 0).split('=')[1];
                    let target = line.split(',').find(value => value.indexOf('target=') >= 0).split('=')[1];
                    
                    await axios.post(BOT_URL + '/api/user/event/'+ SERVER_ID, { username: user, event: 'enemy-' + event, weapon: weapon, target: target, date: currentLineDateStr });

                } else if (line.indexOf('Scripting: event:type=eject') >= 0) {

                    let user = line.split(',').find(value => value.indexOf('initiatorPilotName=') >= 0).split('=')[1];

                    await axios.post(BOT_URL + '/api/user/event/'+ SERVER_ID, { username: user, event: 'eject', date: currentLineDateStr });

                } else if (line.indexOf('Scripting: event:type=refuel stop') >= 0) {

                    let user = line.split(',').find(value => value.indexOf('initiatorPilotName=') >= 0).split('=')[1];

                    await axios.post(BOT_URL + '/api/user/event/'+ SERVER_ID, { username: user, event: 'refuel stop', date: currentLineDateStr });
                }
            }

            if (!programStatus.lastAlive || currentLineDate.diff(programStatus.lastAlive, 'minutes') >= 5) {
                programStatus.lastAlive = currentLineDate;
                await axios.post(BOT_URL + '/api/server-alive/' + SERVER_ID, { updated: currentLineDateStr } )
            }
        }
    })

});

cron.schedule('*/5 * * * *', async () => {
    if (programStatus.pause)
        await axios.post(BOT_URL + '/api/server-alive/' + SERVER_ID, {updated: programStatus.lastProcessDate.format('YYYY-MM-DD HH:mm:ss.SSS')});
});

//Comando para generar el ejecutable:
//pkg .\magios-datacollector-dcs.js --targets node10-win-x64 -o magios-datacollector-dcs.exe