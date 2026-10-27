const {  createBackup,listBackups,restoreBackup,
} = require('../service/databases.service');
const logger = require('../utils/logger.util');
exports.createBackup = async (req, res) => {
  const folderName = await createBackup();
  logger.info(`backup created: ${folderName} | admin: ${req.user.email}`);
  res.status(201).json({ message:'backup created',data:{folderName}});
};
exports.getBackups = (req, res) =>{
  res.status(200).json({ message: 'backups list', data: listBackups() });
};
exports.restoreBackup = async (req, res) => {
  const {folderName,drop} = req.body || {};
  await restoreBackup(folderName, drop === true);
  logger.warn(`backup restored: ${folderName} | drop: ${drop === true} | admin: ${req.user.email}`);
  res.status(200).json({ message: 'restore success', drop: drop === true });
};