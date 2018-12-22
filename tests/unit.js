/*
*
*
*
*	Unit Testing logic
*
*
*/


//	Dependencies:
const assert = require('assert');
const helpers2 = require('../lib/helpers2');



//	Container:
const unit = {};



//	Assert the the getNumber function returns 13 (from helpers2.js):
unit['helper2.getNumber should return number 13'] = function(done) {
	let val = helpers2.getNumber();
	assert.strictEqual(val, 13);
	done();
};


//	Export module to test runner (test/index.js):
module.exports = unit;