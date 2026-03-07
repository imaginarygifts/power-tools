let files=[]
let processed=[]

document.getElementById("fileInput").addEventListener("change",e=>{
files=[...e.target.files]
preview()
})

function preview(){

let g=document.getElementById("gallery")
g.innerHTML=""

files.forEach(f=>{
let box=document.createElement("div")
box.className="imageBox"

let img=document.createElement("img")
img.src=URL.createObjectURL(f)

box.appendChild(img)

g.appendChild(box)
})

}

async function processImages(){

processed=[]

let maxSize=parseInt(document.getElementById("resolution").value)
let format=document.getElementById("format").value
let prefix=document.getElementById("prefix").value||"img"

let gallery=document.getElementById("gallery")
gallery.innerHTML=""

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
canvas.toBlob(resolve,`image/${format}`,0.6)
})

let name=prefix+"_"+String(i+1).padStart(3,"0")+"."+format

processed.push({name,blob})

let box=document.createElement("div")
box.className="imageBox"

let imgPreview=document.createElement("img")
imgPreview.src=URL.createObjectURL(blob)

let btn=document.createElement("button")
btn.className="downloadBtn"
btn.innerText="Download"

btn.onclick=()=>{
saveAs(blob,name)
}

box.appendChild(imgPreview)
box.appendChild(btn)

gallery.appendChild(box)

}

alert("Images Ready")

}

async function downloadZip(){

if(processed.length===0){
alert("Resize images first")
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