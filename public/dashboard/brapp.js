document.addEventListener("DOMContentLoaded", () => {
    const joinedRoomsContainer = document.getElementById("joinedRooms");
    const createdRoomsContainer = document.getElementById("createdRooms");
    const createRoomForm = document.getElementById("createRoomForm");
    const logoutButton = document.getElementById("logoutButton");

    const roomStatusModal = document.getElementById("roomStatusModal");
    const roomStatusContent = document.getElementById("roomStatusContent");
    const closeModalButton = document.querySelector(".close");

    // Fetch rooms joined by the user
    const fetchJoinedRooms = async () => {
        try {
            const response = await fetch('/api/v1/rooms/joinedRooms', {
                method: 'GET',
                credentials: 'include',
            });
            const data = await response.json();
            if (data.success) {
                renderRooms(joinedRoomsContainer, data.rooms, "joined");
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error fetching joined rooms:', error);
        }
    };

    // Fetch rooms created by the user
    const fetchCreatedRooms = async () => {
        try {
            const response = await fetch('/api/v1/rooms/myRooms', {
                method: 'GET',
                credentials: 'include',
            });
            const data = await response.json();
            if (data.success) {
                renderRooms(createdRoomsContainer, data.rooms, "created");
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error fetching created rooms:', error);
        }
    };

    // Render rooms in the specified container
    const renderRooms = (container, rooms, type) => {
        container.innerHTML = ""; // Clear the container
        rooms.forEach(room => {
            const roomElement = document.createElement("div");
            roomElement.classList.add("room-card");

            // Room title
            const roomTitle = document.createElement("div");
            roomTitle.classList.add("room-title");
            roomTitle.textContent = room.roomName;

            // Room description
            const roomDescription = document.createElement("div");
            roomDescription.classList.add("room-description");
            roomDescription.textContent = room.roomDescription ? room.roomDescription.slice(0, 50) + "..." : "No description available";

            // Add event listener for room actions
            roomElement.addEventListener("click", () => {
                if (type === "joined") {
                    checkRoomStatus(room._id); // Check status of joined room
                } else if (type === "created") {
                    window.location.href = `/room?roomId=${room._id}`;
                }
            });

            roomElement.appendChild(roomTitle);
            roomElement.appendChild(roomDescription);
            container.appendChild(roomElement);
        });
    };

    const checkRoomStatus = async (roomId) => {
        try {
            // First API call to check room status
            const response = await fetch(`/api/v1/rooms/${roomId}/status`, {
                method: 'GET',
                credentials: 'include',
            });
            const data = await response.json();
            if (data) {
                let statusMessage;
                if (data.type === "grouped") {
                    statusMessage = `Grouped: Group Number ${data.groupNumber}`;
    
                    // Fetch group members if the room is grouped
                    const groupMembersResponse = await fetch(`/api/v1/rooms/${roomId}/group/?groupNumber=${data.groupNumber}`, {
                        method: 'GET',
                        credentials: 'include',
                    });
                    const { usernames } = await groupMembersResponse.json();
                    if (usernames && usernames.length) {
                        const memberNames = usernames.join(", ");
                        statusMessage += `\nGroup Members: ${memberNames}`;
                    } else {
                        statusMessage += `\nFailed to retrieve group members.`;
                    }
    
                } else if (data.type === "draw") {
                    statusMessage = `Draw: ${data.winner ? "You are the winner!" : "You were not chosen as the winner."}`;
                } else {
                    statusMessage = "Unknown room status.";
                }
    
                roomStatusContent.textContent = statusMessage;
                openModal();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error checking room status:', error);
        }
    };
    

    // Open modal
    const openModal = () => {
        roomStatusModal.style.display = "block";
    };

    // Close modal
    const closeModal = () => {
        roomStatusModal.style.display = "none";
    };

    // Close modal when the 'x' is clicked
    closeModalButton.addEventListener("click", closeModal);

    // Close modal when clicking outside of the modal
    window.addEventListener("click", (event) => {
        if (event.target === roomStatusModal) {
            closeModal();
        }
    });

    // Handle room creation
    createRoomForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const roomName = document.getElementById("roomName").value;
        const roomDescription = document.getElementById("roomDescription").value;

        const requestBody = {
            roomName,
            roomDescription,
        };

        try {
            const response = await fetch('/api/v1/rooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
                credentials: 'include',
            });

            const data = await response.json();
            if (data.success) {
                alert("Room created successfully!");
                fetchCreatedRooms();
                createRoomForm.reset();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error creating room:', error);
        }
    });

    // Handle logout
    logoutButton.addEventListener("click", async () => {
        try {
            const response = await fetch('/api/v1/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
            const data = await response.json();
            if (data.success) {
                alert("Logged out successfully!");
                window.location.href = "/login/index.html";
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    });

    // Fetch initial data
    fetchJoinedRooms();
    fetchCreatedRooms();
});
