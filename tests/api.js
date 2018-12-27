/*
*
*
*	Api rest routes testing logic
*
*
*/


//	Dependencies:
const server = require('../server');
const assert = require('assert');
const http = require('http');
const config = require('../config/config');


//	Container:
const api = {};


//	Helper to craft http requests so they don't need to be rewritten every time:
const apiHelper = {};

apiHelper.makeGetRequest = function(path, callback) {

	//	Configure request details:
	let requestDetails = {
		"protocol": "http:",
		"hostname": "localhost",
		"port": config.port,
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

console.log("RES:", res.statusCode);

			assert.strictEqual(res.statusCode, 200);
			done();
		});
	
};


//	Login page should not throw:
api['login request should not throw'] = (done) => {
	apiHelper.makeGetRequest('/login', (res) => {
		assert.strictEqual(res.statusCode, 200);
		done();
	});
};


//	Sign up page should not throw:
api['sign-up page should not throw'] = (done) => {
	apiHelper.makeGetRequest('/sign-up', (res) => {
		assert.strictEqual(res.statusCode, 200);
		done();
	});
};

//	Words are all you've got page should no throw:
api['All youve got page should not throw'] = (done) => {
	apiHelper.makeGetRequest('/allYouveGot', (res) => {
		assert.strictEqual(res.statusCode, 200);
		done();
	});
};


//	This route does not exist and should throw:
api['This Route does not exist and should throw'] = (done) => {
	apiHelper.makeGetRequest('/daveWasHere', (res) => {
		assert.strictEqual(res.statusCode, 404);
		done();
	});
};


api['Unauthorized should not throw'] = (done) => {
	apiHelper.makeGetRequest('/Unauthorized', (res) => {
		assert.strictEqual(res.statusCode, 200);
		done();
	});
};

api['/emailForm should not throw'] = (done) => {
	apiHelper.makeGetRequest('/emailForm', (res) => {
		assert.strictEqual(res.statusCode, 200);
		done();
	});
};


api['/editAccount should not throw'] = (done) => {
	apiHelper.makeGetRequest('/editAccount', (res) => {
		assert.strictEqual(res.statusCode, 302);
		done();
	});
};


api['/accountDelete should not throw'] = (done) => {
	apiHelper.makeGetRequest('/account-delete', (res) => {
		assert.strictEqual(res.statusCode, 302);
		done();
	});
};


api['Logout should not throw'] = (done) => {
	apiHelper.makeGetRequest('/logout', (res) => {
		assert.strictEqual(res.statusCode, 200);
		done();
	});
};



//	Export module to test runner (index.js):
module.exports = api;
