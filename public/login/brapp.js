document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    
    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent default form submission
        
        // Get the values from the input fields
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        // Create the request body
        const requestBody = {
            username,
            password,
        };

        try {
            // Send a POST request to the login endpoint
            const response = await fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            // Handle success or error
            if (data.success) {
                alert("Login successful! Redirecting...");
                window.location.href = "/dashboard/index.html"; // Redirect to dashboard or main page
            } else {
                alert(data.message); // Show error message
            }
        } catch (error) {
            console.error('Error:', error);
            alert("An error occurred. Please try again later.");
        }
    });
});
