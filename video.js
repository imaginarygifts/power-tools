let files=[]
let processed=[]

const { createFFmpeg, fetchFile } = FFmpeg

const ffmpeg = createFFmpeg({ log:true })

const videoInput=document.getElementById("videoInput")
const folderInput=document.getElementById("folderInput")
const zipBtn=document.getElementById("zipBtn")

videoInput.addEventListener("change",handleFiles)
folderInput.addEventListener("change",handleFiles)

function handleFiles(e){

let uploadBox=document.getElementById("uploadBox")
uploadBox.style.display="flex"

setTimeout(()=>{

files=[...e.target.files].filter(f=>f.type.startsWith("video"))

showPreview()

uploadBox.style.display="none"

},200)

}

function showPreview(){

let gallery=document.getElementById("gallery")
gallery.innerHTML=""

files.forEach(file=>{

let box=document.createElement("div")

let video=document.createElement("video")
video.src=URL.createObjectURL(file)
video.controls=true

box.appendChild(video)

gallery.appendChild(box)

})

}

async function compressVideos(){

if(files.length===0){
alert("Select videos first")
return
}

let progressBox=document.getElementById("progressBox")
let progressText=document.getElementById("progressText")
let progressFill=document.getElementById("progressFill")

progressBox.style.display="flex"

if(!ffmpeg.isLoaded()){
await ffmpeg.load()
}

let codec=document.getElementById("codec").value
let resolution=document.getElementById("resolution").value
let crf=document.getElementById("crf").value

processed=[]

for(let i=0;i<files.length;i++){

progressText.innerText="Processing "+(i+1)+" / "+files.length

let percent=((i+1)/files.length)*100
progressFill.style.width=percent+"%"

let file=files[i]

let inputName="input"+i
let outputName="output"+i+".mp4"

ffmpeg.FS("writeFile",inputName,await fetchFile(file))

await ffmpeg.run(
"-i",inputName,
"-vf","scale=-2:"+resolution+",fps=30",
"-c:v",codec,
"-crf",crf,
"-preset","medium",
"-c:a","aac",
"-b:a","128k",
outputName
)

const data=ffmpeg.FS("readFile",outputName)

let blob=new Blob([data.buffer],{type:"video/mp4"})

processed.push({
name:"video_"+(i+1)+".mp4",
blob:blob
})

let video=document.createElement("video")
video.src=URL.createObjectURL(blob)
video.controls=true

document.getElementById("gallery").appendChild(video)

}

progressBox.style.display="none"

zipBtn.style.display="block"

}

async function downloadZip(){

let zip=new JSZip()

processed.forEach(item=>{
zip.file(item.name,item.blob)
})

let content=await zip.generateAsync({type:"blob"})

saveAs(content,"compressed_videos.zip")

}