//	Logic for file uploads front end:

console.log("Hello from uploads!");

if (document.querySelector("#up")) {

	// let selectedFile = document.querySelector("#up").files;
	// console.log(selectedFile);

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
}
 else {
	console.log("Nothing to display from uploads");
}