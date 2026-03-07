let files=[]
let processed=[]

const drop=document.getElementById("drop")

drop.addEventListener("dragover",e=>e.preventDefault())

drop.addEventListener("drop",e=>{
e.preventDefault()
files=[...e.dataTransfer.files]
preview()
})

document.getElementById("fileInput").addEventListener("change",e=>{
files=[...e.target.files]
preview()
})

function preview(){

let g=document.getElementById("gallery")
g.innerHTML=""

files.forEach(f=>{
let img=document.createElement("img")
img.src=URL.createObjectURL(f)
g.appendChild(img)
})

}

async function processImages(){

processed=[]

let maxSize=parseInt(document.getElementById("resolution").value)
let quality=parseFloat(document.getElementById("quality").value)
let format=document.getElementById("format").value
let prefix=document.getElementById("prefix").value||"img_"

for(let i=0;i<files.length;i++){

let file=files[i]

let img=await createImageBitmap(file)

let scale=Math.min(maxSize/img.width,maxSize/img.height)

if(scale>1) scale=1

let w=Math.round(img.width*scale)
let h=Math.round(img.height*scale)

let canvas=document.createElement("canvas")
canvas.width=w
canvas.height=h

let ctx=canvas.getContext("2d")
ctx.drawImage(img,0,0,w,h)

let blob=await new Promise(resolve=>{
canvas.toBlob(resolve,`image/${format}`,quality)
})

let name=prefix+String(i+1).padStart(3,"0")+"."+format

processed.push({name,blob})

}

alert("Processing finished")

}

async function downloadZip(){

let zip=new JSZip()

processed.forEach(p=>{
zip.file(p.name,p.blob)
})

let content=await zip.generateAsync({type:"blob"})

saveAs(content,"images.zip")

}

function toggleDark(){
document.body.classList.toggle("dark")
}