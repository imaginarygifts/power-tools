// 1. Global State
let files = [];
let processed = [];

// 2. Initialize FFmpeg (v0.11.x)
const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ 
    log: true,
    // This updates the blue progress bar as the video encodes
    progress: ({ ratio }) => {
        const progressFill = document.getElementById("progressFill");
        if (progressFill) {
            progressFill.style.width = (ratio * 100) + "%";
        }
    }
});

// 3. Select Elements
const videoInput = document.getElementById("videoInput");
const folderInput = document.getElementById("folderInput");
const compressBtn = document.querySelector("button:nth-of-type(3)"); // Targets "Compress Videos"
const zipBtn = document.getElementById("zipBtn");

// 4. Event Listeners
videoInput.addEventListener("change", (e) => handleFiles(e.target.files));
folderInput.addEventListener("change", (e) => handleFiles(e.target.files));
// We use a specific function call for the blue button
document.querySelectorAll('button').forEach(btn => {
    if(btn.innerText.includes("Compress")) {
        btn.onclick = compressVideos;
    }
});

/**
 * Handles the file selection and updates the UI
 */
function handleFiles(fileList) {
    const gallery = document.getElementById("gallery");
    const selected = Array.from(fileList);

    // Filter for video types only
    selected.forEach(file => {
        const name = file.name.toLowerCase();
        const isValid = name.endsWith(".mp4") || name.endsWith(".mov") || name.endsWith(".webm");
        
        if (isValid) {
            files.push(file); // Add to our global array
            
            // Create UI Preview immediately
            const box = document.createElement("div");
            box.style.margin = "10px 0";
            box.innerHTML = `
                <div style="background: #f0f0f0; padding: 10px; border-radius: 8px;">
                    <p style="font-size: 14px; margin-bottom: 5px;">${file.name}</p>
                    <video src="${URL.createObjectURL(file)}" style="width: 100%; border-radius: 4px;" muted></video>
                </div>
            `;
            gallery.appendChild(box);
        }
    });
}

/**
 * Core Compression Logic
 */
async function compressVideos() {
    if (files.length === 0) {
        alert("Please select videos first!");
        return;
    }

    const progressBox = document.getElementById("progressBox");
    const progressText = document.getElementById("progressText");
    const progressFill = document.getElementById("progressFill");

    if (progressBox) progressBox.style.display = "block";

    try {
        if (!ffmpeg.isLoaded()) {
            if (progressText) progressText.innerText = "Initializing Engine...";
            await ffmpeg.load();
        }

        processed = [];
        const gallery = document.getElementById("gallery");
        gallery.innerHTML = "<h3>Processing...</h3>"; // Clear gallery to show results

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (progressText) progressText.innerText = `Compressing: ${file.name}`;

            const inputName = `input_${i}`;
            const outputName = `output_${i}.mp4`;

            // Load file into FFmpeg memory
            ffmpeg.FS("writeFile", inputName, await fetchFile(file));

            // Run Compression: Resizes to 720p height, uses x264 codec
            await ffmpeg.run(
                "-i", inputName,
                "-vf", "scale=-2:720", 
                "-c:v", "libx264",
                "-crf", "28", 
                "-preset", "ultrafast", // Fastest for mobile browsers
                "-c:a", "aac",
                outputName
            );

            // Fetch processed data
            const data = ffmpeg.FS("readFile", outputName);
            const blob = new Blob([data.buffer], { type: "video/mp4" });
            const url = URL.createObjectURL(blob);

            processed.push({ name: `compressed_${file.name}`, blob: blob });

            // Update Gallery with Result
            const resultBox = document.createElement("div");
            resultBox.innerHTML = `
                <p>✅ Done: ${file.name}</p>
                <video src="${url}" controls style="width: 100%;"></video>
                <hr>
            `;
            gallery.appendChild(resultBox);

            // Cleanup
            ffmpeg.FS("unlink", inputName);
            ffmpeg.FS("unlink", outputName);
        }

        if (progressText) progressText.innerText = "All Done!";
        if (zipBtn) zipBtn.style.display = "block";

    } catch (err) {
        console.error(err);
        alert("Error: Make sure you are using a secure context (HTTPS/Localhost) and your server allows Cross-Origin-Isolation.");
    }
}
