let mediaRecorder = null;
let recordedChunks = [];
let prevChunks = []
let language = 'en';
let interval = undefined
let timeout = undefined
let currentPath = ""

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'setLanguage') {
        language = message.data;
        console.log(`Language set to ${language}`);
    }
});



// Listen for keydown events on the document
document.addEventListener('keydown', (event) => {
    // Check if 'T' key was pressed
    if (event.key === 't' || event.key === 'T') {
        // Stop recording
        let chunks = prevChunks
        if (mediaRecorder === null) {
            startRecording()
            return
        }
        if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
        if (mediaRecorder.state === 'inactive') {
            mediaRecorder.start();
        }
        // Convert recorded chunks to a single Blob
        const audioBlob = new Blob([...chunks, ...recordedChunks], { type: 'audio/webm' });
        const formData = new FormData();
        formData.append("audio", audioBlob, "audio.webm");
        formData.append("targetLanguage", language)

        fetch("http://localhost:3000/api/hello", { method: "POST", body: formData })
            .then(res => res.json())
            .then(data => {
                transcript = data.translation
                if (transcript) {
                    alert(transcript)
                }
            })
            .catch(err => {
                if (interval) {
                    clearInterval(interval)
                }
                startRecording()
                console.log(err)
            })
    }
});

function startRecording() {
    console.log("started")
    clearInterval(interval);
    try {
        const video = document.querySelector("video")
        const audioStream = new MediaStream(video.captureStream().getAudioTracks());

        mediaRecorder = new MediaRecorder(audioStream);
        mediaRecorder.addEventListener('dataavailable', (event) => {
            const startTime = event.timeStamp - 3000;
            prevChunks = recordedChunks
            recordedChunks = recordedChunks.filter(chunk => chunk.timeStamp >= startTime);
            recordedChunks.push(event.data);

        });

        if (mediaRecorder.state === 'inactive') {
            mediaRecorder.start();
        }

        interval = setInterval(() => {
            if (mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
            }
            if (mediaRecorder.state === 'inactive') {
                mediaRecorder.start();
            }
        }, 3000);

    } catch (error) {
        console.log(`Error starting recording: ${error}`)
        timeout = setTimeout(() => startRecording(), 2000)
    }
}

//These SPAs
setInterval(() => {
    if (location.href !== currentPath) {
        clearInterval(interval)
        clearTimeout(timeout)
        startRecording()
        currentPath = location.href
    }
}, 1000)
