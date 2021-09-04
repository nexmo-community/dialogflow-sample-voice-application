'use strict'

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
// const expressWs = require('express-ws')(app);
// const { Readable } = require('stream');
// const cors = require('cors');
// const https = require('https');
// const dialogflow = require('dialogflow');
// const Conversation = require('./conversations');

// const prefix = "https://";
// const wsprefix = "wss://";

const dfConnectingServer = process.env.DF_CONNECTING_SERVER;

const serviceNumber = process.env.SERVICE_NUMBER;
console.log ("Service number:", serviceNumber);

const port = process.env.PORT || 8000; // This Node.js server port

//------

const Vonage = require('@vonage/server-sdk');

const vonage = new Vonage({
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_SECRET,
  applicationId: process.env.APP_ID,
  privateKey: './private.key'
});

//==========================================================

app.use(bodyParser.json());

//----

// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   res.header("Access-Control-Allow-Methods", "OPTIONS,GET,POST,PUT,DELETE");
//   res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
//   next();
// });

//---------------------------

app.get('/answer', (req, res) => {

  const uuid = req.query.uuid;

  app.set('call_type_' + uuid, "not_websocket"); // info will be used to start a websocket after transfer of this call leg to conference

  const nccoResponse = [
    {
      "action":"talk",
      "text":"Connecting your call, please wait.",
      "language": "en-US",
      "style": 11   // See https://developer.nexmo.com/voice/voice-api/guides/text-to-speech
    },
    {
      "action": "conversation",
      "endOnExit": true,  // So the WebSocket will be automatically terminated when this call leg ends
      "name": "conference_" + req.query.uuid
    }
  ];

  res.status(200).json(nccoResponse);

});

//---------

app.post('/event', (req, res) => {

  const uuid = req.body.uuid;

  //--

  if (req.body.type == 'transfer'){

    if ( app.get('call_type_' + uuid) == "not_websocket") {

      const hostName = `${req.hostname}`;
    
      vonage.calls.create({
        to: [{
          'type': 'websocket',
          'uri': 'wss://' + dfConnectingServer + '/socket?original_uuid=' + uuid + '&vapi_app_host=' + hostName + '&analyze_sentiment=true',
          'content-type': 'audio/l16;rate=16000',
          'headers': {}
        }],
        from: {
          type: 'phone',
          number: serviceNumber
        },
        answer_url: ['https://' + hostName + '/ws_answer?original_uuid=' + uuid],
        answer_method: 'GET',
        event_url: ['https://' + hostName + '/ws_event?original_uuid=' + uuid],
        event_method: 'POST'
        }, (err, res) => {
        if (err) {
          console.error(">>> WebSocket create error:", err);
          console.error(err.body.title);
          console.error(err.body.invalid_parameters);
        }
        else { console.log(">>> WebSocket create status:", res); }
      });

    };  

  };

  //--

  if (req.body.status == 'completed'){

    if ( app.get('call_type_' + uuid) == "not_websocket") {
      app.set('call_type_' + uuid, undefined);
    }
  };

  //--

  res.status(200).send('Ok');

});

//-----------------------------------------

app.get('/ws_answer', (req, res) => {
  
  // const date = new Date().toLocaleString();
  // console.log(">>> ws_answer at " + date);
  // console.log(">>> caller call leg uuid:", req.query.original_uuid);
  // console.log(">>> websocket leg uuid:", req.query.uuid);

  const nccoResponse = [
    {
      "action": "conversation",
      "name": "conference_" + req.query.original_uuid
    }
  ];

  // console.log('>>> nccoResponse:\n', nccoResponse);

  res.status(200).json(nccoResponse);

});

//-----------------------------------------

app.post('/ws_event', (req, res) => {

  // TBD - if second switch case is not needed, change the "switch" to a "if"
  switch (req.body.status) {

    case "answered":

      const wsUuid = req.body.uuid;

      // Get Dialogflow to say its welcome greeting right from the start
      setTimeout(() => {
        vonage.calls.talk.start(wsUuid, {text: 'Hello', language: 'en-US', style: 11  , loop: 1}, (err, res) => {
          if (err) { console.error('>>> TTS to bot websocket ' + wsUuid + 'error:', err); }
          else {console.log ('>>> TTS to bot websocket ' + wsUuid + ' ok!')}
        });
      }, 2000);  
      
      break;

    // case "completed":

    //   // Original call uuid
    //   const uuid = req.query.orig_uuid; // Original call uuid
      
    //   // Free up memory space as the timers array for this call is no longer needed
    //   app.set(`playtimers_${uuid}`, undefined);
      
    //   break;  
  }

  res.status(200).send('Ok');

});

//-----------------------------------------

app.post('/analytics', (req, res) => {

  console.log(">>> Transcripts and caller's speech sentiment score:", req.body);
 
  res.status(200).send('Ok');

});

//-----------------------------------------

app.use('/', express.static(__dirname));

//-----------

app.listen(port, () => console.log(`Server application listening on port ${port}!`));

//------------
