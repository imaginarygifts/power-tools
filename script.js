let files=[]
let processed=[]

const fileInput=document.getElementById("fileInput")
const resizeBtn=document.getElementById("resizeBtn")
const zipBtn=document.getElementById("zipBtn")

fileInput.addEventListener("change",function(e){
files=[...e.target.files]
preview()
})

function preview(){

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

resizeBtn.addEventListener("click",resizeImages)

function resizeImages(){

processed=[]

let maxSize=parseInt(document.getElementById("resolution").value)
let format=document.getElementById("format").value
let prefix=document.getElementById("prefix").value||"img"

let gallery=document.getElementById("gallery")
gallery.innerHTML=""

files.forEach((file,i)=>{

let reader=new FileReader()

reader.onload=function(e){

let img=new Image()

img.onload=function(){

let scale=Math.min(maxSize/img.width,maxSize/img.height)

if(scale>1) scale=1

let w=Math.round(img.width*scale)
let h=Math.round(img.height*scale)

let canvas=document.createElement("canvas")
canvas.width=w
canvas.height=h

let ctx=canvas.getContext("2d")
ctx.drawImage(img,0,0,w,h)

canvas.toBlob(function(blob){

let name=prefix+"_"+String(i+1).padStart(3,"0")+"."+format

processed.push({name,blob})

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

},`image/${format}`,0.6)

}

img.src=e.target.result

}

reader.readAsDataURL(file)

})

}

zipBtn.addEventListener("click",downloadZip)

async function downloadZip(){

if(processed.length===0){
alert("Please resize images first")
return
}

let prefix=document.getElementById("prefix").value||"images"

let zip=new JSZip()

processed.forEach(p=>{
zip.file(p.name,p.blob)
})

let content=await zip.generateAsync({type:"blob"})

saveAs(content,prefix+".zip")

}