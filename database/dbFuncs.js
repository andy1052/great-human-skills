/*
*
*
*
*	MongoDB Operations
*
*
*/

//	Dependencies:
const DbConnection = require('./db');


//	Container:
const dbFunc = {};

//	Find operation:
dbFunc.find = async function(data, collection) {
	try {
		let db = await DbConnection.Get();
		let result = await db.collection(collection).findOne(data);
		return result;
	} catch (e) {
		console.log(e.stack);
		return e;
	}
};


//	Insert operation:
dbFunc.insert = async function(data, collection) {
	try {
		let db = await DbConnection.Get();
		let result = await db.collection(collection).insertOne(data);
		return result;
	} catch (e) {
		console.log(e.stack);
		return e;
	}
};


//	Export Module
module.exports = dbFunc;