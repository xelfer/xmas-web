const axios = require('axios');

let url = 'http://n.triso.me:2525/fppd/status';

await axios.get(url);

let responseBody = {
     sequence: sequence,
};

let responseCode = 200;

let response = {
     statusCode: responseCode,
     headers: {
         "x-custom-header" : "my custom header value"
     },
     body: JSON.stringify(responseBody)
 };

 console.log(response);