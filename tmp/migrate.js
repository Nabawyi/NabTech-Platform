const fs = require('fs');
const path = require('path');

const dataDir = path.join(process.cwd(), 'data');

function migrateFile(filename) {
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) {
    console.log(`${filename} not found`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const migrated = data.map((item) => {
    // Already migrated?
    if (item.level && item.gradeNumber) return item;

    const grade = item.grade || '';
    let level = 'secondary';
    let gradeNumber = 1;

    if (grade.includes("الأول")) gradeNumber = 1;
    else if (grade.includes("الثاني")) gradeNumber = 2;
    else if (grade.includes("الثالث")) gradeNumber = 3;

    return {
      ...item,
      level,
      gradeNumber
    };
  });

  fs.writeFileSync(filePath, JSON.stringify(migrated, null, 2));
  console.log(`Migrated ${filename}`);
}

function migrateLocations() {
  const filePath = path.join(dataDir, 'locations.json');
  if (!fs.existsSync(filePath)) return;

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const migrated = data.map((loc) => ({
    ...loc,
    groups: loc.groups.map((grp) => ({
      ...grp,
      level: 'secondary',
      gradeNumber: 1
    }))
  }));

  fs.writeFileSync(filePath, JSON.stringify(migrated, null, 2));
  console.log(`Migrated locations.json`);
}

migrateFile('students.json');
migrateFile('lessons.json');
migrateFile('subscriptions.json');
migrateLocations();
