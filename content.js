// Set up variables
let mediaRecorder = null;
let recordedChunks = [];
let language = 'en';

// Listen for messages from the background script
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

        // Convert recorded chunks to a single Blob
        const audioBlob = new Blob(recordedChunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append("audio", audioBlob, "audio.webm");
        formData.append("targetLanguage", language)

        fetch("http://localhost:3000/api/hello", { method: "POST", body: formData })
            .then(res => res.json())
            .then(data => {
                transcript = data.data.translations[0].translatedText;
                alert(transcript)
            })
            .catch(err => {
                console.log(err)
            })
        // Reset variables
        recordedChunks = [];
        mediaRecorder = null;
    }
});

function startRecording() {
    const stream = document.querySelector('video, audio').captureStream();
    if (!stream) {
        console.error('No media stream found');
        return;
    }
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.addEventListener('dataavailable', (event) => {
        recordedChunks.push(event.data);
    });

    if (mediaRecorder.state === 'inactive') {
        mediaRecorder.start();
    }

    console.log('Recording started');

    setTimeout(() => {
        if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
        recordedChunks = []
        console.log('Recording stopped');
    }, 10000);
}


startRecording();
