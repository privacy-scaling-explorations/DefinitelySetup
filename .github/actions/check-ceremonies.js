const fs = require('fs');
const path = require('path');

const ceremoniesPath = path.join(__dirname, '..', '..', 'ceremonies');

fs.readdir(ceremoniesPath, (err, folders) => {
  if (err) {
    console.error('Failed to list ceremonies:', err);
    process.exit(1);
  }

  folders.forEach(folder => {
    const configPath = path.join(ceremoniesPath, folder, 'p0tionConfig.json');

    fs.readFile(configPath, 'utf-8', (err, data) => {
      if (err) {
        console.error(`Failed to read p0tionConfig.json for ceremony "${folder}":`, err);
        return;
      }

      console.log(`p0tionConfig.json for ceremony "${folder}":\n`, data);
      //TODO: call CLI or page devs
    });
  });
});
