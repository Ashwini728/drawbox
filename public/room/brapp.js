// room.js

// Function to get query parameters from the URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

const roomId = getQueryParam('roomId'); // Extract roomId from query parameters
const groupingForm = document.getElementById('groupingForm');
const winnerForm = document.getElementById('winnerForm');
const participantsList = document.getElementById('participantsList');
const groupingDetails = document.getElementById('groupingDetails');
const groupingTable = document.getElementById('groupingTable');
const winnerDetails = document.getElementById('winnerDetails');
const winnerMessage = document.getElementById('winnerMessage');

// Fetch participants when the page loads
async function fetchParticipants() {
    try {
        const response = await fetch(`/api/v1/rooms/${roomId}/participants`, {
            method: 'GET',
            credentials: 'include',
        });
        const data = await response.json();
        if (data.success) {
            populateParticipantsList(data.usernames);
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error fetching participants:', error);
    }
}

// Populate participants list
function populateParticipantsList(participants) {
    participantsList.innerHTML = ''; // Clear previous list
    participants.forEach(participant => {
        const li = document.createElement('li');
        li.textContent = participant; // Assuming participant has a username field
        participantsList.appendChild(li);
    });
}

// Handle grouping participants
groupingForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent form submission
    const groupSize = document.getElementById('groupSize').value;

    try {
        // Step 1: Group participants using the group size
        await fetch(`/api/v1/rooms/${roomId}/group`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ groupSize }),
            credentials: 'include',
        });
        alert('Participants grouped successfully!');
    } catch (error) {
        console.error('Error grouping participants:', error);
    }
});


// Handle selecting a winner
winnerForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent form submission

    try {
        const response = await fetch(`/api/v1/rooms/${roomId}/winner`, {
            method: 'POST',
            credentials: 'include',
        });

        const data = await response.json();
        if (data.success) {
            displayWinnerDetails(data);
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error selecting winner:', error);
    }
});

// Function to display winner details
function displayWinnerDetails(winner) {
    winnerMessage.textContent = `Winner: ${winner.winnerUsername}`; // Assuming winner contains username
    winnerDetails.style.display = 'block'; // Show winner details
    groupingDetails.style.display = 'none'; // Hide grouping details
}

// Finalize room button
document.getElementById('finalizeRoomButton').addEventListener('click', async () => {
    try {
        const response = await fetch(`/api/v1/rooms/${roomId}/finalize`, {
            method: 'POST',
            credentials: 'include',
        });

        const data = await response.json();
        if (data.success) {
            alert('Room finalized successfully!');
            // Optionally redirect or clear the form
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error finalizing room:', error);
    }
});

// Function to generate invite link
function generateInviteLink() {
    const baseUrl = window.location.origin; // Get the base URL
    const inviteLink = `${baseUrl}/join?roomId=${roomId}`; // Construct the invite link
    document.getElementById('inviteLink').value = inviteLink; // Set the invite link in the input field
}

// Copy link to clipboard
document.getElementById('copyLinkButton').addEventListener('click', () => {
    const inviteLinkInput = document.getElementById('inviteLink');
    inviteLinkInput.select(); // Select the input text
    document.execCommand('copy'); // Copy the selected text to clipboard
    alert('Invite link copied to clipboard!'); // Notify the user
});

// Call the function to generate the invite link when the page loads
generateInviteLink();


// Call the function to fetch participants on page load
fetchParticipants();
