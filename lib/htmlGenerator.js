/*
*
*
*
*	This is a homemade Delta object to HTML generator for use with Quill Editor currently
*
*/

//	Dependencies:
//const dbFuncs = require('../database/dbFuncs');


//	container:
const generator = {};


//	Html generator function:
generator.convert = async function(delta) {

	//console.log("data from generator: ", delta.data.ops);

	//const retrieveTest = await dbFuncs.find(req.body, "quillTest");

		// 	console.log("retrieveTest: ", retrieveTest.ops);
		// //	console.log("retrieveTest Length: ". retrieveTest.length);
		// 	console.log("retrieveTest ops length: ", retrieveTest.ops.length);
		// 	console.log("retrieveTest.ops.insert; ", retrieveTest.ops[0].insert);
		// 	console.log("retrieveTest.ops.attributes: ", retrieveTest.ops[0]);

let result = "";

			const each = delta.data.ops.forEach((e, i) => {
				// console.log("e: ", e); //	Object
				// console.log("I: ", i);	//	Index number
				// console.log("E equals: ", typeof(e)); //	object
				// console.log("e.attributes: ", e.attributes);
				// console.log("e.insert: ", e.insert);
			//	console.log("\n \n \n");


				if (e.attributes) {



				if (e.attributes.hasOwnProperty('bold')) {
					console.log("Attribute equals bold \n");	

					result += "<strong>" + e.insert + "</strong>" + " ";

				} else if (e.attributes.hasOwnProperty('italic')) {
					console.log("Attribute equals italic \n");

					result += "<em>" + e.insert + "</em>" + " ";

				} else if (e.attributes.hasOwnProperty('italic' && 'bold')) {
					console.log("Attribute has both bold and italic \n");

					result += "<strong>" + "<em>" + e.insert + "</em>" + "</strong>" + " ";
				};


				// Main if ends here:
				} else {
						console.log("Just a regular string \n");

					// console.log("e.insert in else clause: ", e.insert === '\n');
					// if (e.insert === '\n' || e.insert.includes('\n')) {
					// 	result += "<br>";
					// } else {
						console.log("Found new line: ", e.insert.indexOf('\n'));

						if (e.insert.indexOf('\n') >= 0 && e.insert.indexOf('\n') <= 5) {

							result += "<br/>" + e.insert;

						} else if (e.insert.indexOf('\n') === e.insert.length -1) {

							console.log("Does this happen?");

							result += e.insert + "<br/>";

						// } else if (instanceof(e.insert.indexOf('\n') >= 2)) {
							
						// 	console.log("Two new lines");
						// 	result += "<br/>" + e.insert + "<br/>";

							}else {

					result += e.insert + " ";
				}
						
					}
				});

			//	Make the html template string and concat result string:
			const derek = '<div class="container">' + '<div class="row">' + '<p>' + result + '</p>' + '</div>' + '</div>';
//console.log("derek: ", derek);
			//	Send template string back to front end:
			return derek;



};

















//	Export module:
module.exports = generator;