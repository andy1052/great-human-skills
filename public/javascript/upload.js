//	Logic for file uploads front end:

console.log("Hello from uploads!");

if (document.querySelector("#up")) {

	//	Logic to display article image:

let preview = document.querySelector('#preview');


function handleFiles(files) {
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    
    if (!file.type.startsWith('image/')){ continue }
    
    var img = document.createElement("img");
    img.classList.add("obj");
    img.file = file;
    img.id = "incoming";
    preview.appendChild(img); // Assuming that "preview" is the div output where the content will be displayed.
    
    var reader = new FileReader();
    reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);
    reader.readAsDataURL(file);
  }
};

} else if (document.querySelector("#prof")) {

	//	Logic to display profile pic on sign-up page:

	let profile = document.querySelector("#profile");

	function showPic(files) {

	for (var i = 0; i < files.length; i++) {
    var file = files[i];
    
    if (!file.type.startsWith('image/')){ continue }
    
    var img = document.createElement("img");
  //  img.classList.add("obj");
  	profile.style.display = "block";
    img.file = file;
    img.id = "pic";
    profile.appendChild(img); // Assuming that "preview" is the div output where the content will be displayed.
    
    var reader = new FileReader();
    reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);
    reader.readAsDataURL(file);
  }
};


} else {
	console.log("Nothing to display from uploads");
}