document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    
    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent default form submission
        
        // Get the values from the input fields
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        // Basic validation
        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        // Create the request body
        const requestBody = {
            username,
            password,
        };

        try {
            // Send a POST request to the registration endpoint
            const response = await fetch('/api/v1/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            // Handle success or error
            if (data.success) {
                alert("Registration successful! You can now log in.");
                window.location.href = "/login/index.html"; // Redirect to login page
            } else {
                alert(data.message); // Show error message
            }
        } catch (error) {
            console.error('Error:', error);
            alert("An error occurred. Please try again later.");
        }
    });
});
