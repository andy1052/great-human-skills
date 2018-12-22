/*
*
*
*
*	Environement configuration for app
*
*/


//	Container:
const env = {};

//	Create the development (default) environment:
env.development = {
	"port": 3000,
	"envName": "development"
};


//	Create the production environment:
env.production = {
	"port": 5947,
	"envName": "production"
};


//	Create a testing environment:
env.testing = {
	"port": 4000,
	"envName": "testing"
};

//	Determine which environment is passed as a command-line argument:
let currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : {};


//	Check that the actual environment is one of the objects defined above:
//	If not, default to 'development':
let environmentToExport = typeof(env[currentEnvironment]) === 'object' ? env[currentEnvironment] : env.development;




//	Export the module:
module.exports = environmentToExport;