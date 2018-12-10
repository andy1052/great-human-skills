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

	let result = "";

			const each = delta.data.ops.forEach((e, i) => {

				if (e.attributes) {

				//	Check if attribute equals bold:
				if (e.attributes.hasOwnProperty('bold')) {
					console.log("Attribute equals bold \n");	

					result += "<strong>" + e.insert + "</strong>" + " ";

				//	Check if attribute equals italic:
				} else if (e.attributes.hasOwnProperty('italic')) {
					console.log("Attribute equals italic \n");

					result += "<em>" + e.insert + "</em>" + " ";

				//	Check if attribute equal italic and bold:
				} else if (e.attributes.hasOwnProperty('italic' && 'bold')) {
					console.log("Attribute has both bold and italic \n");

					result += "<strong>" + "<em>" + e.insert + "</em>" + "</strong>" + " ";

				} else {
					console.log("no attributes");
				};

				} else {

				//	Otherwise, it has no attribute, so just pass the string to result:
					result += e.insert + " ";
				}
			});

			//	Now find the tab regular expression and replace it with 4 non-breaking spaces:
			let d = result.replace(/\t/g, '&nbsp; &nbsp; &nbsp; &nbsp;');

			//	Now take d variable and replace all the newline regular expressions and replace them with breaks:
			let n = d.replace(/\n/g, '<br/>');


			//	Make the html template string and concat result string:
			const derek = '<div class="container">' + '<div class="row">' + '<p>' + n + '</p>' + '</div>' + '</div>';

			//	Send template string back to front end:
			return derek;
		};

















//	Export module:
module.exports = generator;