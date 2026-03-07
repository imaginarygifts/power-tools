let files=[]
let processed=[]

document.getElementById("fileInput").addEventListener("change",function(e){
files=[...e.target.files]
showPreview()
})

function showPreview(){

let gallery=document.getElementById("gallery")
gallery.innerHTML=""

files.forEach(file=>{

let box=document.createElement("div")
box.className="imageBox"

let img=document.createElement("img")
img.src=URL.createObjectURL(file)

box.appendChild(img)
gallery.appendChild(box)

})

}

function resizeImages(){

if(files.length===0){
alert("Please select images")
return
}

processed=[]

let maxSize=parseInt(document.getElementById("resolution").value)
let format=document.getElementById("format").value
let prefix=document.getElementById("prefix").value || "img"

let gallery=document.getElementById("gallery")
gallery.innerHTML=""

files.forEach((file,index)=>{

let reader=new FileReader()

reader.onload=function(e){

let img=new Image()

img.onload=function(){

let scale=Math.min(maxSize/img.width,maxSize/img.height)

if(scale>1) scale=1

let newWidth=Math.round(img.width*scale)
let newHeight=Math.round(img.height*scale)

let canvas=document.createElement("canvas")
canvas.width=newWidth
canvas.height=newHeight

let ctx=canvas.getContext("2d")
ctx.drawImage(img,0,0,newWidth,newHeight)

canvas.toBlob(function(blob){

let name=prefix+"_"+String(index+1).padStart(3,"0")+"."+format

processed.push({
name:name,
blob:blob
})

let box=document.createElement("div")
box.className="imageBox"

let preview=document.createElement("img")
preview.src=URL.createObjectURL(blob)

let btn=document.createElement("button")
btn.className="downloadBtn"
btn.innerText="Download"

btn.onclick=function(){
saveAs(blob,name)
}

box.appendChild(preview)
box.appendChild(btn)

gallery.appendChild(box)

},"image/"+format,0.6)

}

img.src=e.target.result

}

reader.readAsDataURL(file)

})

}

async function downloadZip(){

if(processed.length===0){
alert("Resize images first")
return
}

let prefix=document.getElementById("prefix").value || "images"

let zip=new JSZip()

processed.forEach(item=>{
zip.file(item.name,item.blob)
})

let content=await zip.generateAsync({type:"blob"})

saveAs(content,prefix+".zip")

}