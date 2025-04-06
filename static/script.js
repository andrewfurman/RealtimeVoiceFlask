document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const statusDiv = document.getElementById('status');
    const remoteAudio = document.getElementById('remoteAudio'); // Get the audio element

    let pc; // RTCPeerConnection
    let dc; // RTCDataChannel
    let localStream; // User's microphone stream

    startButton.addEventListener('click', startChat);
    stopButton.addEventListener('click', stopChat);

    async function startChat() {
        console.log('Attempting to start chat...');
        statusDiv.textContent = 'Connecting...';
        startButton.disabled = true;
        stopButton.disabled = false;

        try {
            // 1. Get an ephemeral key from your server
            const tokenResponse = await fetch("/session");
            if (!tokenResponse.ok) {
                 const errorData = await tokenResponse.json();
                 throw new Error(`Failed to get session token: ${tokenResponse.status} ${tokenResponse.statusText} - ${JSON.stringify(errorData.details || errorData.error)}`);
            }
            const sessionData = await tokenResponse.json();
            const EPHEMERAL_KEY = sessionData.client_secret?.value; // Use optional chaining
            const REALTIME_MODEL = sessionData.model; // Get model from session data

            if (!EPHEMERAL_KEY) {
                 throw new Error("Ephemeral key (client_secret.value) not found in session response.");
            }
            if (!REALTIME_MODEL) {
                 console.warn("Model not found in session response, using default.");
                 // Consider setting a default or throwing an error if model is critical
                 // REALTIME_MODEL = "gpt-4o-realtime-preview-2024-12-17"; // Example default
            }

            console.log('Ephemeral key received.');

            // 2. Create a peer connection
            pc = new RTCPeerConnection();

            // 3. Set up to play remote audio from the model
            pc.ontrack = e => {
                console.log('Remote track received:', e.track);
                if (e.streams && e.streams[0]) {
                    remoteAudio.srcObject = e.streams[0];
                    console.log('Assigned remote stream to audio element.');
                } else {
                     console.warn("Received track event without streams.");
                     // Fallback for older browser compatibility if needed, but less common now
                     // let inboundStream = new MediaStream();
                     // inboundStream.addTrack(e.track);
                     // remoteAudio.srcObject = inboundStream;
                }
                 // Attempt to play audio programmatically after user interaction
                 remoteAudio.play().catch(e => console.error("Audio play failed:", e));
            };

            // Handle connection state changes for debugging/status updates
             pc.onconnectionstatechange = event => {
                 statusDiv.textContent = `Connection State: ${pc.connectionState}`;
                 console.log(`Peer Connection State: ${pc.connectionState}`);
                 if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected' || pc.connectionState === 'closed') {
                     stopChat(); // Clean up if connection drops
                 }
             };

             pc.onicecandidateerror = event => {
                console.error("ICE Candidate Error:", event);
                statusDiv.textContent = `Error: ICE Candidate Error - ${event.errorCode}: ${event.errorText}`;
             };

             pc.onicegatheringstatechange = () => console.log(`ICE Gathering State: ${pc.iceGatheringState}`);


            // 4. Add local audio track for microphone input in the browser
            console.log('Requesting microphone access...');
            localStream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });
            localStream.getTracks().forEach(track => {
                 pc.addTrack(track, localStream);
                 console.log('Local audio track added.');
             });


            // 5. Set up data channel for sending and receiving events
            dc = pc.createDataChannel("oai-events");
            console.log('Data channel created.');

            dc.onopen = () => {
                 console.log('Data channel opened.');
                 statusDiv.textContent = 'Data channel open.';
                 // Example: Send initial configuration or greeting if needed
                 // dc.send(JSON.stringify({ type: 'configure', settings: {} }));
             };

            dc.onmessage = (event) => {
                // Realtime server events appear here!
                console.log('Data channel message received:', event.data);
                // You'll need to parse event.data (likely JSON) and handle different event types
                 try {
                     const messageData = JSON.parse(event.data);
                     if (messageData.type === 'text') {
                         console.log("Received text:", messageData.text);
                         statusDiv.textContent = `Assistant: ${messageData.text}`;
                     } else if (messageData.type === 'transcription_update') {
                         console.log("Transcription:", messageData.transcription);
                         statusDiv.textContent = `You: ${messageData.transcription}`;
                     } else if (messageData.type === 'system') {
                         console.log("System message:", messageData.text);
                         statusDiv.textContent = `System: ${messageData.text}`;
                     }
                     // Add more handlers for other event types (e.g., 'audio', 'error', 'function_call')
                 } catch (e) {
                     console.error("Failed to parse data channel message:", e, "Raw data:", event.data);
                 }
            };

             dc.onclose = () => {
                 console.log('Data channel closed.');
                 statusDiv.textContent = 'Data channel closed.';
             };

             dc.onerror = (error) => {
                 console.error('Data channel error:', error);
                 statusDiv.textContent = `Error: Data channel error - ${error.message}`;
             };


            // 6. Start the session using the Session Description Protocol (SDP)
            console.log('Creating SDP offer...');
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            console.log('Local description set.');

            const baseUrl = "https://api.openai.com/v1/realtime";
            // Use the model name obtained from the session endpoint
            const sdpResponse = await fetch(`${baseUrl}?model=${REALTIME_MODEL}`, {
                method: "POST",
                body: offer.sdp, // Send the SDP offer text directly
                headers: {
                    Authorization: `Bearer ${EPHEMERAL_KEY}`,
                    "Content-Type": "application/sdp" // Crucial header
                },
            });

            if (!sdpResponse.ok) {
                const errorText = await sdpResponse.text();
                 throw new Error(`SDP exchange failed: ${sdpResponse.status} ${sdpResponse.statusText} - ${errorText}`);
            }

            const answerSdp = await sdpResponse.text();
            console.log('Received SDP answer.');
            const answer = {
                type: "answer",
                sdp: answerSdp,
            };
            await pc.setRemoteDescription(answer);
            console.log('Remote description set. WebRTC setup complete.');
            statusDiv.textContent = 'Connected!';

        } catch (error) {
            console.error('Error starting chat:', error);
            statusDiv.textContent = `Error: ${error.message}`;
            stopChat(); // Clean up on error
            startButton.disabled = false;
            stopButton.disabled = true;
        }
    }

    function stopChat() {
        console.log('Stopping chat...');
        if (dc) {
            dc.close();
            dc = null;
            console.log('Data channel closed.');
        }
        if (pc) {
            // Stop sending tracks
            pc.getSenders().forEach(sender => {
                if (sender.track) {
                    sender.track.stop();
                }
            });
             // Stop receiving tracks (though srcObject = null is often sufficient)
             pc.getReceivers().forEach(receiver => {
                if (receiver.track) {
                    receiver.track.stop();
                }
             });

            pc.close();
            pc = null;
            console.log('Peer connection closed.');
        }
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            localStream = null;
            console.log('Local microphone stream stopped.');
        }
        // Clear the audio source
         if (remoteAudio) {
             remoteAudio.srcObject = null;
             remoteAudio.pause(); // Ensure it's paused
             remoteAudio.load(); // Reset the element
         }

        statusDiv.textContent = 'Disconnected';
        startButton.disabled = false;
        stopButton.disabled = true;
        console.log('Chat stopped and resources released.');
    }
});