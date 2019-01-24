/*
*
*
*
*	Tests for fsAsync module:
*
*/


//	Dependencies:
const fsAsync = require('../lib/fsAsync');

//	Container:
const a = {};




a.readIt = async (file) => {

let read = await fsAsync.read(file);
 return read;
};




module.exports = a;