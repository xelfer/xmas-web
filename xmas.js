const axios = require('axios');
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
	Stay: 141,
	BlindingLights: 203,
	SantaShark: 157,
	StarWars: 302,
	CandyCaneLane: 200,
	Beethoven: 83,
	Titanium: 245
}

const server = app.listen(port, () => {
	console.log(`12Brian app listening at https://12brian.st`)
})
const io = require('socket.io')(server);

// TODO: Can we get this directly from the API?
let status = {
	triggeredBy: null,
	id: null,
	sequenceStarted: null,
	sequenceDuration: null,
	sequenceShouldEnd: null
}

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
		const id = req.params.id;
		play(id)
			.then(() => {
				logUserInteraction(req);
				status = {
					id,
					triggeredBy: {
						userAgent: req.header('user-agent'),
						ip: req.ip,
					},
					sequenceDuration: sequenceDurations[id],
					sequenceStarted: now(),
					sequenceShouldEnd: now() + sequenceDurations[id]
				}
				io.emit("status", status)
				res.status(200).send();
			})
			.catch((error) => {
				console.error(error);
				res.status(500).send();
			})
	}
})

function play(id) {
	const isSequence = !!sequenceDurations[id];
	lastRan = now();
	lastRanSequence = isSequence ? { when: now(), id } : null;

	const url = `https://6bmeafujo3.execute-api.ap-southeast-2.amazonaws.com/prod/fpp/${id}.fseq`;

	console.log({url})
	return axios.get(url);
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
	// This should send status to newly joined user only
	io.to(socket.id).emit("status", status);
	// Update user count
	io.emit("users", io.engine.clientsCount)
	socket.on("disconnect", () => {
		console.log(`User left ${socket.id}`)
		io.emit("users", io.engine.clientsCount)
	})
})
