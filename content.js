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
        alert("here")
        return
        // Stop recording
        mediaRecorder.stop();

        // Convert recorded chunks to a single Blob
        const audioBlob = new Blob(recordedChunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append("audio", audioBlob, "audio.webm");

        fetch("https://api.openai.com/v1/whisper/interpretations", {
            method: "POST",
            headers: {
                "Authorization": "Bearer <YOUR_API_KEY>",
            },
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                transcript += data.transcriptions[0].text;
                audioChunks = [];
                fetch(`https://translation.googleapis.com/language/translate/v2?key=<YOUR_API_KEY>&q=${encodeURIComponent(transcript)}&target=${language}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                })
                    .then(response => response.json())
                    .then(data => {
                        transcript = data.data.translations[0].translatedText;
                        console.log(transcript);
                    })
                    .catch(console.error);
            })
            .catch(console.error);

        // Reset variables
        recordedChunks = [];
        mediaRecorder = null;
    }
});

// Find and start recording audio from media elements on the page
const startRecording = () => {
    const mediaElements = document.querySelectorAll('audio, video');
    mediaElements.forEach((mediaElement) => {
        const stream = mediaElement.captureStream();
        const options = { mimeType: 'audio/webm' };
        mediaRecorder = new MediaRecorder(stream, options);

        mediaRecorder.addEventListener('dataavailable', (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        });

        mediaRecorder.start();
        console.log('Recording started...');
    });
};

startRecording();
