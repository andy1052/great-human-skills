/*
*
*
*	This is the test runner
*
*/


//	Override the NODE_ENV variable:
process.env.NODE_ENV = 'testing';



//	Application logic for the test runner:
_app = {};


//	Container for the tests:
_app.tests = {};


//	Add on the unit tests:
_app.tests.unit = require('./unit');

//	Add on the api tests:
_app.tests.api = require('./api');



//	Count all tests:
_app.countTests = function() {
	let counter = 0;
	for (let key in _app.tests) {
		if (_app.tests.hasOwnProperty(key)) {
			let subTests = _app.tests[key];
			for (let testName in subTests) {
				if (subTests.hasOwnProperty(testName)) {
					counter++;
				}
			}
		}
	}
return counter;
};



//	Run all tests and record the errors and successes:
_app.runTests = function() {
	let errors = [];
	let successes = 0;
	let limit = _app.countTests();


	let counter = 0;

	//	Loop through _app.tests:
	for (let key in _app.tests) {
		if (_app.tests.hasOwnProperty(key)) {
			let subTests = _app.tests[key];
			for (let testName in subTests) {
				if (subTests.hasOwnProperty(testName)) {
					(function() {
						let tempTestName = testName;
						let testValue = subTests[testName];

						// Call the test:
						try {

							 testValue(function() {
								//	If it calls back without throwing, then it succeeded, so log it in green
								console.log('\x1b[32m%s\x1b[0m', tempTestName);
								counter++;
								successes++;
								if (counter === limit) {
									_app.produceTestReport(limit, successes, errors);
								};
							});

						} catch(e) {
							//	If the test throws, then it failed, so catch the error and log it in red:
							errors.push({
								"name": testName,
								"error": e
							});
							console.log('\x1b[31m%s\x1b[0m', tempTestName);
							counter++;
							if (counter === limit) {
								_app.produceTestReport(limit, successes, errors);
							};
						}
					})();
				}
			}
		}
	}


};




//	Produce a test report:
_app.produceTestReport = function(limit, successes, errors) {
	console.log('');
	console.log('--------------------- BEGIN TEST REPORT -------------------------------------------------');
	console.log('');
	console.log('Total tests: ', limit);
	console.log('Passed: ', successes);
	console.log('Number Of Errors: ', errors.length);
	console.log('');


	//	If there are any errors, print them in detail:
	if (errors.length > 0) {
		console.log('----------------- ERRORS REPORT -----------------------------------------');
		console.log('');

		errors.forEach((testError) => {
			console.log('\x1b[31m%s\x1b[0m', testError.name);
			console.log(testError.error);
		});

			console.log('');
			console.log('---------------- END OF ERRORS REPORT ---------------------------------');
	};


		console.log('');
		console.log('---------------------- END OF TEST REPORT -----------------------------------');
		process.exit(0);
};



//	Run the tests:
	 _app.runTests();
