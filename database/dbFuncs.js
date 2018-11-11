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
const assert = require('assert');


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
		//assert.strictEqual(1, r.insertedCount);
		return result;
	} catch (e) {
		console.log(e.stack);
		return e;
	}
};


//	Update operation:
dbFunc.update = async function(data, update, collection) {

	console.log("data: ", data);
	console.log("update: ", update);

	try {
		let db = await DbConnection.Get();
		let result = await db.collection(collection).updateOne(data, {$set: update});
		// assert.strictEqual(1, matchedCount);
		// assert.strictEqual(1, modifiedCount);
		return result;
	} catch(e) {
		console.log(e.stack);
		return e;
	}
};


// //	General Update Function:
// dbFuncs.update = async function(data, update, collection) {
// console.log("NewInfo:", update);

// 	try {
// 		let db = await DbConnection.Get();
// 		let result = await db.collection(collection).updateOne(data, {$set:
// 			{"first_name": update.first_name,
// 			 "last_name": update.last_name,
// 			 "password": update.password}}, 
// 			{upsert: false});

// 		return result;
// 	} catch(e) {
// 		return e;
// 	}
// };




//	Delete operation:
dbFunc.delete = async function(data, collection) {
	try{
		let db = await DbConnection.Get();
		let result = await db.collection(collection).deleteOne(data);
		// assert.strictEqual(1, r.deletedCount);
		return result;
	} catch(e) {
		console.log(e.stack);
		return e;
	}
};


//	Export Module
module.exports = dbFunc;