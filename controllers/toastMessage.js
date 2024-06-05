const Toastify = require('toastify-js');

// Middleware function to display toast notifications
const toastMessage = (message, messageType) => {
    console.log({message, messageType});
    return (req, res) => {
        let backgroundColor = '';

        // Set background color based on message type
        switch (messageType) {
            case 'success':
                backgroundColor = '#4CAF50'; // Green
                break;
            case 'error':
                backgroundColor = '#F44336'; // Red
                break;
            case 'warning':
                backgroundColor = '#FFC107'; // Yellow
                break;
            case 'info':
                backgroundColor = '#2196F3'; // Blue
                break;
            default:
                backgroundColor = '#333'; // Default color
        }

        // Show toast notification
        Toastify({
            text: message,
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            backgroundColor: backgroundColor,
            onClick: function() {
                console.log("Toast clicked!");
            }
        }).showToast();
    };
};

module.exports = toastMessage;
