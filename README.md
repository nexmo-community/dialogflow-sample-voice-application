# Vonage API - Google Dialogflow integration sample application

This sample application allows you to call a phone number to interact with a Google Dialogflow agent using Vonage Voice API, including getting real time transcripts and sentiment analysis.

This application uses a Dialogflow reference connection code (more details below) for the actual 2-way audio interaction with the Dialogflow agent.

## About this sample application

This sample application makes use of Vonage Voice API to answer incoming voice calls and set up a WebSocket connection to stream audio to and from the Dialogflow reference connection for each call.

The Dialogflow reference connection code will:
- Send audio to the Dialogflow agent from caller's speech,
- Stream audio responses from the Dialogflow agent to the caller via the WebSocket,
- Post back in real time transcripts and caller's speech sentiment scores via webhooks call back to this Voice API sample application.

Once this application will be running, you call in to the **`phone number linked`** to your application (as explained below) to interact via voice with your Dialogflow agent.</br>

## Set up the Dialogflow reference connection code - Host server public hostname and port

First set up a Dialogflow reference connection code from the [dialogflow-reference-connection](https://github.com/nexmo-community/dialogflow-reference-connection).

Default local (not public!) reference connection code `port` is: 5000.

If you plan to test using `Local deployment` with ngrok (Internet tunneling service) for both the Dialogflow reference connection code and this sample application, you may set up [multiple ngrok tunnels](https://ngrok.com/docs#multiple-tunnels).

For the next steps, you will need:
- The Dialogflow reference connection code server's public hostname and if necessary public port.</br>

e.g. `xxxxxxxx.ngrok.io`, `xxxxxxxx.herokuapp.com`, `myserver.mycompany.com:32000`  (as **`DF_CONNECTING_SERVER`**, no `port`, https:// nor http:// are necessary with ngrok or heroku as public hostname)

## Set up your Vonage Voice API application credentials and phone number

[Log in to your](https://dashboard.nexmo.com/sign-in) or [sign up for a](https://dashboard.nexmo.com/sign-up) Vonage APIs account.

Go to [Your applications](https://dashboard.nexmo.com/applications), access an existing application or [+ Create a new application](https://dashboard.nexmo.com/applications/new).

Under Capabilities section (click on [Edit] if you do not see this section):

Enable Voice
- Under Answer URL, leave HTTP GET, and enter https://\<host\>:\<port\>/answer (replace \<host\> and \<port\> with the public host name and if necessary public port of the server where this sample application is running)</br>
- Under Event URL, **select** HTTP POST, and enter https://\<host\>:\<port\>/event (replace \<host\> and \<port\> with the public host name and if necessary public port of the server where this sample application is running)</br>
Note: If you are using ngrok for this sample application, the answer URL and event URL look like:</br>
https://yyyyyyyy.ngrok.io/answer</br>
https://yyyyyyyy.ngrok.io/event</br> 	
- Click on [Generate public and private key] if you did not yet create or want new ones, save the private.key file in this application folder.</br>
**IMPORTANT**: Do not forget to click on [Save changes] at the bottom of the screen if you have created a new key set.</br>
- Link a phone number to this application if none has been linked to the application.

Please take note of your **application ID** and the **linked phone number** (as they are needed in the very next section.)

For the next steps, you will need:</br>
- Your [Vonage API key](https://dashboard.nexmo.com/settings) (as **`API_KEY`**)</br>
- Your [Vonage API secret](https://dashboard.nexmo.com/settings), not signature secret, (as **`API_SECRET`**)</br>
- Your `application ID` (as **`APP_ID`**),</br>
- The **`phone number linked`** to your application (as **`SERVICE_NUMBER`**), your phone will **call that number**,</br>
- The Dialogflow reference connection code server public hostname and port (as **`DF_CONNECTING_SERVER`**)</br>

## Overview on how this sample Voice API application works

- On an incoming call to the **`phone number linked`** to your application, GET `/answer` route plays a TTS greeting to the caller ("action": "talk"), then start a WebSocket connection to the Dialogflow agent reference connection ("action": "connect"),
- Once the WebSocket is established (GET `/ws_event` with status "answered"), it plays a TTS greeting to this Dialogflow agent, as the Dialogflow agent expects the user to speak first, we need to start the conversation as one would do in a phone call, with the answerer greeting the caller. The result is that the caller will immediately hear the Dialogflow agent initial greeting (e.g. "How may I help you?") without having to say anything yet.
You can customize that inital TTS played to Dialogflow to correspond to your Dialogflow agent programming and use case.
- Transcripts and sentiment scores will be received by this application in real time,</br>
- When the caller hangs up, both phone call leg and WebSocket leg will be automatically terminated.

## Running Dialogflow sample Voice API application

You may select one of the following 2 types of deployments.

### Local deployment

To run your own instance of this sample application locally, you'll need an up-to-date version of Node.js (we tested with version 14.3.0).

Download this sample application code to a local folder, then go to that folder.

Copy the `.env.example` file over to a new file called `.env`:
```bash
cp .env.example .env
```

Edit `.env` file, and set the five parameter values:</br>
API_KEY=</br>
API_SECRET=</br>
APP_ID=</br>
SERVICE_NUMBER=</br>
DF_CONNECTING_SERVER=</br>


Install dependencies once:
```bash
npm install
```

Launch the applicatiom:
```bash
node df-application
```

### Command Line Heroku deployment

You must first have deployed your application locally, as explained in previous section, and verified it is working.

Install [git](https://git-scm.com/downloads).

Install [Heroku command line](https://devcenter.heroku.com/categories/command-line) and login to your Heroku account.

If you do not yet have a local git repository, create one:</br>
```bash
git init
git add .
git commit -am "initial"
```

Start by creating this application on Heroku from the command line using the Heroku CLI:

```bash
heroku create myappname
```

Note: In above command, replace "myappname" with a unique name on the whole Heroku platform.

On your Heroku dashboard where your application page is shown, click on `Settings` button,
add the following `Config Vars` and set them with their respective values:</br>
API_KEY</br>
API_SECRET</br>
APP_ID</br>
SERVICE_NUMBER</br>
DF_CONNECTING_SERVER</br>

add also the parameter PRIVATE_KEY_FILE with the value ./private.key</br>

Now, deploy the application:


```bash
git push heroku master
```

On your Heroku dashboard where your application page is shown, click on `Open App` button, that hostname is the one to be used under your corresponding [Vonage Voice API application Capabilities](https://dashboard.nexmo.com/applications) (click on your application, then [Edit]).</br>

For example, the respective links would be like:</br>
https://myappname.herokuapp.com/answer</br>
https://myappname.herokuapp.com/event</br>

See more details in above section **Set up your Vonage Voice API application credentials and phone number**.






From any phone, dial the Vonage number (the one in the .env file).  This will connect to the DialogFlow agent (as specified in the .env file), and you will be able to have voice interaction with it.
