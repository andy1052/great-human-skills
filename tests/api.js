/*
*
*
*	Api testing logic
*
*
*/


//	Dependencies:
const server = require('../server');
const assert = require('assert');
const http = require('http');
const config = require('../config/config');
const econfig = require('../config/econfig');



//	Container:
const api = {};


//	Helper to craft http requests so they don't need to be rewritten every time:
const apiHelper = {};

apiHelper.makeGetRequest = function(path, callback) {

	//	Configure request details:
	let requestDetails = {
		"protocol": "http:",
		"hostname": "localhost",
		"port": 4000,
		"method": "GET",
		"path": path,
		"headers": {
			'Content-Type': 'application/json'
		}
	};

	//	Send the request:
	let req = http.request(requestDetails, (res) => {
		callback(res);
	});

	req.end();
};


//	***************************** End of Helpers *******************************************



//	The homepage should not throw:
api['homepage request should not throw'] = (done) => {
		apiHelper.makeGetRequest('/', (res) => {
			assert.strictEqual(res.statusCode, 200);
			done();
		});
	
};




//	Export module to test runner (index.js):
module.exports = api;
