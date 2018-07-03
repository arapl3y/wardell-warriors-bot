const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
require('dotenv').config()
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

app = express().use(bodyParser.json());

function handleMessage(senderPsid, receivedMessage) {
  let response;

  if (receivedMessage.text) {
    response = {
      "text": `You sent the message: "${receivedMessage.text}".`
    }
  }

  callSendAPI(senderPsid, response);
}

// function handlePostback(senderPsid, receivedPostback) {

// }

function callSendAPI(senderPsid, response) {
  let requestBody = {
    "recipient": {
      "id": senderPsid
    },
    "message": response
  }

  console.log(requestBody);

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
}

app.get('/', (req, res) => { 
  console.log(req);
  res.status(200).json({ message: 'ok' });
})

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
})

app.post('/webhook', (req, res) => {
  let body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(function(entry) {
      let webhookEvent = entry.messaging[0];
      console.log(webhookEvent);

      let senderPsid = webhookEvent.sender.id;
      console.log('Sender PSID: ' + senderPsid );

      if (webhookEvent.message) {
        handleMessage(senderPsid, webhookEvent.message);
      } else if (webhookEvent.postback) {
        handlePostback(senderPsid, webhookEvent.postback);
      }
    });
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
})


app.listen(process.env.PORT || 1337, () => console.log('webhook is listening...'));