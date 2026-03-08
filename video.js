// Global State
let files = [];
let processed = [];

// Initialize FFmpeg (using version 0.11.x syntax)
const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ 
    log: true,
    // progress helps update your UI bar in real-time for a single video
    progress: ({ ratio }) => {
        const individualBar = document.getElementById("progressFill");
        if (individualBar) individualBar.style.width = (ratio * 100) + "%";
    }
});

// Select Elements
const videoInput = document.getElementById("videoInput");
const folderInput = document.getElementById("folderInput");
const compressBtn = document.getElementById("compressBtn"); // Ensure this ID exists in HTML
const zipBtn = document.getElementById("zipBtn");

// Event Listeners
videoInput.addEventListener("change", handleFiles);
folderInput.addEventListener("change", handleFiles);
compressBtn.addEventListener("click", compressVideos);
zipBtn.addEventListener("click", downloadZip);

/**
 * 1. Handle File Selection
 */
function handleFiles(e) {
    const uploadBox = document.getElementById("uploadBox");
    if (uploadBox) uploadBox.style.display = "flex";

    const selected = [...e.target.files];
    files = []; // Reset file list on new selection

    selected.forEach(file => {
        const name = file.name.toLowerCase();
        if (name.endsWith(".mp4") || name.endsWith(".mov") || name.endsWith(".webm")) {
            files.push(file);
        }
    });

    if (uploadBox) uploadBox.style.display = "none";
    showPreview();
}

/**
 * 2. Show Pre-Compression Previews
 */
function showPreview() {
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";

    files.forEach(file => {
        const box = document.createElement("div");
        box.className = "video-item";
        
        const video = document.createElement("video");
        video.src = URL.createObjectURL(file);
        video.muted = true;
        video.style.width = "100%";
        video.style.borderRadius = "8px";
        
        const label = document.createElement("p");
        label.innerText = file.name;
        label.style.fontSize = "12px";

        box.appendChild(video);
        box.appendChild(label);
        gallery.appendChild(box);
    });
}

/**
 * 3. The Compression Core
 */
async function compressVideos() {
    if (files.length === 0) {
        alert("Please select videos first");
        return;
    }

    const progressBox = document.getElementById("progressBox");
    const progressText = document.getElementById("progressText");
    const progressFill = document.getElementById("progressFill");

    progressBox.style.display = "flex";
    compressBtn.disabled = true; // Prevent double clicking

    try {
        // Load FFmpeg Core
        if (!ffmpeg.isLoaded()) {
            progressText.innerText = "Loading FFmpeg Engine...";
            await ffmpeg.load();
        }

        processed = [];
        const gallery = document.getElementById("gallery");
        gallery.innerHTML = ""; // Clear to show results

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            progressText.innerText = `Processing ${i + 1} of ${files.length}`;

            const inputName = `input_${i}`;
            const outputName = `output_${i}.mp4`;

            // Write to Virtual File System
            ffmpeg.FS("writeFile", inputName, await fetchFile(file));

            // Run FFmpeg Command
            // -vf scale=-2:720 (Resizes to 720p while maintaining aspect ratio)
            // -crf 28 (Good balance between size and quality)
            await ffmpeg.run(
                "-i", inputName,
                "-vf", "scale=-2:720",
                "-c:v", "libx264",
                "-crf", "28",
                "-preset", "veryfast",
                "-c:a", "aac",
                "-b:a", "128k",
                outputName
            );

            // Read output and create Blob
            const data = ffmpeg.FS("readFile", outputName);
            const blob = new Blob([data.buffer], { type: "video/mp4" });

            processed.push({
                name: `compressed_${file.name.split('.')[0]}.mp4`,
                blob: blob
            });

            // Display result
            renderProcessedVideo(blob, i);

            // Cleanup memory
            ffmpeg.FS("unlink", inputName);
            ffmpeg.FS("unlink", outputName);
        }

        progressText.innerText = "All videos compressed!";
        zipBtn.style.display = "block";

    } catch (error) {
        console.error("FFmpeg Error:", error);
        alert("An error occurred during compression. Check console for details.");
    } finally {
        compressBtn.disabled = false;
    }
}

function renderProcessedVideo(blob, index) {
    const gallery = document.getElementById("gallery");
    const video = document.createElement("video");
    video.src = URL.createObjectURL(blob);
    video.controls = true;
    video.style.width = "100%";
    video.style.marginBottom = "10px";
    gallery.appendChild(video);
}

/**
 * 4. Create ZIP and Download
 */
async function downloadZip() {
    if (processed.length === 0) return;
    
    const zip = new JSZip();
    processed.forEach(item => {
        zip.file(item.name, item.blob);
    });

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "compressed_videos.zip");
}
