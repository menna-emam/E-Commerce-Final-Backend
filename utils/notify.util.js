const Notification = require('../model/notification.model');
const logger = require('./logger.util');
exports.notifyAdmin = async(type,message,refId) =>{
  try{
    await Notification.create({ type, message, refId });
  }catch (err){
    logger.error(`failed to create notification: ${err.message}`);
  }
};