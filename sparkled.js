const axios = require('axios')
const express = require('express')
const app = express()
const port = 80


app.use(express.static('/var/www/sparkled/images'));

app.use(express.static('static'))

app.post('/playSequence/:id', (req, res) => {
	console.log("posting to api, " + req.params.id)
	axios.post('http://localhost:8080/api/player', {
		action: 'PLAY_SEQUENCE',
		sequenceId: req.params.id,
		'repeat': false
	})
		.then((res) => {
			fs = require('fs');
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
		})
		.catch((error) => {
			console.error(error)
		})
	res.end()
})

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})
