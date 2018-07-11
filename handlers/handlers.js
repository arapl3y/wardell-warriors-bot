const request = require('request');
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;


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

function handleMessage(senderPsid, receivedMessage) {
  let response;

  if (receivedMessage.text) {
    response = {
      "text": `You sent the message: "${receivedMessage.text}".`
    }
  }

  callSendAPI(senderPsid, response);
};

function getGameRounds() {
  let requestBody = {
    "team": "5164",
    "season": "16"
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
      return rounds;
    } else {
      console.log('fail')
    }
  })
};

function getNextGameTime() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  tomorrow.setHours(0, 0, 0, 0);

  rounds.forEach(round => {
    const compareRoundTime = new Date(round.timestamp * 1000);

    const roundTime = compareRoundTime.toLocaleTimeString();

    compareRoundTime.setHours(0, 0, 0, 0);

    if (+compareRoundTime === +tomorrow) {
      // send message
      // the next game is ${round.matches[0].name} at ${roundTime}
    }
  })
};



module.exports.handleMessage = handleMessage;