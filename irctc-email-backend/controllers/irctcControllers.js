// const irctc=require('../Models/IRCTCMailModel');

const irctcModel=require('../models/irctcModel');
const common=require('../helpers/common')
const imaps = require('imap-simple');
const { htmlToText } = require('html-to-text');
const irctcServices=require('../services/irctcServices');


exports.getAllEmailData=async (req, res) => {
    try {
        const config=await common.getImapConfiguration();
        const connection = await imaps.connect(config);
        await connection.openBox('INBOX');

        const searchCriteria = [['FROM','mohanpatro982@gmail.com'],'UNSEEN'];  // Add 'UNSEEN' to search only unread emails
        const fetchOptions = { bodies: ['HEADER', 'TEXT'], markSeen: true, limit: 100 };  // Keep markSeen as false to prevent marking them as read
        const results = await connection.search(searchCriteria, fetchOptions);

        let emailData = [];

        for (const item of results) {
            const textPart = item.parts.find(part => part.which === 'TEXT');
            const headerPart = item.parts.find(part => part.which === 'HEADER');

            if (!textPart || !headerPart) {
                continue;
            }

            const mailBody = textPart.body; 
            const textBody = htmlToText(mailBody, {
                wordwrap: 130,
                ignoreImage: true,
                ignoreHref: true
            });

            const subject = headerPart.body.subject?.[0];
            if (!subject) {
                continue;
            }

            const classification =await  common.classifyEmail(subject);
            if(classification !='Unknown')
            {
                const ticketInfo =await common.extractTicketInfo(textBody, classification);
                if(classification=='CancelTicket' && ticketInfo['PNR No'])
                {
                    await irctcServices.updateTicketToCanceL("Cancelled",ticketInfo["PNR No"],ticketInfo["Refund Amount"])
                }
                if(ticketInfo['Status']=='Refund' && ticketInfo['PNR No'])
                {
                    await irctcServices.updateTicketToCanceL("Refund Success",ticketInfo["PNR No"],ticketInfo["Refund Amount"])
                }
                if(classification=="Booking Confirmation" && ticketInfo['PNR No']){
                    if(ticketInfo)
                    {
                        const data=await irctcModel.findOne({ "PNR No": ticketInfo["PNR No"] })
                        if(!data)
                        {
                            const newData=new irctcModel({
                                ...ticketInfo
                            })
                            await newData.save();
                        }
                       
                    }
                    else{
                        console.log("email already read");
                    }
                }
                emailData.push({ subject, classification, ticketInfo });
            }
          
        }
        connection.end();
        res.json(emailData);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error reading emails');
    }
}






exports.getAllExisedData=async (req,res)=>{
    try{

        console.log("hello i am at the api");
        const data=await irctcModel.find();
        console.log(data);
        return res.send(data);

    }
    catch(error){
        console.log(error);
        // return await common.error2(error);
        res.send(error);    
    }
}