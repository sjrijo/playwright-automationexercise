const fs = require('fs');
const path = require('path');

const STORAGE_DIR = path.resolve(__dirname, '..', '.auth');

/** storageState file for the shared logged-in user of a browser project. */
const authFile = (projectName) => path.join(STORAGE_DIR, `${projectName}.json`);

/** Credentials/profile of the shared user of a browser project. */
const userFile = (projectName) => path.join(STORAGE_DIR, `${projectName}.user.json`);

function saveSharedUser(projectName, user) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
  fs.writeFileSync(userFile(projectName), JSON.stringify(user, null, 2));
}

function readSharedUser(projectName) {
  const file = userFile(projectName);
  if (!fs.existsSync(file)) {
    throw new Error(`No shared user for project "${projectName}". Did the "setup" project run?`);
  }
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

module.exports = { STORAGE_DIR, authFile, userFile, saveSharedUser, readSharedUser };
