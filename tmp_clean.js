const fs = require('fs');
const path = require('path');

const dataDir = path.join(process.cwd(), 'data');
const files = ['students.json', 'subscriptions.json', 'attendance.json', 'quiz_results.json'];

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

files.forEach(file => {
  const filePath = path.join(dataDir, file);
  fs.writeFileSync(filePath, JSON.stringify([], null, 2));
  console.log(`Cleared ${file}`);
});
