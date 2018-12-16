/*
*
*
*	Function to deal with log files
*
*
*/


//	Dependencies:
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const helpers = require('./helpers');


//	Container:
const logging = {};



//	Establish the base directory:
logging.baseDir = path.join(__dirname, '/../logs/');



//	Append a string to a file. Create the file if it does not exist:
const append = function(file, str) {

	//	First open file for appending:
	fs.open(logging.baseDir + file + '.log', 'a', (err, fd) => {
		//	If there is no file descriptor, throw err:
		if (!fd) throw err;

		//	Otherwise, append to the file and then close it:
		fs.appendFile(fd, str + '\n', (err) => {
			//	If err, throw err:
			if (err) throw err;

			//	Otherwise, close it:
			fs.close(fd, (err) => {
				//	If err, throw err:
				if (err) throw err;
			});
		});
	});
};


//	************************* New fangled stuff: **************************************************

//	Internal function:

const getLoggerForStatusCode = (statusCode) => {
	if (statusCode >= 500) {
		return console.error.bind(console);
	}
	if (statusCode >= 400) {
		return console.warn.bind(console);
	}

	return console.log.bind(console);
};

//	End of internal function



//	Logging function:
logging.logRequestStart = (req, res, next) => {

	let requestId = helpers.createRandomString(7);

		//	Build object:
	let x = {
		id: requestId,
		method: req.method,
		url: req.url,
		version: req.headers.dnt,
		referer: req.headers.referer,
		remoteClient: req.ip,
		user: req.user
	};

if (process.env.NODE_ENV === 'production') {

	//console.info(`This is my middleware: [${requestId}] ${req.method} ${req.url}`);

	//	This is to prevent any (possible) lingering event:
	const cleanup = () => {
		res.removeListener('finish', logFn);
		res.removeListener('close', abortFn);
		res.removeListener('error', errorFn);
	};

	//	Log all req & res activity:
	const logFn = () => {
		//	First clear events:
		cleanup();

		//	Add logger result to object:
		x.logger = getLoggerForStatusCode(res.statusCode);
		x.responses = {returnStatusCode: res.statusCode, returnStatusMessage: res.statusMessage, bytesSent: res.get('Content-Length') || 0};
		//	Append object to allLog file, (filename, str):
		append('logAll', JSON.stringify(x));
		//console.info(`${res.statusCode} ${res.statusMessage}; ${res.get('Content-Length') || 0}b sent`);

		if (res.statusCode > 400) {
		x.responses = {returnStatusCode: res.statusCode, returnStatusMessage: res.statusMessage, bytesSent: res.get('Content-Length') || 0};
		append("statusCodeError", JSON.stringify(x));
	};
	};


	//	Log req & res if client aborts request:
	const abortFn = () => {
		//	First clear all events:
		cleanup();
		x.responses = {returnStatusCode: res.statusCode, returnStatusMessage: res.statusMessage, bytesSent: res.get('Content-Length') || 0};
		//	Append object abortLog file, (filename, str):
		append('abortLog', JSON.stringify(x));
	//	console.warn('Request aborted by the client!');
	};

	// Log req & res if internal error occurs:
	const errorFn = err => {
		//	First clear all events:
		cleanup();
		x.responses = {returnStatusCode: res.statusCode, returnStatusMessage: res.statusMessage, bytesSent: res.get('Content-Length') || 0};
		//	Append object to errLog file, (filename, str):
		append('errLog', JSON.stringify(x));
		//console.error(`Request pipeline error: ${err}`);
	};

	res.on('finish', logFn); //		Successful pipeline, regardless of response
	res.on('close', abortFn); //	Aborted pipeline
	res.on('error', errorFn); //	Pipeline internal error

	next();

} else {

		res.on('finish', function() {
			x.responses = {returnStatusCode: res.statusCode, returnStatusMessage: res.statusMessage, bytesSent: res.get('Content-Length') || 0};
			console.info(JSON.stringify(x));
		});
		
		next();
};
};

//	********************************** End of new fangled stuff ***************************************************












//	Export Module:
module.exports = logging;