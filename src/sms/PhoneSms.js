require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN; 
const sendSms = async(phone, messagess) => {
  const client = require('twilio')(accountSid, authToken); 
  await client.messages
    .create({
       body: messagess,
       from: process.env.TWILIO_AUTH_PHONE,
       to: `+91 ${phone}`
     }) 
  return true;
}

module.exports = sendSms;