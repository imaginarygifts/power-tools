let files=[];

document.getElementById("upload").addEventListener("change",(e)=>{
files=[...e.target.files];
});

async function processImages(){

let width=document.getElementById("width").value;
let height=document.getElementById("height").value;
let prefix=document.getElementById("prefix").value;

let preview=document.getElementById("preview");
preview.innerHTML="";

files.forEach((file,i)=>{

let img=new Image();
let reader=new FileReader();

reader.onload=function(e){
img.src=e.target.result;

img.onload=function(){

let canvas=document.createElement("canvas");
canvas.width=width || img.width;
canvas.height=height || img.height;

let ctx=canvas.getContext("2d");
ctx.drawImage(img,0,0,canvas.width,canvas.height);

canvas.toBlob(function(blob){

let url=URL.createObjectURL(blob);

let a=document.createElement("a");
a.href=url;
a.download=`${prefix}${i+1}.jpg`;
a.innerText=`Download ${prefix}${i+1}.jpg`;

let image=document.createElement("img");
image.src=url;

preview.appendChild(image);
preview.appendChild(a);
preview.appendChild(document.createElement("br"));

});

};

};

reader.readAsDataURL(file);

});

}
