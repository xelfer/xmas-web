const axios = require('axios')
const express = require('express')
const app = express()
const port = 80

app.use(express.static('/var/www/sparkled/images'));

app.use(express.static('static'))

fs = require('fs');
app.post('/playSequence/:id', (req, res) => {
        // check if music sequence started within last 30 seconds
	if (fs.existsSync('/var/www/sparkled/musicisplaying.txt')) {
                var olddate = fs.readFileSync('/var/www/sparkled/musicisplaying.txt', 'utf8');
                var currentdate = Math.floor(new Date().getTime() / 1000);
                if (currentdate - olddate > 30) {
			play(req);
		} else {
			// i need the alert the user somehow
			//res.end(1)
		}
	} else {
		play(req);		
	}
	res.end()
})

function play(req) {
	axios.post('http://localhost:8080/api/player', {
		action: 'PLAY_SEQUENCE',
		sequenceId: req.params.id,
		'repeat': false
		})
		.then((res) => {
			fs.writeFile('lastseq.txt', Math.floor(new Date().getTime() / 1000), function (err) {
				if (err) return console.log(err);
			});
			console.log(`statusCode: ${res.statusCode}`)
			fs.appendFile('users.txt', req.headers['x-forwarded-for'].split(',')[0], function (err) {
				if (err) return console.log(err);
			});
			fs.appendFile('users.txt', ',', function (err) {
				if (err) return console.log(err);
			});
			if (req.params.id == 14 || req.params.id == 59) {
				fs.appendFile('musicisplaying.txt', ',', function (err) {
					if (err) return console.log(err);
				});
			}
	})
	.catch((error) => {
		console.error(error)
	})
}

app.listen(port, () => {
	console.log(`12Brian app listening at http://12brian.st`)
})
