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
  theme: 'snow'
});

//	Grab form element:
let form = document.querySelector('#quill-form');

//	Add event listener:
form.onsubmit = function(e) {

	e.preventDefault();

  // Populate hidden form on submit
  let about = document.querySelector('input[name=about]');

 //	Get content of form using quill's getContent() function:
  about.value = JSON.stringify(quill.getContents());

  let data = about.value;

console.log("about.value (data): ", data);

  //	console.log("Submitted", $(form).serialize(), $(form).serializeArray());


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
  	body: data	//JSON.stringify(data)
  }).then((res) => {
  	if (res.ok) {
  	return res.json();
  } else {
  	console.log("Error");
  }
  }).then((json) => {
  	console.log("Response from server: ", json);

  	let elem = document.getElementById("blog-post-show").innerHTML = json;


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

