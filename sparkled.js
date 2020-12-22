const axios = require('axios')
const express = require('express')
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.static('static'))

let lastRan = null;
let lastRanSequence = null;

app.post('/playSequence/:id', (req, res) => {
	console.log({ lastRan })
	console.log({ lastRanSequence })
	// Slow down partner, 3 second cool off
	if (lastRan && (now() - lastRan < 3)) {
		console.log('Cool down!');
		res.status(425).send();
	}
	// Check if music sequence started within last 30 seconds
	if (lastRanSequence && (now() - lastRanSequence < 30)) {
		console.log('Cool down due to sequence!');
		res.status(425).send();
	}
	// Otherwise we're good to go.
	else {
		play(req);
		res.status(200).send();
	}
})

function play(req) {

	const id = req.params.id && parseInt(req.params.id);
	console.log({ id })
	lastRan = now();
	lastRanSequence = (id === 14 || id === 59) ? now() : null;

	axios.post('http://localhost:8080/api/player', {
		action: 'PLAY_SEQUENCE',
		sequenceId: id,
		'repeat': false
	})
		.then((res) => {
			logUserInteraction(req);
		})
		.catch((error) => {
			// console.error(error)
		})
}

// Return current time rounded to the second
function now() {
	return Math.floor(new Date().getTime() / 1000);
}

// Store user IPs to a text file
function logUserInteraction(req) {
	fs.appendFile('users.txt', req.headers['x-forwarded-for'].split(',')[0], function (err) {
		if (err) return console.log(err);
	});
	fs.appendFile('users.txt', ',', function (err) {
		if (err) return console.log(err);
	});
}

function reset() {
	console.log("Resetting to fallback sequence due to inactivity");
	axios.post('http://localhost:8080/api/player', {
		action: 'PLAY_PLAYLIST',
		playlistId: 10,
		'repeat': true
	})
		.then((res) => {
			console.log(`Received statusCode: ${res.statusCode}`)
		})
		.catch((error) => {
			console.error(error)
		})
}

function tick() {
	const hour = new Date().getHours();
	// Only run between 6pm (1800) and 11pm (2300)
	if (hour > 17 && hour < 23) {
		// If no user input in the last minute
		if (lastRan && (now() - lastRan > 59)) {
			reset();
			lastRan = null; // clear this out as it wasn't a user who changed this
		}

	}
}


// -----------------

// Runs every second
setInterval(tick, 1000);

app.listen(port, () => {
	console.log(`12Brian app listening at http://localhost:${port} or http://12brian.st`)
})
