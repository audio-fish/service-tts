const express = require('express');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const storageClient = require('./storage-client');
const TTS = require('./tts');

const OUTPUT_DIRECTORY = './tmp';

const options = {
  voice: 'en-US_AllisonVoice', // Optional voice
  accept: 'audio/wav'
};

const app = express();


function validateFilename(name) {
	return /^[a-zA-Z0-9]{64}\.wav/.test(name); // validate sha256 format
}

function genHash(contents) {

return crypto.createHmac('sha256', 'here is my super secret key')
   .update(contents)
   .digest('hex');
}

mkdirp.sync(OUTPUT_DIRECTORY);

//CORS middleware
const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}


app.use(bodyParser.json());
app.use(allowCrossDomain);

// send an unfluffed payload... and create an audio stream from it...
app.post('/', function(req, res){
	console.log('post request');
	// have logic to bail out early if exists already
	const {text} = req.body;

	if (text) {
		const filename = `${genHash(text)}.wav`;
		const ttsStream = TTS.synthesize(Object.assign({text, options}));
		// @TODO enable block storage
		const fileWriteStream = fs.createWriteStream(`${OUTPUT_DIRECTORY}/${filename}`, {flags: 'wx'});

		var error = false;

		fileWriteStream.on('error', function (err) {
			if (err.code !== 'EEXIST') {
				console.error(err); // @todo better logging
			}
		})


		fileWriteStream.on('close', () => res.json({ wav : filename }));
		fileWriteStream.on('error', (err) => res.status(500).send(err));

		ttsStream.pipe(fileWriteStream);
	} else {
		res.status(400).send('no text content');
	}
});

app.get('/:file', function(req, res){
	const filename = req.params.file;
	console.log(`get request: ${filename}`);
	if (!validateFilename(filename)) {
		return res.status(400).send('invalid filename');
	}

	const fileReadStream = fs.createReadStream(`${OUTPUT_DIRECTORY}/${filename}`);
	res.set({'Content-Type' : 'audio/wav'});
	fileReadStream.pipe(res);
});


app.listen(8000);
console.log('listening on 8000');
