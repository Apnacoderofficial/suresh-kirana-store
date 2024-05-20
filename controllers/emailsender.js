const nodemailer = require('nodemailer');

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "apnaofficialcoder@gmail.com",
      pass: "svgf mbwq wcev bknq",
    },
  });

// Function to send email
const sendMail = (to, cc, bcc, subject, htmlContent) => {
    // Set up mail options
    const mailOptions = {
        from: '"Suresh Kirana Store" <apnaofficialcoder@gmail.com>',
        to: to,
        cc: cc,
        bcc: bcc,
        subject: subject + " - Suresh kirana Store",
        html : `
        <html>
        <head>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A==" crossorigin="anonymous" referrerpolicy="no-referrer" />
            <style>
                /* Add your CSS styles here to beautify the HTML UI */
                body {
                    background-color: #f0f0f0; /* Set background color */
                    font-family: Arial, sans-serif; /* Set font family */
                }
                .container {
                    max-width: 800px; /* Set max width for the content */
                    margin: 0 auto; /* Center the content horizontally */
                    padding: 20px; /* Add padding for spacing */
                    background-color: #fff; /* Set background color for the container */
                    border-radius: 8px; /* Add border radius for rounded corners */
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* Add box shadow for depth */
                }
                header {
                    text-align: center; /* Center align header content */
                    margin-bottom: 20px; /* Add margin bottom for spacing */
                }
                header img {
                    width: 150px; /* Set width for the logo */
                    height: auto; /* Maintain aspect ratio */
                }
                footer {
                    text-align: center; /* Center align footer content */
                    margin-top: 20px; /* Add margin top for spacing */
                }
                footer a {
                    margin: 0 10px; /* Add margin between social icons */
                    color: #333; /* Set color for social icons */
                }
            </style>
        </head>
        <body>
            <div class="container">
                <header>
                    <img src="https://suresh-kirana-store.onrender.com/assets/images/logo/Suresh-logo.png" alt="Store Logo"> <!-- Replace 'logo.png' with the path to your logo image -->
                </header>
                <p>${htmlContent}</p> <!-- Use the HTML content provided as the message -->
                <p>Feel free to contact us for support or any questions you may have.</p>
                <div class="support">
                    <p>Contact us at <a href="mailto:quickhatastore@gmail.com">quickhatastore@gmail.com</a></p>
                </div>
                <footer>
                    <a href="#"><img src='https://suresh-kirana-store.onrender.com/assets/images/social/facebook.png' width="40px"></a> <!-- Add your social media links and icons here -->
                    <a href="#"><img src='https://suresh-kirana-store.onrender.com/assets/images/social/twitter.png' width="40px"></a>
                    <a href="#"><img src='https://suresh-kirana-store.onrender.com/assets/images/social/instagram.png' width="40px"></i></a>
                    <a href="#"><img src='https://suresh-kirana-store.onrender.com/assets/images/social/whatsapp.png' width="40px"></i></a>
                    <p>Follow us on social media for updates!</p>
                </footer>
            </div>
        </body>
        </html>
        
`
    };

    // Send mail
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

module.exports = sendMail;
