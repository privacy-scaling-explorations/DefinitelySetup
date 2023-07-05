const fs = require('fs');
const path = require('path');

const ceremoniesPath = path.join(__dirname, '..', '..', 'ceremonies');

fs.readdir(ceremoniesPath, (err, folders) => {
  if (err) {
    console.error('Failed to list ceremonies:', err);
    process.exit(1);
  }

  folders.forEach(folder => {
    const configPath = path.join(ceremoniesPath, folder, 'config.json');

    fs.readFile(configPath, 'utf-8', (err, data) => {
      if (err) {
        console.error(`Failed to read config.json for ceremony "${folder}":`, err);
        return;
      }

      console.log(`config.json for ceremony "${folder}":\n`, data);
      //TODO: call CLI or page devs
    });
  });
});
