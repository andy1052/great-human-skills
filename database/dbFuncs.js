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
	} catch(e) {
		console.log(e);
		return e;
	}
};


//	Find All Operation:
dbFunc.findAll = async function(data, collection) {

	try {
		let db = await DbConnection.Get();
		let result = await db.collection(collection).find(data).toArray();
		return result;
	} catch(e) {
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


//	FindOneAndUpdate operation:
dbFunc.findOneAndUpdate = async function(data, update, collection) {

	try {
		let db = await DbConnection.Get();
		let result = await db.collection(collection).findOneAndUpdate(data, {$set: update}, {upsert: false, returnNewDocument: true});
		return result;
	} catch(e) {
		console.error(e);
		return e;
	};
};


//	Update method to add to an array field:
dbFunc.arrayUpdate = async function(data, update, collection) {

	try {
		let db = await DbConnection.Get();
		let result = await db.collection(collection).updateOne(data, {$push: update});
		// assert.strictEqual(1, matchedCount);
		// assert.strictEqual(1, modifiedCount);
		return result;
	} catch(e) {
		console.log(e.stack);
		return e;
	}
};



//	Update method to unset certain fields from document:
dbFunc.unset = async function(data, update, collection) {

	try {
		let db = await DbConnection.Get();
		let result = await db.collection(collection).findOneAndUpdate(data, {$unset: update});
		return result;
	} catch(e) {
		console.error(e);
		return e;
	};
};


//	Update method to unset certain fields from document:
dbFunc.increment = async function(data, update, collection) {

	try {
		let db = await DbConnection.Get();
		let result = await db.collection(collection).findOneAndUpdate(data, {$inc: update});
		return result;
	} catch(e) {
		console.error(e);
		return e;
	};
};



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