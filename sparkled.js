const axios = require('axios')
const express = require('express')
const app = express()
const port = 80


app.use(express.static('/var/www/sparkled/images'));

app.get('/', (req, res) => {
	res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
	res.setHeader("Pragma", "no-cache"); // HTTP 1.0.
	res.setHeader("Expires", "0"); // Proxies.
	res.sendFile('index.html', { root: __dirname })
})

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
		})
		.catch((error) => {
			console.error(error)
		})
	res.end()
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
