const axios = require('axios');

async function idleCheck() {

	let url = 'http://n.triso.me:2525/api/fppd/status';

	res = await axios.get(url);

	let sequence = res.data['current_sequence'];

	if (sequence == "")  {
		let idle = 'http://n.triso.me:2525/api/playlist/Idle.fseq/start';
		trigger = await axios.get(idle);
	}
	else
		console.log('currently playing ' + sequence);

}

(async() => { await idleCheck(); } )();
