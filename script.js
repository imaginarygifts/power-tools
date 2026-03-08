let files=[]
let processed=[]

const imageInput=document.getElementById("imageInput")
const folderInput=document.getElementById("folderInput")
const zipBtn=document.getElementById("zipBtn")

imageInput.addEventListener("change",handleFiles)
folderInput.addEventListener("change",handleFiles)

function handleFiles(e){

let uploadBox=document.getElementById("uploadBox")
uploadBox.style.display="flex"

setTimeout(()=>{

let selected=[...e.target.files]

files=selected.filter(file=>file.type.startsWith("image/"))

let skipped=selected.length-files.length

if(skipped>0){
alert(skipped+" non-image files skipped")
}

showPreview()

uploadBox.style.display="none"

},300)

}

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

async function resizeImages(){

if(files.length===0){
alert("Please select images or folder")
return
}

processed=[]
zipBtn.style.display="none"

let maxSize=parseInt(document.getElementById("resolution").value)
let format=document.getElementById("format").value
let prefix=document.getElementById("prefix").value||"images"

let gallery=document.getElementById("gallery")
gallery.innerHTML=""

let progressBox=document.getElementById("progressBox")
let progressText=document.getElementById("progressText")
let progressFill=document.getElementById("progressFill")

progressBox.style.display="flex"

for(let i=0;i<files.length;i++){

progressText.innerText="Processing "+(i+1)+" / "+files.length

let percent=((i+1)/files.length)*100
progressFill.style.width=percent+"%"

let file=files[i]

let dataURL=await readFile(file)

let img=await loadImage(dataURL)

let scale=Math.min(maxSize/img.width,maxSize/img.height)

if(scale>1) scale=1

let newWidth=Math.round(img.width*scale)
let newHeight=Math.round(img.height*scale)

let canvas=document.createElement("canvas")
canvas.width=newWidth
canvas.height=newHeight

let ctx=canvas.getContext("2d")
ctx.drawImage(img,0,0,newWidth,newHeight)

let blob=await canvasToBlob(canvas,format)

let name=prefix+"_"+String(i+1).padStart(3,"0")+"."+format

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

}

progressBox.style.display="none"

zipBtn.style.display="block"

alert("All images processed")

}

function readFile(file){

return new Promise(resolve=>{
let reader=new FileReader()
reader.onload=e=>resolve(e.target.result)
reader.readAsDataURL(file)
})

}

function loadImage(src){

return new Promise(resolve=>{
let img=new Image()
img.onload=()=>resolve(img)
img.src=src
})

}

function canvasToBlob(canvas,format){

return new Promise(resolve=>{
canvas.toBlob(resolve,"image/"+format,0.6)
})

}

async function downloadZip(){

if(processed.length===0){
alert("Resize images first")
return
}

let prefix=document.getElementById("prefix").value||"images"

let zip=new JSZip()

processed.forEach(item=>{
zip.file(prefix+"/"+item.name,item.blob)
})

let content=await zip.generateAsync({type:"blob"})

saveAs(content,prefix+".zip")

}