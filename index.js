'use strict';

const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
const PORT = 3000;

app.use(express.urlencoded({ 
    extended: true 
}));

app.use(express.static('public'));

app.post('/submit', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const subject = req.body.subject;
    const message = req.body.message;

    console.log(req.body);

    // Use mapped values to make the code more readable:
        // First, map userRole value to label
        const userRoleMap = {
            hiringManager: "Hiring Manager",
            recruiter: "Recruiter",
            softwareEngineer: "Software Engineer",
            student: "Student",
            faculty: "Faculty",
            staff: "Staff",
            other: "Other",
            none: "None",
        };

        // Next, map the contactSource value to label
        const contactSourceMap = {
            searchEngine: "Search Engine",
            socialMedia: "Social Media",
            wordOfMouth: "Word of Mouth",
            other: "Other",
        };
        const contactSourceValue = req.body.contactSource;
        const contactSourceLabel = contactSourceMap[contactSourceValue] || "Unknown";
    

    const userRoleValue = req.body.userRole;
    const userRoleLabel = userRoleMap[userRoleValue] || "None";

    // Extract and format checkbox values
    const checkboxes = Object.keys(req.body)
    .filter(key => key !== 'name' && key !== 'email' && key !== 'subject' && key !== 'message' && key !== 'userRole' && key !== 'contactSource')
    .filter(key => req.body[key] === 'yes')
    .join(', ');



    let htmlTop = `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="robots" content="noindex"> 
            <link rel="stylesheet" href="style.css">
            <link rel="apple-touch-icon" sizes="180x180" href="./images/apple-touch-icon.png"> 
            <link rel="icon" type="image/png" sizes="512x512" href="./images/android-chrome-512x512.png"> 
            <link rel="icon" type="image/png" sizes="192x192" href="./images/android-chrome-192x192.png"> 
            <link rel="icon" type="image/png" sizes="32x32" href="./images/favicon-32x32.png"> 
            <link rel="icon" type="image/png" sizes="16x16" href="./images/favicon-16x16.png"> 
            <link rel="manifest" href="site.webmanifest">
            <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
        
            <title>E. Alex McIntire</title>
        </head>
    
    <body>
        <header id="grid-child-header">
    
            <h1>
                <span>E. Alex</span>
                <a href="./index.html" >
                    <img id="headerImg" src="./images/android-chrome-192x192.png">
                </a>
                <span>McIntire</span>
            </h1>
        </header>
    
        <nav class="global" id="grid-child-global-nav">
            <a href="./index.html">Home</a>
            <a href="./contact.html">Contact</a>
            <a href="./gallery.html">Gallery</a>
        </nav>
    
        <main id="contact">
    `;
    
    let htmlBottom = `
            </main>

            <footer>
                <p>© 2023 E. Alex McIntire</p>
            </footer>

        </body>
        </html>
    `;

    let responseMessage = `
    <h2>Thank you for your submission, ${name}!</h2>
    <p class="contactReply" id="replyEmail">Email: ${email}</p>
    <p class="contactReply" id="replySubject">Subject: ${subject}</p>
    <p class="contactReply" id="replyMessage">Message: ${message}</p>
    <p class="contactReply" id="replyJobPosition">Your job/position: ${userRoleLabel}</p>
    <p class="contactReply" id="replySeeMoreOf">You'd like to see more of: ${checkboxes} (Selected)</p>
    <p class="contactReply" id="replyContactSource">How you found me: ${contactSourceLabel}</p>
    <p class="contactReply">Thank you for your submission!</p>
    <p>THIS IS THE BODY:<br> ${JSON.stringify(req.body)}</p>
    `;

    // Nodemailer setup
// Generate SMTP service account from ethereal.email
nodemailer.createTestAccount((err, account) => {
    if (err) {
        console.error('Failed to create a testing account. ' + err.message);
        return process.exit(1);
    }

    console.log('Credentials obtained, sending message...');

    // Create a SMTP transporter object
    let transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
            user: account.user,
            pass: account.pass
        }
    });

    // Message object
    let nodeMailMessage = {
        from: 'mcintiel@oregonstate.edu',
        to: `${email}`,
        subject: `${subject}`,
        text: `${message}`,
        html: `
            <h2>Thank you for your submission, ${name}!</h2>
            <p class="contactReply" id="replyEmail">Email: ${email}</p>
            <p class="contactReply" id="replySubject">Subject: ${subject}</p>
            <p class="contactReply" id="replyMessage">Message: ${message}</p>
            <p class="contactReply" id="replyJobPosition">Your job/position: ${userRoleLabel}</p>
            <p class="contactReply" id="replySeeMoreOf">You'd like to see more of: ${checkboxes} (Selected)</p>
            <p class="contactReply" id="replyContactSource">How you found me: ${contactSourceLabel}</p>
            <p class="contactReply">Thank you for your submission!</p>
        `
    };

    transporter.sendMail(nodeMailMessage, (err, info) => {
        if (err) {
            console.log('Error occurred. ' + err.nodeMailMessage);
            return process.exit(1);
        }

        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    });
});
    // end Nodemailer setup



    res.send(`${htmlTop}${responseMessage}${htmlBottom}`);
});


app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
