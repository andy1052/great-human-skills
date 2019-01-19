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
const aconfig = require('../config/aconfig');


//	Container:
const analyze = {};


//	function to post data to google server:
analyze.postData = function(req, res, next) {

	//	Sanitize Data:
// console.log("What----------------------------------------------? : ", req.cookies.GHScid);


	try {

		//	Build object:
		let pageview = {
			v: 1,
			tid: aconfig.tid,
			cid: req.cookies.GHScid,
			t: 'pageview',
			dh: req.url,
			dp: req.url,
			dt: req.url
		};

		//	Stringify object to form-url-encode:
	let data = querystring.stringify(pageview);


	// console.log("DATA: ", data);


	let options = {
		hostname: 'www.google-analytics.com',
		path: '/collect',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	};

// console.log("OPTIONS: ", options);

	let greq = http.request(options, (res) => {

		res.on('data', (d) => {
			process.stdout.write(d);
		});

		// console.log("response: ", res.statusCode);

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