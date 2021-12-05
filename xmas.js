const axios = require('axios');
const express = require('express')
const fs = require('fs');
const sequenceDurations = require('./sequenceDurations');
const app = express();
const port = 8080;

const server = app.listen(port, () => {
	console.log(`12Brian app listening at https://12brian.st`)
})
const io = require('socket.io')(server, {
	cors: {
		origin: "http://localhost:8080",
		methods: ["GET", "POST"]
	}
});

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

let lastRanSequence = null;

app.post('/playSequence/:id', (req, res) => {

	// Check if music sequence is playing
	const isPlaying = lastRanSequence && lastRanSequence.when && (now() - lastRanSequence.when) < sequenceDurations[lastRanSequence.id].duration

	if (isPlaying) {
		console.log('Already playing a sequence!');
		res.status(425).send();
	}
	// Otherwise we're good to go.
	else {
		const id = req.params.id;
		play(id)
			.then(() => {
				logUserInteraction(req);
				const sequence = sequenceDurations[id];
				status = {
					id,
					title: sequence.title,
					triggeredBy: {
						userAgent: req.header('user-agent'),
						ip: req.ip,
					},
					sequenceDuration: sequence.duration,
					sequenceStarted: now(),
					sequenceShouldEnd: now() + sequence.duration
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
	lastRanSequence = isSequence ? { when: now(), id } : null;
	const url = `https://6bmeafujo3.execute-api.ap-southeast-2.amazonaws.com/prod/fpp/${id}.fseq`;
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


// -----------------

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
