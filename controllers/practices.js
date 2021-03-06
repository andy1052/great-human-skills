/*
*
*
*	Practice using file system to manipulate image and file data
*
*
*/

//	Dependencies:
const fsAsync = require('../lib/fsAsync');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const dbFuncs = require('../database/dbFuncs');
const config = require('../config/config');




//	Determine file location based on environment variable:
let port = config.port;
let location;
let existing;

if (port === 5947) {
	location = '/home/ghs/app/great-human-skills/public/tempImages';
	existing = '/home/ghs/app/great-human-skills/public/artImages';
} else {
	location = '/home/andy/Desktop/great-human-skills/public/tempImages';
	existing = '/home/andy/Desktop/great-human-skills/puclic/artImages';
};




//	Export the endpoints, passing in app from express:
exports = module.exports = function(app,) {


//	************* IMG UPLOAD ***********************************************

//	Multer Function:
let storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, location);
	},
	filename: function(req, file, cb) {
		//	Create a random 31 character string: 
		crypto.randomBytes(31, (err, buf) => {
			cb(null, buf.toString("hex") + path.extname(file.originalname));
		});
		//cb(null, file.fieldname + '-' + Date.now() + '.jpg')
	}
});


//	Multer Function:
let upload = multer({storage: storage,
	onFileUploadStart: function(file) {
		console.log(file.originalname + ' is starting ...');
	}
});


//	Post Route for /imgPractice:
app.post('/imgPractice', upload.single('img'), async (req, res, next) => {

		//	Sanitize Data:
let filename = typeof(req.file.filename) === 'string' && req.file.filename.trim().length > 0 && req.file.filename.trim().length < 80 ? req.file.filename.trim() : false;
let admin = typeof(req.body.admin) === 'string' && req.body.admin.trim().length > 0 && req.body.admin.trim().length < 350 ? req.body.admin.trim() : false;
let articleMetaId = typeof(req.body.articleMetaId) === 'string' && req.body.articleMetaId.trim().length > 0 && req.body.articleMetaId.trim().length < 50 ? req.body.articleMetaId.trim() : false;

	//	Initiate ObjectId:
const ObjectId = require('mongodb').ObjectId;

		try {

			if (admin) {

//	********** File system manipulation code below ********************************************************

		//	Locate the file that was updated:
		let newLocation = location + '/' + filename;

		//	Analyze the file and perform various checks on the data:
		let read = await fsAsync.read(newLocation);

		//	If there was an error, throw it.
		if (!read) throw new Error({"Error": "Could not read uploaded file!"});

		// Check the file's size in megabytes, keep it under 2Mb maximum:
		const size = read.length / 1000000;

		//	If file size is above 2mb, throw error:
		if (size > 2.00000) throw new Error({"Error": "File size is too big!"});

		//	Otherwise, determine the file's type by checking its binary magic number (first 4 bytes):
		const magic = read.readUIntBE(0,4).toString(16);

		//	Check the results against a list held in helper function:
		let fileType = await helpers.checkFiletype(magic).then(function(resolved) {
			return resolved;
		}, function(rejected) {
			return rejected;
		});

		//	If there's an error, throw new error:
		if (!fileType) throw new Error({"Error": "Cannot find specified file type!"});

		//	Otherwise, the file has passed validations, so get the base directory you want to write it to:
		let baseDir = path.join(__dirname, "/../public");

		//	Open the directory, passing in newImage variable:
		let open = await fsAsync.open(baseDir + '/artImages' + '/' + filename, 'wx');
					
		//	If err, throw it:
		if (!open) throw new Error({"Error": "Could not get file descriptor!"});

		//	Otherwise, write the file to artImages directory:
		let write = await fsAsync.write(open , read);

		//	If err, throw error:
		if (!write) throw new Error({"Error": "Could not write to file!"});

		//	Close the file:
		let close = await fsAsync.close(open);

		//	If error, throw error:
		if (!close) throw new Error({"Error": "Could not close file descriptor!"});

		//	And then delete the uploaded file from the tempImages directory:
		let unlink = await fsAsync.unlink(newLocation);

		//	If err, throw error:
		if (!unlink) throw new Error({"Error": "Could not delete file from tempImages!"});

//	********************* End of file system manipulation code *********************************************


		//	Update articlesMeta with the image path so it can be recalled on init:
		const up = await dbFuncs.update({_id: ObjectId(articleMetaId)}, {"imagePath": filename}, 'articlesMeta');

		//	Throw error if update throws error:
		if (!up) throw new Error({"Error": "Path did not save to database"});

		//	Now that you have the meta data and an image, move on to the article content/ quill editor:
		//	Pass in articleMetaId
			res.render('quill', {"articleMetaId":  articleMetaId, admin} );

		} else {
			res.render('artImage', {"imageSize": "Sorry, Images must be below 2mb in size."});
		}

		} catch(e) {
			console.log(e.stack);
			next(e);
		};
	});





//	Route to save artImageEditSave sent from "editArticleImage.handlebars":
app.post("/artImageEditSave", upload.single('newImg'), async (req, res, next) => {

	//	Sanitize the data:
	let filename = typeof(req.file.filename) === 'string' && req.file.filename.trim().length > 0 && req.file.filename.trim().length < 80 ? req.file.filename.trim() : false;
	let articleId = typeof(req.body.articleId) === 'string' && req.body.articleId.trim().length > 0 && req.body.articleId.trim().length < 120 ? req.body.articleId.trim() : false;
	let currentUser = typeof(req.user) === 'object' ? req.user : false;

	//	Initiate ObjectId:
	const ObjectId = require('mongodb').ObjectId;

	try {
		if (currentUser) {

			//	check to make sure the data is in:
			if (!filename) throw new Error("No profile pic was uploaded");

			//	Otherwise, make sure the file is new and not the one that already exists in the database:
			let check = await dbFuncs.find({_id: ObjectId(articleId)}, 'articlesMeta');

			//	If there is no check, throw error:
			if (!check) throw new Error({"Error": "Cannot login, non-existent email."});

			//	If the image is the same, throw error:
			if (filename === check.imagePath) throw new Error("Image is already assigned to this account");

//	********** File system manipulation code below ********************************************************

			//	Locate the file that was updated:
			let newLocation = location + '/' + filename;

			//	locate existing file in /artImages:
			let newExisting = existing + '/' + check.image;

			//	Analyze the file and perform various checks on the data:
			
			//	Read uploaded file, an image in this case:
			let read = await fsAsync.read(newLocation);

			//	If there was an error, throw it.
			if (!read) throw new Error({"Error": "Could not read uploaded file!"});

			// Check the file's size in megabytes, keep it under 2Mb maximum:
			const size = read.length / 1000000;

			//	If file size is above 2mb, throw error:
			if (size > 2.00000) throw new Error({"Error": "File size is too big!"});

			//	Otherwise, determine the file's type by checking its binary magic number (first 4 bytes):
			const magic = read.readUIntBE(0,4).toString(16);

			//	Check the results against a list held in helper function:
			let fileType = await helpers.checkFiletype(magic).then(function(resolved) {
				return resolved;
			}, function(rejected) {
				return rejected;
			});

			//	If there's an error, throw new error:
			if (!fileType) throw new Error({"Error": "Cannot find specified file type!"});

			//	Otherwise, the file has passed validations, so get the base directory you want to write it to:
			let baseDir = path.join(__dirname, "/../public");

			//	Open the directory, passing in newImage variableL
			let open = await fsAsync.open(baseDir + '/artImages' + '/' + filename, 'wx');

			//	If err, throw it:
			if (!open) throw new Error({"Error": "Could not get file descriptor!"});

			//	Otherwise, write the file to artImages directory:
			let write = await fsAsync.write(open, read);

			//	If err, throw error:
			if (!write) throw new Error({"Error": "Could not write to file!"});

			//	Close the file:
			let close = await fsAsync.close(open);

			if (!open) throw new Error({"Error": "Could not close file descriptor!"});

			//	And then delete the uploaded file from the tempImages directory:
			let unlink = await fsAsync.unlink(newLocation);

			//	If err, throw Error:
			if (!unlink) throw new Error({"Error": "Could not delete file from tempImages!"});


//***********************	End of file system manipulation code *********************************************

			//	Update articlesMeta with the image path so it can be recalled on init:
			const up = await dbFuncs.update({_id: ObjectId(articleId)}, {"imagePath": filename}, 'articlesMeta');

			//	Throw error if update throws error:
			if (!up) throw new Error({"Error": "Path did not save to database"});

			//	Now log admin out of the system:
			//	make sure req.user object is also cleared to prevevent any sort of sorcery:
			admin = null;
			currentUser = null;

			// At this point, re-render editArticleMeta page with confirmation of operation:
			res.clearCookie('nToken').render('confirmMetaEdit');

		} else {
			res.redirect('/unauthorized');
		};
	} catch(e) {
		console.log(e.message);
		next(e);
	};
});



};	//	End of module exports.
