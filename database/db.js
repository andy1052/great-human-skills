/*
*
*
*	Database configuration
*	This pattern is called a singleton and it allows for a mongodb connection
*	to be re-used between operations. It's important to do this so as not to 
*	throttle the app with making new, expensive connections to the database.
*
*/

//	Dependencies:
const MongoClient = require('mongodb').MongoClient;


//	Connection function:
let DbConnection = function() {

	let db = null;
	let instance = 0;

	async function DbConnect() {
		try {
			let url = 'mongodb://localhost:27017/great-human-skills';

			let _db = await MongoClient.connect(url, {useNewUrlParser: true}, (err, client) => {

				if (err) return console.error("***************************Error from mongo connect: ", err);

				db = client.db('Blog-Posts');
			});
			return _db;
		} catch (e) {
			console.log(e.stack);
			return e;
		}
	}


//	Function for determining if a connection is already open and using it
//	or creating a new one if not:
	async function Get() {

		try {
			instance++;
			console.log(`DbConnection called ${instance} times`);

			if (db !== null) {
				console.log('DB Connection is already alive');
				return db;
			} else {
				console.log('Getting a new db connection');
				db = await DbConnect();				
				return db;
			}
		} catch (e) {
			console.log(e.stack);
			return e;
		}
	}
	return {
		Get: Get
	}
};



//	Export module:
module.exports = DbConnection();