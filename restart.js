const fs = require('fs')
const axios = require('axios')
const express = require('express')
const app = express()


try {
	if (fs.existsSync('/var/www/sparkled/lastseq.txt')) {
		// file exists
		// open file and read contents
		var olddate = fs.readFileSync('/var/www/sparkled/lastseq.txt', 'utf8');
		var currentdate = Math.floor(new Date().getTime() / 1000);
		if (currentdate-olddate > 59) {
			// trigger the API 
			axios.post('http://localhost:8080/api/player', {
				action: 'PLAY_PLAYLIST',
				playlistId: 10,
				'repeat': true
			})
			.then((res) => {
				console.log(`statusCode: ${res.statusCode}`)
			})
			.catch((error) => {
				console.error(error)
                	})

			// delete the file
			try { 
				fs.unlinkSync('/var/www/sparkled/lastseq.txt')			
			} catch(err) {
				console.error(err)
			}
		}
	} else {
		// file doesnt exist
		console.log("file doesnt exist")
	}
} catch (err) {
	console.error(err)
}
	
