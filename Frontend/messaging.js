// Messaging functionality
document.addEventListener('DOMContentLoaded', function() {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const messagesContainer = document.querySelector('.messages');

    var socket = io("https://r5chbk85-5000.uks1.devtunnels.ms");

    socket.on("connect", () => {
        console.log("Connected to server");
        //addMessage(`You connnected with: ${socket.id}`);
    });

   
    // Function to add a new message to the chat
    function addMessage(content, isUser = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = isUser ? 'message user-message' : 'message other-message';
        messageDiv.textContent = content;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Handle send button click
    sendButton.addEventListener('click', function() {
        const message = messageInput.value.trim();
        if (message) {
            addMessage(message);
            socket.emit("chat message", message);
            messageInput.value = '';
        }
        
    });
    socket.on("chat message", (message) => {
        console.log("Received:", message);
        addMessage(message, false); // false indicates it's not a message sent by this client
    });
    
    

    // sendButton.addEventListener('click', function() {
    //     const message = messageInput.value.trim();
    //     if (message) {
    //         addMessage(message);
    //          // Emit the message to the server
    //         messageInput.value = '';
    //     }
    // });

    // Handle Enter key press
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendButton.click();
        }
    });
    

    
});
