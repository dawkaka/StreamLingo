let mediaRecorder = null;
let recordedChunks = [];
let prevChunks = []
let language = 'en';
let full = false

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
        console.log('Translating audio...');
        // Stop recording
        let chunks = prevChunks
        if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
        if (mediaRecorder.state === 'inactive') {
            mediaRecorder.start();
        }
        // Convert recorded chunks to a single Blob
        const audioBlob = new Blob([...prevChunks, ...recordedChunks], { type: 'audio/webm' });
        const formData = new FormData();
        formData.append("audio", audioBlob, "audio.webm");
        formData.append("targetLanguage", language)

        fetch("http://localhost:3000/api/hello", { method: "POST", body: formData })
            .then(res => res.json())
            .then(data => {
                transcript = data.translation
                alert(transcript)
            })
            .catch(err => {
                console.log(err)
            })
    }
});


function startRecording() {
    try {
        const data = document.querySelector('video, audio')
        if (!data) {
            return
        }

        const stream = data.captureStream();
        if (!stream) {
            console.error('No media stream found');
            return;
        }

        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.addEventListener('dataavailable', (event) => {
            // Calculate the start time for the last 5 seconds of audio
            const startTime = event.timeStamp - 5000;
            prevChunks = recordedChunks
            // Filter out any chunks that occurred before the last 5 seconds
            recordedChunks = recordedChunks.filter(chunk => chunk.timeStamp >= startTime);

            // Push the current chunk to the recordedChunks array
            recordedChunks.push(event.data);

            console.log(recordedChunks.length);
        });

        if (mediaRecorder.state === 'inactive') {
            mediaRecorder.start();
        }

        console.log('Recording started');

        setInterval(() => {
            if (mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
            }
            console.log('chuncked');
            if (mediaRecorder.state === 'inactive') {
                mediaRecorder.start();
            }
        }, 5000);

    } catch (error) {
        setTimeout(() => {
            startRecording()
        }, 3000)
    }
}
startRecording()