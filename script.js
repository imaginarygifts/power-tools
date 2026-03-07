let files=[];

document.getElementById("upload").addEventListener("change",(e)=>{
files=[...e.target.files];
});

function processImages(){

let maxSize=parseInt(document.getElementById("resolution").value);
let prefix=document.getElementById("prefix").value || "image_";

let preview=document.getElementById("preview");
preview.innerHTML="";

files.forEach((file,i)=>{

let img=new Image();
let reader=new FileReader();

reader.onload=function(e){
img.src=e.target.result;

img.onload=function(){

let width=img.width;
let height=img.height;

let scale=Math.min(maxSize/width,maxSize/height);

if(scale>1) scale=1;

let newWidth=Math.round(width*scale);
let newHeight=Math.round(height*scale);

let canvas=document.createElement("canvas");
canvas.width=newWidth;
canvas.height=newHeight;

let ctx=canvas.getContext("2d");
ctx.drawImage(img,0,0,newWidth,newHeight);

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