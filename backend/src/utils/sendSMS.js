const twilio = require('twilio');
const logger = require('../config/logger');
const ErrorResponse = require('./errorResponse');

const client = process.env.TWILIO_ACCOUNT_SID && !/^REPLACE_WITH/.test(process.env.TWILIO_ACCOUNT_SID)
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const sendSMS = async ({ to, message }) => {
  if (!client) throw new ErrorResponse('SMS service is not available right now', 503);
  const phone = to.startsWith('+') ? to : `+91${to}`;
  try {
    await client.messages.create({ body: message, from: process.env.TWILIO_PHONE_NUMBER, to: phone });
  } catch (err) {
    logger.error(`SMS failed to ${phone}: ${err.message}`);
    throw new ErrorResponse('Could not send the SMS. Please try again.', 502);
  }
  logger.info(`SMS sent to ${phone}`);
};

module.exports = sendSMS;
