const {execFile} = require('child_process');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/appError.util');
const logger = require('../utils/logger.util');
const BACKUPS_DIR = path.join(__dirname, '..', 'backups');
const FOLDER_PATTERN = /^backup-[\w-]+$/;
const run = (command, args) =>
  new Promise((resolve, reject) => {
    execFile(command,args, (error, stdout,stderr) =>{
      if (error) {
        logger.error(`${command} failed: ${stderr || error.message}`);
        if (error.code === 'ENOENT') {
          return reject(new AppError(`${command} is not installed on the server`, 500));
        }
        return reject(new AppError(`${command} failed, check the server logs`, 500));
      }
      resolve(stdout);
    });
  });
exports.createBackup = async() =>{
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const folderName = `backup-${timestamp}`;
  const folderPath = path.join(BACKUPS_DIR, folderName);
  fs.mkdirSync(folderPath, {recursive:true});
  await run('mongodump', [
    `--uri=${process.env.DATABASE_URI}`,
    `--out=${folderPath}`,
    '--gzip',
  ]);
  return folderName;
};
exports.listBackups =()=>{
  if (!fs.existsSync(BACKUPS_DIR)) return [];
  return fs
    .readdirSync(BACKUPS_DIR)
    .filter((name) => FOLDER_PATTERN.test(name))
    .sort()
    .reverse();
};
exports.restoreBackup = async (folderName, drop = false) =>{
  if (typeof folderName !== 'string' || !FOLDER_PATTERN.test(folderName)){
    throw new AppError('invalid backup folder name', 400);
  }
  const backupPath = path.join(BACKUPS_DIR, folderName, process.env.DB_NAME);
  if (!fs.existsSync(backupPath)) {
    throw new AppError('backup not found', 404);
  }
  const args = [`--uri=${process.env.DATABASE_URI}`, '--gzip'];
  if (drop) args.push('--drop'); 
  args.push(backupPath);
  await run('mongorestore', args);
};