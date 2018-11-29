/*
*
*
*	Front end logic for app
*
*
*/


//	Check that it loads:
console.log("I'm here!");


//  ***************** DELTA FROM DB TO FRONT END *****************************
const butt = document.querySelector("#test-button");

butt.addEventListener("click", async function(e) {
  e.preventDefault();

let form = document.querySelector("#testForm");

let formVal = form.value;


  const response = await fetch('/artSearch', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
   // body: JSON.stringify({a: 1, b: 'Textual content'})
   body: JSON.stringify({data: formVal})
  });
  const content = await response.json();

  console.log("Response from artSearch: ", content);

var quill = new Quill('#editor', {
  modules: {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      ['image', 'code-block']
    ]
  },
  placeholder: 'Compose an epic...',
  theme: 'snow' // or 'bubble'
});

// quill.setContents({
//     "ops":[
//         {"insert":"this is a test bit of text\n"}
//     ]
// });

quill.setContents(content.article.ops);



//**************************** Here we have a function within a function **************************
let editButton = document.querySelector("#edit-button");

console.log("Editbutton: ", editButton);

editButton.addEventListener("click", async function(e) {

     e.preventDefault();

     console.log("I was fucking clicked!");

   // Populate hidden form on submit
   let editForm = document.querySelector('input[name=edit]');

  // Get content of form using quill's getContent() function:
   edit.value = JSON.stringify(quill.getContents());

   console.log("Edit Value: ", edit.value);

   let x = JSON.parse(edit.value);


   // Make object:
   let obj = {
    edits: x,
    meta: content.meta
   }

   let o = JSON.stringify(obj);


   // Make a fetch call to save edits to db:
    const saveEdit = await fetch('/saveArtEdit', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
   // body: JSON.stringify({a: 1, b: 'Textual content'})
   body: o
  });
  const saveArtEdit = await saveEdit.json();

console.log('SaveArtEdit response: ', saveArtEdit);


}, false);

//  *************************** END OF FUNCTION WITHIN FUNCTION *****************************************

}, false);








//	Logic for Quill editor:



/* Initialize Quill editor */
let quill = new Quill('#editor-container', {
  modules: {
    toolbar: [
      ['bold', 'italic'],
      ['link', 'blockquote', 'code-block', 'image'],
      [{ list: 'ordered' }, { list: 'bullet' }]
    ]
  },
  placeholder: 'Compose an epic...',
  theme: 'snow',
});



//  ****************** THIS IS TO UPDATE DELTA OBJECT AND SAVE TO DB /getEdit ************************



// let editButton = document.querySelector("#edit-button");

// console.log("Editbutton: ", editButton);

//  Add event listener:
// editButton.addEventListener("click", function(e) {

//   e.preventDefault();

//   //  Grab form element:
// let editForm = document.querySelector('#edit-form');

//   // Populate hidden form on submit
//   let editForm = document.querySelector('input[name=edit]');

//  // Get content of form using quill's getContent() function:
//    edit.value = JSON.stringify(quill.getContents());

//    console.log("Edit Value: ", edit.value);


// }, false);











// *******************************************************************
//	Keyboard Stuff:

// const Keyboard = Quill.import('modules/keyboard');

// let keyB = quill.keyboard.addBinding({key: Keyboard.keys.ENTER}, function(range, context) {
// 	console.log('Enter Key!');
// });

//	********************************************************************

//	Grab form element:
let form = document.querySelector('#quill-form');

//	Add event listener:
form.onsubmit = function(e) {

	e.preventDefault();

  // Populate hidden form on submit
  let about = document.querySelector('input[name=about]');

 //	Get content of form using quill's getContent() function:
	 about.value = JSON.stringify(quill.getContents());

//	Because about.value is now stringified, the array is also now a string, so parse back into an object:
  let t = JSON.parse(about.value);

	 // console.log("t: ", t);
	 // console.log("t.ops: ", t.ops[0]);

  //	Get articleId from quill:
  let articleId = document.getElementById("articleId").value;

  // console.log("articleId: ", articleId);


//	****************************************************************************************************
/*	Build an object and then stringify it. It's the only way to send more than 1 value at a time
using Fetch api */
//	Note: t.ops[0] gets into the array for the values you want!
//	****************************************************************************************************

  let b = {
  	"data": t,
  	"articleId": articleId
  };

  let a = JSON.stringify(b);

//	*****************************************************************************************************

  //*************** Fetch Post To Server Here *********************

  const rawResponse = fetch('http://localhost:3000/quillForm', {
  	method: "POST",
  	// mode: "cors",
  	// cache: "no-cache",
  	  headers: {
  		 "Content-Type": "application/json"
  	 },
  	//redirect: "/quillHtml",
  	// Referrer: "no-referrer",
  	body: a	//JSON.stringify(data)
  }).then((res) => {

  	console.log("res from app.js: ", res);
  // 	if (res.ok) {
  // 	return res.json();
  // } else {
  // 	console.log("Error");
  // }
  // }).then((json) => {
  // 	console.log("Response from server: ", json);

  //	let elem = document.getElementById("blog-post-show").innerHTML = json;


  }).catch((e) => {
  	console.log(e.stack);
  });

  // const content = rawResponse.json();

  // console.log("content: ", content);

  // No back end to actually submit to!
  //alert('Open the console to see the submit data!')

  //return false;
};
// End of Quill editor logic






