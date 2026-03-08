let files=[]
let processed=[]

const { createFFmpeg, fetchFile } = FFmpeg

/* IMPORTANT: correct core path for GitHub pages */

const ffmpeg = createFFmpeg({
log:true,
corePath:"https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js"
})

const videoInput=document.getElementById("videoInput")
const folderInput=document.getElementById("folderInput")
const zipBtn=document.getElementById("zipBtn")

videoInput.addEventListener("change",handleFiles)
folderInput.addEventListener("change",handleFiles)



/* FILE SELECT */

function handleFiles(e){

let uploadBox=document.getElementById("uploadBox")
uploadBox.style.display="flex"

setTimeout(()=>{

let selected=[...e.target.files]

files=[]

selected.forEach(file=>{

let name=file.name.toLowerCase()

if(
name.endsWith(".mp4") ||
name.endsWith(".mov") ||
name.endsWith(".webm")
){
files.push(file)
}

})

showPreview()

uploadBox.style.display="none"

},200)

}



/* SHOW PREVIEW */

function showPreview(){

let gallery=document.getElementById("gallery")
gallery.innerHTML=""

files.forEach(file=>{

let box=document.createElement("div")
box.className="imageBox"

let video=document.createElement("video")

video.src=URL.createObjectURL(file)
video.muted=true
video.controls=false
video.preload="metadata"
video.playsInline=true

video.style.width="100%"
video.style.borderRadius="8px"

box.appendChild(video)

gallery.appendChild(box)

})

}



/* COMPRESS VIDEOS */

async function compressVideos(){

if(files.length===0){
alert("Please select videos first")
return
}

let progressBox=document.getElementById("progressBox")
let progressText=document.getElementById("progressText")
let progressFill=document.getElementById("progressFill")

progressBox.style.display="flex"

/* LOAD ENGINE FIRST */

if(!ffmpeg.isLoaded()){

progressText.innerText="Loading video engine..."

await ffmpeg.load()

}

processed=[]

let gallery=document.getElementById("gallery")
gallery.innerHTML=""



for(let i=0;i<files.length;i++){

progressText.innerText="Processing "+(i+1)+" / "+files.length

let percent=((i+1)/files.length)*100
progressFill.style.width=percent+"%"

let file=files[i]

let inputName="input"+i+".mp4"
let outputName="video_"+(i+1)+".mp4"



ffmpeg.FS("writeFile",inputName,await fetchFile(file))

await ffmpeg.run(
"-i",inputName,
"-vf","scale=-2:720,fps=30",
"-c:v","libx264",
"-crf","28",
"-preset","veryfast",
"-c:a","aac",
"-b:a","128k",
outputName
)



const data=ffmpeg.FS("readFile",outputName)

let blob=new Blob([data.buffer],{type:"video/mp4"})

processed.push({
name:outputName,
blob:blob
})



let box=document.createElement("div")
box.className="imageBox"

let video=document.createElement("video")

video.src=URL.createObjectURL(blob)
video.controls=true

video.style.width="100%"
video.style.borderRadius="8px"

box.appendChild(video)

gallery.appendChild(box)



ffmpeg.FS("unlink",inputName)
ffmpeg.FS("unlink",outputName)

}



progressBox.style.display="none"

zipBtn.style.display="block"

}



/* DOWNLOAD ZIP */

async function downloadZip(){

if(processed.length===0){
alert("No videos to download")
return
}

let zip=new JSZip()

processed.forEach(item=>{
zip.file(item.name,item.blob)
})

let content=await zip.generateAsync({type:"blob"})

saveAs(content,"compressed_videos.zip")

}