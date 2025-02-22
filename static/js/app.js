let userName = '';
let ipAddress = '';
let pictureCount = 0;
let userId = null;

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
            document.getElementById('pictureSection').style.display = 'block';
        } else {
            alert("Error: " + data.error);
        }
    })
    .catch(error => {
        console.error('Error sending user data to DB:', error);
    });
}

// Step 3: Start Taking Pictures
function startTakingPictures() {
    // You can add logic here to start a 5-minute timer if needed.
}

// Step 4: Take Picture and Update the Database
function takePicture() {
    if (pictureCount >= 10) {
        alert("You have reached the limit of 10 pictures.");
        return;
    }

    fetch(`/api/user/${userId}/take_picture`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Picture taken!") {
            pictureCount++;
            document.getElementById('pictureCount').innerText = `${pictureCount}`;
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error taking picture:', error);
    });
}
