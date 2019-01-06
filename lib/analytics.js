/*
*
*
*	Middleware logic for Google measurement protocol tool (Google Analytics)
*
*
*/


//	Dependencies:
const http = require('http');
const querystring = require('querystring');


//	Container:
const analyze = {};


//	function to post data to google server:
analyze.postData = function(req, res, next) {

	//	Sanitize Data:

	try {

		//	Build object:
		let event = {
			v: 1,
			tid: 'UA-131751558-1',
			cid: 555,
			t: 'pageview',
			dh: req.url,
			dp: req.url,
			dt: req.url

		};

		//	Stringify object to form-url-encode:
	let data = querystring.stringify(event);


	console.log("DATA: ", data);


	let options = {
		hostname: 'www.google-analytics.com',
		// port: 3000,
		path: '/collect',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	};

console.log("OPTIONS: ", options);

	let greq = http.request(options, (res) => {

		res.on('data', (d) => {
			process.stdout.write(d);
		});

		console.log("response: ", res.statusCode);

	});

greq.on('error', (err) => {
	console.error(err);
});

greq.end(data);

next();

	} catch(e) {
		console.error(e);
		next(e);
	};
};








//	Export module:
module.exports = analyze;