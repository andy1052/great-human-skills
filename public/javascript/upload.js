//	Logic for file uploads front end:

// console.log("Hello from uploads!");

if (document.querySelector("#up")) {

	//	Logic to display article image:

let preview = document.querySelector('#preview');


function handleFiles(files) {
  for (let i = 0; i < files.length; i++) {
    let file = files[i];
    
    if (!file.type.startsWith('image/')){ continue }
    
    let img = document.createElement("img");
    img.classList.add("obj");
    img.file = file;
    img.id = "incoming";
    preview.appendChild(img); // Assuming that "preview" is the div output where the content will be displayed.
    
    let reader = new FileReader();
    reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);
    reader.readAsDataURL(file);
  }
};

} else if (document.querySelector("#prof")) {

	//	Logic to display profile pic on sign-up page:

	let profile = document.querySelector("#profile");

	function showPic(files) {

	for (let i = 0; i < files.length; i++) {
    let file = files[i];
    
    if (!file.type.startsWith('image/')){ continue }
    
    let img = document.createElement("img");
  //  img.classList.add("obj");
  	profile.style.display = "block";
    img.file = file;
    img.id = "pic";
    profile.appendChild(img); // Assuming that "preview" is the div output where the content will be displayed.
    
    let reader = new FileReader();
    reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);
    reader.readAsDataURL(file);
  }
};


} else if (document.querySelector("#newUp")) {

  //  Logic to display profile pic on editAccount page:

  let newProfile = document.querySelector("#newProfile");

  function showChangedPic(files) {

    for (let i = 0; i < files.length; i++) {
      let file = files[i];
    
    if (!file.type.startsWith('image/')){ continue }
    
    let img = document.createElement("img");
  //  img.classList.add("obj");
    newProfile.style.display = "block";
    img.file = file;
    img.id = "pic";
    newProfile.appendChild(img); // Assuming that "newProfile" is the div output where the content will be displayed.
    
    let reader = new FileReader();
    reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);
    reader.readAsDataURL(file);
  }
};





} else if (document.querySelector("#newUpload")) {

  //  Logic to display new Article pic on editArticleImage.handlebars:

  let editArticleImg = document.querySelector("#newArticleImage");

  function newUploadImage(files) {

    for (let i = 0; i < files.length; i++) {
    let file = files[i];

    if (!file.type.startsWith('image/')){ continue }
    
    let img = document.createElement("img");
    editArticleImg.style.display = "block";
    img.classList.add("d-flex");
    img.classList.add("rounded");
    img.file = file;
    img.id = "pic";
    editArticleImg.appendChild(img); // Assuming that "newProfile" is the div output where the content will be displayed.
    
    let reader = new FileReader();
    reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);
    reader.readAsDataURL(file);
  };
  };


} else {
	console.log("Nothing to display from uploads");
};