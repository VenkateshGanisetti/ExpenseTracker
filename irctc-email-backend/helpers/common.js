const imaps = require('imap-simple');
// const imaps = require('imap-simple');
const { htmlToText } = require('html-to-text');

module.exports={
    async error2(res, message = "Internal Server Error") {
        res.status(402).json({ success: false, data: {}, message });
    },
    

    async getImapConfiguration(){
        const config = {
            imap: {
                user: 'venkyganisetti23ce@gmail.com',
                password: 'gatd ylir hley gmhu',
                host: 'imap.gmail.com',
                port: 993,
                tls: true,
                authTimeout: 3000,
                tlsOptions: { rejectUnauthorized: false }
            }
        }

        return config;
    },
    


    async cleanMailBody(mailBody) {
        return mailBody.replace(/\*+/g, '');
    },

    async extractTicketInfo(mailBody, classification) {
        let ticketInfo = {};


        mailBody = await this.cleanMailBody(mailBody);

        // console.log(mailBody);z  


        if (classification === "CancelTicket") {
            const pnrPattern = /PNR\s*Number\s*:\s*(\d+)/;
            const cancelledDatePattern = /cancelled\s*on\s*:\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/; // Adjust regex as needed
            const refundPattern = /refund amount of\s*Rs\.\s*(\d+\.\d+)/;

            const pnrMatch = mailBody.match(pnrPattern);
            const cancelledDateMatch = mailBody.match(cancelledDatePattern);
            const refundMatch = mailBody.match(refundPattern);

            if (pnrMatch) ticketInfo['PNR No'] = pnrMatch[1];
            if (cancelledDateMatch) ticketInfo['Cancelled Date'] = cancelledDateMatch[1];
            if (refundMatch) ticketInfo['Refund Amount'] = refundMatch[1];

            // Set status to "Cancelled"
            ticketInfo.Status = "Cancelled";
            
        } else if (classification === "Booking Confirmation") {
            const pnrPattern = /PNR No\.?\s*:\s*(\d+)/;
            const datePattern = /Date of Journey\s*:\s*(\d{2}-[A-Za-z]+-\d{4})/;  // Match Date of Journey like 10-Aug-2024
            const sourcePattern = /From\s*:\s*([\w\s]+)\s*\([\w]+\)/;  // Capture Source Station like "SRIKAKULAM ROAD"
            const destinationPattern = /To\s*:\s*([\w\s]+)\s*\([\w]+\)/;  // Capture Destination Station like "RAJAHMUNDRY"
            const trainPattern = /Train No\. \/ Name\s*:\s*(\d{5})\s*\/\s*([\w\s]+)/;  // Capture Train No. and Name
            const farePattern = /Total Fare\s*Rs\.\s*(\d+\.\d+)/;

            // Matching PNR
            const pnrMatch = mailBody.match(pnrPattern);
            if (pnrMatch) ticketInfo['PNR No'] = pnrMatch[1];

            // Matching Date of Journey
            const dateMatch = mailBody.match(datePattern);
            if (dateMatch) ticketInfo['Date of Journey'] = dateMatch[1];

            let dateString=dateMatch[1];
    const currentDate = new Date(); // Get the current date

            const journeyDate = new Date(dateString); // Parse the journey date

            // Matching Source Station (From)
            const sourceMatch = mailBody.match(sourcePattern);
            if (sourceMatch) ticketInfo['Source Station'] = sourceMatch[1].trim();

            // Matching Destination Station (To)
            const destinationMatch = mailBody.match(destinationPattern);
            if (destinationMatch) ticketInfo['Destination Station'] = destinationMatch[1].trim();

            // Matching Train No. and Name
            const trainMatch = mailBody.match(trainPattern);
            if (trainMatch) ticketInfo['Train Name'] = `${trainMatch[1]} / ${trainMatch[2].trim()}`;

            // Matching Total Fare (Amount)
            const fareMatch = mailBody.match(farePattern);
            if (fareMatch) ticketInfo['BookingAmount'] = fareMatch[1];
            ticketInfo.Status = journeyDate < currentDate ? 'Journey Completed' : 'Upcoming Journey'; // Compare dates;

        }   
        else if (classification === "Refund") {
            const pnrPattern = /PNR Number\s*(\d+)/;
            const refundDatePattern = /Date of cancellation of E-Ticket\/Date of failure of E-Ticket booking:\s*(\d{1,2}-\d{1,2}-\d{2,4})/;
            const refundAmountPattern = /Refund amount:\s*(\d+\.\d+)/;

            const pnrMatch = mailBody.match(pnrPattern);
            const refundDateMatch = mailBody.match(refundDatePattern);
            const refundAmountMatch = mailBody.match(refundAmountPattern);

            if (pnrMatch) ticketInfo['PNR No'] = pnrMatch[1];
            if (refundDateMatch) ticketInfo['Cancelled Date'] = refundDateMatch[1]; // Assuming same as refund date
            if (refundAmountMatch) ticketInfo['Refund Amount'] = refundAmountMatch[1];
            
            ticketInfo.Status = "Refund";
        }
        console.log(ticketInfo);
        
        return ticketInfo;
    },

    async    classifyEmail(subject) {
        const subjectLower = subject.toLowerCase();
        if (subjectLower.includes('booking') && subjectLower.includes('confirmation')) {
            return 'Booking Confirmation';
        } else if (subjectLower.includes('cancel')) {
            return 'CancelTicket';
        } else if (subjectLower.includes('refund')) {
            return 'Refund';
        } else {
            return 'Unknown';
        }
    }


}

