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
const helpers2 = require('./helpers2');

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

 	let requestId = helpers2.createRandomString(7);

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


//	Function to list all ".log" files, used to compress/decompress log files:
//	Function has option to include currently compressed files in its return:
logging.list = function(includeCompressedLogs, callback) {

	//	Read the directory:
	fs.readdir(logging.baseDir, (err, data) => {

		if (!err && data && data.length > 0) {
			//	Initialize array to store results:
			let trimmedFileNames = [];
			//	Loop through data:
			data.forEach((fileName) => {
				//	Add the .log files to array:
				if (fileName.indexOf('.log') > -1) {
					trimmedFileNames.push(fileName.replace('.log', ''));
				}

				//	If includeCompressedLogs is true, add .gz files to array:
				if (fileName.indexOf('.gz.b64') > -1 && includeCompressedLogs) {
					trimmedFileNames.push(fileName.replace('.gz.b64', ''));
				}
			});
			//	Return trimmedFileNames:
			callback(false, trimmedFileNames);

		} else {
			//	Otherwise, callback an error:
			callback({"Error": "There's been an error in logging.list!"}, null);
		};
	});
};




//	Function to compress log files from .log to .gz.b64 files within the same directory:
logging.compress = function(logId, newField, callback) {

	try {

	let sourceFile = logId + '.log';
	let destFile = newField + '.gz.b64';

	//	Read the source file:
	fs.readFile(logging.baseDir + sourceFile, 'utf-8', (err, inputString) => {

		//	If there's an error, throw it:
		if (err) throw new Error("There was an error reading the file!");

		//	Otherwise, compress the data using gzip:
		zlib.gzip(inputString, (err, buffer) => {

			//	If there's an error, throw it:
			if (err) throw new Error("There wa an error compressing the file!");

			//	Otherwise, send newly compressed data to the destination file:
			fs.open(logging.baseDir + destFile, 'wx', (err, fd) => {

				//	If err, throw err:
				if (err) throw new Error("There was an error opening destination file!");

				//	Otherwise, write to the destination file:
				fs.writeFile(fd, buffer.toString('base64'), (err) => {
					//	If there was an error, throw it:
					if (err) throw new Error("There was an error writing the file to destination!");

					//	Otherwise, close the file descriptor:
					fs.close(fd, (err) => {
						//	If err, throw err:
						if (err) throw new Error("There was an error closing the file!");

						//	Otherwise, confirm it:
						console.log("Compress File was closed!");						
						callback(false);
					});
				});
			});
		});

	});

	} catch(e) {
		console.error(e.message);
		callback(e);
	};
};



//	Function to decompress the contents of a gz.b64 file into a string variable:
logging.decompress = function(fileId, callback) {

	try {
		let file = fileId + '.gz.b64';

		//	Read the file:
		fs.readFile(logging.baseDir + file, 'utf-8', (err, str) => {
			//	If err, throw err:
			if (err) throw new Error("There was an error reading the file!");

			//	Otherwise, decompress the data:
			let inputBuffer = Buffer.from(str, 'base64');
			zlib.unzip(inputBuffer, (err, outputBuffer) => {
				//	If err, throw err:
				if (err) throw new Error("There was an error decompressing the file!");

				//	Otherwise, return result:
				let string = outputBuffer.toString();
				callback(false, string);
			});
		});
	} catch(e) {
		console.error(e.message);
		callback(e);
	};
};



//	Function to truncate a log file:
logging.truncate = function(logId, callback) {

	try {
		fs.truncate(logging.baseDir + logId + '.log', 0, (err) => {
			if (err) throw new Error("There was an error truncating the file!");

			//	Otherwise, confirm:
			console.info("File has been truncated.");
			callback(false);
		});

	} catch(e) {
		console.error(e.message);
		callback(e);
	};
};




//	Function to log Email related data:
logging.emailLog = function(emailData) {

//	This log will happen in ALL ENVIRONMENTS, not just production!!!

	//	Sanitize Data:
	let eData = typeof(emailData) === 'object' ? emailData : false;

	try {

		// Get an id for the entry:
		let requestId = helpers2.createRandomString(12);
		
		//	Create new object adding requestId && log date:
		let log = {
			requestId,
			eData,
			date: new Date().toDateString()
		};

		//	Append file:
		append('emailLog', JSON.stringify(log));


	} catch(e) {
		console.error(e);
		return e;
	};
};






//	Export Module:
module.exports = logging;
