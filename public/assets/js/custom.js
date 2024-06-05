document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll('form[id^="addToCartForm"]').forEach(function(form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const productId = formData.get('productId');
            const quantity = formData.get('quantity');

            fetch('/addToCartlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    productId: productId,
                    quantity: quantity
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Toastify({
                        text: "Product added to cart successfully!",
                        duration: 3000, // Duration in milliseconds
                        close: true, // Show close button
                        gravity: "top", // Position: top, bottom
                        position: "right", // Position: left, right, center
                        backgroundColor: "#4CAF50", // Background color
                    }).showToast();
                } else {
                    Toastify({
                        text: "Failed to add product to cart: " + data.error,
                        duration: 3000,
                        close: true,
                        gravity: "top",
                        position: "right",
                        backgroundColor: "#F44336",
                    }).showToast();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Toastify({
                    text: "An error occurred. Please try again.",
                    duration: 3000,
                    close: true,
                    gravity: "top",
                    position: "right",
                    backgroundColor: "#FF9800",
                }).showToast();
            });
        });
    });
});
