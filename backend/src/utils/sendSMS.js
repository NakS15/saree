const twilio = require('twilio');
const logger = require('../config/logger');

const client = process.env.TWILIO_ACCOUNT_SID
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const sendSMS = async ({ to, message }) => {
  if (!client) {
    logger.warn('Twilio not configured — SMS skipped');
    return;
  }
  const phone = to.startsWith('+') ? to : `+91${to}`;
  await client.messages.create({ body: message, from: process.env.TWILIO_PHONE_NUMBER, to: phone });
  logger.info(`SMS sent to ${phone}`);
};

module.exports = sendSMS;
