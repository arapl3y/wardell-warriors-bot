const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config()
const { getWebhook, postWebhook } = require('./controllers/webhooksController.js');

app = express().use(bodyParser.json());

app.get('/', (req, res) => { 
  res.status(200).json({ message: 'ok' });
})

app.get('/webhook', getWebhook);

app.post('/webhook', postWebhook);


app.listen(process.env.PORT, () => console.log(`webhook is listening on port: ${process.env.PORT}.`));