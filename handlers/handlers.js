const request = require('request');
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const isThisWeek = require('date-fns/is_this_week');
const isFuture = require('date-fns/is_future');
const format = require('date-fns/format');


function callSendAPI(senderPsid, response) {
  let requestBody = {
    "recipient": {
      "id": senderPsid
    },
    "message": response
  }

  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": requestBody
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error('Unable to send message: ' + err);
    }
  })
};

function handleMessage(name, time, senderPsid) {
  let response;

  if (name && time) {
    response = {
      "text": `Next game: ${name}, is at ${time}.`
    }
  }

  callSendAPI(senderPsid, response);
};

function getGameRounds(senderPsid, receivedMessage) {
  let requestBody = {
    "team": "5164",
    "season": "106"
  };

  const headers = {
    'Origin': 'https://www.sbl.com.au',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9,la;q=0.8',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
    'Content-Type': 'application/json',
    'Accept': '*/*',
    'Referer': 'https://www.sbl.com.au/team.html?team=5164',
    'Connection': 'keep-alive',
    'DNT': '1',
    'x-api-key': 'JWzX2s1XDq501L879TtFCel8nebvIO9925ZTGETf'
  };

  request({
    "headers": headers,
    "uri": "https://lq9ek7vux0.execute-api.ap-southeast-2.amazonaws.com/prod/sbl_get_team_info",
    "method": "POST",
    "json": requestBody,
  }, (err, res, body) => {
    if (!err) {
      const rounds = Object.values(body.data.rounds);
      getNextGameTime(rounds, senderPsid, receivedMessage);
    } else {
      throw Error(err);
    }
  })
};

function getNextGameTime(rounds, senderPsid, receivedMessage) {
  rounds.forEach(round => {  
    let roundTime = new Date(round.timestamp * 1000);

    if (isThisWeek(roundTime) && isFuture(roundTime)) {
      roundTime = format(roundTime, 'h:mma')
      handleMessage(round.matches[0].name, roundTime, senderPsid, receivedMessage);
    }
  })
};



module.exports.getGameRounds = getGameRounds;