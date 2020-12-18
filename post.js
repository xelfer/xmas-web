const axios = require('axios')

axios
  .post('http://localhost:8080/api/player', {
	    "action": "PLAY_SEQUENCE",
	    "sequenceId": 10,
	    "repeat": false
	  })
  .then((res) => {
	      console.log(`statusCode: ${res.statusCode}`)
	      console.log(res)
	    })
  .catch((error) => {
	      console.error(error)
	    })
