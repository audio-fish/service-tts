const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const storageClient = require('./storage-client');
const TTS = require('./tts');

const options = {
  voice: 'en-US_AllisonVoice', // Optional voice
  accept: 'audio/wav'
};

const app = express();

const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}


app.use(bodyParser.json());
app.use(allowCrossDomain);


function validateFilename(name) {
	return /^[a-zA-Z0-9]{64}\.wav/.test(name); // validate sha256 format
}

function genHash(contents) {

return crypto.createHmac('sha256', 'here is my super secret key')
   .update(contents)
   .digest('hex');
}

// send an unfluffed payload... and create an audio stream from it...
app.post('/', function(req, res){
	console.log('post request');
	// have logic to bail out early if exists already
	const {text} = req.body;
	if (text) {
		const filename = `${genHash(text)}.wav`;
		const ttsStream = TTS.synthesize(Object.assign({text, options}));

		// @todo
		// optimize this by writing to local file stream which will immediately be available fo rread
		// every time a readStream is opened on it add a counter
		// ... if counter is 0 and object store stream exists delete it // delete process
		// ... if counter > 0 set a timeout to try and delete it...
		const uploadStream = storageClient.upload({
			container: 'tts',
			remote: filename
		});

		ttsStream.pipe(uploadStream);
		uploadStream.on('success', () => res.json({ wav : filename }));
		uploadStream.on('error', (err) => res.status(500).send(err));

	} else {
		res.status(400).send('no text content');
	}
});

app.get('/:file', function(req, res){
	const filename = req.params.file;
	console.log(`get request: ${filename}`);
	if (!validateFilename(filename)) {
		return res.status(400).send('invalid filenamename');
	}
	res.set({'Content-Type' : 'audio/wav'});
	const downloadStream = storageClient.download({
		container: 'tts',
		remote: filename
	});
	downloadStream.pipe(res);
});


app.listen(8000);
