const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const { getGameRounds } = require('../handlers/handlers.js');

function getWebhook(req, res) {
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
}

function postWebhook(req, res) {
  let body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(function(entry) {
      let webhookEvent = entry.messaging[0];

      let senderPsid = webhookEvent.sender.id;

      if (webhookEvent.message) {
        getGameRounds(senderPsid, webhookEvent.message);
      } else if (webhookEvent.postback) {
        console.log('No postback response currently set up');
      }
    });
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
}

module.exports.postWebhook = postWebhook;
module.exports.getWebhook = getWebhook;