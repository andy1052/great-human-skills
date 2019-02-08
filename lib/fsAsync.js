/*
*
*
*	Logic to "promisify" the fs module so it can be used with ES7 async/await
*
*
*/


//	Dependencies:
const fs = require('fs');


//	Container:
const fileSystem = {};


//	Read Function:
fileSystem.read = function(fileName) {
	return new Promise((resolve, reject) => {
		fs.readFile(fileName, (err, data) => {
			if (err) reject(err);
			else resolve(data);
		});
	});
};


//	Open Function:
fileSystem.open = function(fileName, flags) {
	return new Promise((resolve, reject) => {
		fs.open(fileName, flags, (err, result) => {
			if (err) reject(err);
			else resolve(result);
		});
	});
};


//	Close Function: ** Always Close A File Descriptor!!!
fileSystem.close = function(fileDescriptor) {
	return new Promise((resolve, reject) => {
		fs.close(fileDescriptor, (err) => {
			if (err) reject(err);
			else resolve(`${fileDescriptor} was properly closed.`);
		});
	});
};


//	Write Function:
fileSystem.write = function(fileDescriptor, data) {
	return new Promise((resolve, reject) => {
		fs.writeFile(fileDescriptor, data, (err) => {
			if (err) reject(err);
			else resolve("write was successful!");
		});
	});
};


//	Unlink Function:
fileSystem.unlink = function(fileName) {
	return new Promise((resolve, reject) => {
		fs.unlink(fileName, (err) => {
			if (err) reject(err);
			else resolve("File was deleted from tempImages!");
		});
	});
};


//	Custom Copyfile Function:
fileSystem.copyFile = function(src, dest) {
	return new Promise((resolve, reject) => {
		let readStream = fs.createReadStream(src);

		readStream.once('error', (err) => {
			console.error(err);
			reject(err);
		});

		readStream.once('end', () => {
			console.log("Done copying!");
			resolve("File has been written to Profiles!");
		});

		readStream.pipe(fs.createWriteStream(dest));
	});
};



//	Export module:
module.exports = fileSystem;