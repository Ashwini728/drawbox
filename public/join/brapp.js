// Wait until the DOM is fully loaded before executing
document.addEventListener('DOMContentLoaded', () => {
    // Step 1: Extract roomId from URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('roomId'); // Get the roomId from the query string

    if (roomId) {
        // Step 2: Populate the input field with the roomId
        document.getElementById('roomId').value = roomId;
    } else {
        alert('Room ID is missing in the URL!');
    }

    // Step 3: Add event listener for form submission
    document.getElementById('joinRoomForm').addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the form from submitting normally

        // Check if the user is logged in
        const isLoggedIn = await checkUserLoginStatus();

        if (isLoggedIn) {
            // Redirect to the room page if the user is logged in
            window.location.href = `/dashboard`; // Redirect to the room page with the roomId in the query string
        } else {
            // Redirect to login page if the user is not logged in
            window.location.href = '/login';
        }
    });
});

// Function to check if the user is logged in
async function checkUserLoginStatus() {
    try {
        const response = await fetch('/api/v1/auth/test', {
            method: 'GET',
            credentials: 'include', // Ensure cookies (session) are included
        });

        const data = await response.json();
        
        if (data.success && data.loggedIn) {
            return true; // User is logged in
        } else {
            return false; // User is not logged in
        }
    } catch (error) {
        console.error('Error checking user login status:', error);
        return false; // Default to not logged in if there's an error
    }
}
