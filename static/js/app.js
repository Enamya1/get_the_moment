let userName = '';
let ipAddress = '';
let pictureCount = 0;
let userId = null;
let videoStream = null;
let max_images= 2;

// Step 1: Submit Name and Get IP Address
function submitName() {
 
    userName = document.getElementById('nameInput').value;
    
    if (!userName) {
        alert("Please enter your name.");
        return;
    }

    fetch('/api/ip')
        .then(response => response.json())
        .then(data => {
            ipAddress = data.ip;
            document.getElementById('ipAddress').innerText = ipAddress;
            document.getElementById('ipAddressSection').style.display = 'block';
            sendUserDataToDB();  // Send name and IP address to the database
        })
        .catch(error => {
            console.error('Error fetching IP:', error);
        });
}

// Step 2: Send the user data to the backend and store it in the database
function sendUserDataToDB() {
    fetch('/api/user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: userName,
            ip_address: ipAddress
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "User created successfully!") {
            alert("User created!");
            userId = data.user_id;  // Store the user ID to track pictures
            document.getElementById('cameraSection').style.display = 'block';
            startCamera();  // Start the camera feed
        } else {
            alert("Error: " + data.error);
        }
    })
    .catch(error => {
        console.error('Error sending user data to DB:', error);
    });
}

// Step 3: Start Camera (request camera permission and display video feed)
function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            videoStream = stream;
            const videoElement = document.getElementById('video');
            videoElement.srcObject = stream;
        })
        .catch(error => {
            console.error("Error accessing camera: ", error);
            alert("Could not access camera. Please check your permissions.");
        });
}

// Step 4: Take Snapshot from Camera Feed
function takeSnapshot() {
    const videoElement = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size to match video size
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    // Draw the current frame from the video feed onto the canvas
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // Convert canvas image to a data URL (base64 encoded image)
    const imageData = canvas.toDataURL('image/png');
    uploadSnapshot(imageData);  // Upload the snapshot to the server
}

// Step 5: Upload the snapshot to the server
function uploadSnapshot(imageData) {
    console.log(pictureCount)
    if (pictureCount >= max_images) {
        alert("You have reached the limit of "+max_images+" pictures.");
        return;
    }
    
    fetch('/api/upload_snapshot', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: userId,
            image_data: imageData
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Snapshot uploaded successfully!") {
            alert("Snapshot uploaded!");
            pictureCount=pictureCount+1;
        } else {
            alert("Error uploading snapshot.");
        }
    })
    .catch(error => {
        console.error('Error uploading snapshot:', error);
    });
}


