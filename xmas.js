const axios = require('axios');
const { Socket } = require('dgram');
const express = require('express')
const fs = require('fs');
const app = express();
const port = 8080;

const sequenceDurations = {
	Bluey: 127,
	Manger: 160,
	Bangarang: 206,
	ChristmasTime: 240,
	Dynamite: 199,
	IBTLALLC: 207,
	LIS: 125,
	MJ: 341,
	Mariah: 241,
	Queen: 263,
	Squid: 133,
	Stay: 141.
	BlindingLights: 203
}

const server = app.listen(port, () => {
	console.log(`12Brian app listening at https://12brian.st`)
})
const io = require('socket.io')(server);


app.use('/', express.static('static'))
app.use('/watch', express.static('static/watch'))

let lastRan = null;
let lastRanSequence = null;

app.post('/playSequence/:id', (req, res) => {
	console.log({ lastRan })
	console.log({ lastRanSequence })
	// Slow down partner, 3 second cool off
	if (lastRan && (now() - lastRan < 3)) {
		console.log('Cool down!');
		res.status(429).send();
	}
	// Check if music sequence started within last seconds
	if (lastRanSequence && lastRanSequence.when &&
		(now() - lastRanSequence.when < sequenceDurations[lastRanSequence.id])) {
		console.log('Cool down due to sequence!');
		res.status(425).send();
	}
	// Otherwise we're good to go.
	else {
		console.log(req.params.id);
		play(req);
		console.log(req.params.id);
		res.status(200).send();
	}
})

function play(req) {
	const id = req.params.id;
	const isSequence = !!sequenceDurations[id];
	lastRan = now();
	lastRanSequence = isSequence ? { when: now(), id } : null;

	console.log('https://6bmeafujo3.execute-api.ap-southeast-2.amazonaws.com/prod/fpp/' + id + '.fseq')
	axios.get('https://6bmeafujo3.execute-api.ap-southeast-2.amazonaws.com/prod/fpp/' + id + '.fseq')
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
	fs.appendFile('users.txt', req.params.id + ' ' + req.headers['x-forwarded-for'].split(',')[0] + ' ' + req.get('User-Agent') + '\n', function (err) {
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
	if (hour > 17 && hour < 24) {
		// If no user input in the last minute
		if (lastRan && (now() - lastRan > 90)) {
			//reset();
			lastRan = null; // clear this out as it wasn't a user who changed this
		}

	}
}


// -----------------

// Runs every second
setInterval(tick, 1000);

io.on("connection", socket => {
	console.log(`User joined ${socket.id}`)
	io.emit("users", io.engine.clientsCount)
	socket.on("disconnect", () => {
		console.log(`User left ${socket.id}`)
		io.emit("users", io.engine.clientsCount)
	})
})
