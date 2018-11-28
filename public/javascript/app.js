/*
*
*
*	Front end logic for app
*
*
*/


//	Check that it loads:
console.log("I'm here!");



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

