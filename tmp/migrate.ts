import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');

function migrateFile(filename: string) {
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) return;

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const migrated = data.map((item: any) => {
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

// Migrate locations too
function migrateLocations() {
  const filePath = path.join(dataDir, 'locations.json');
  if (!fs.existsSync(filePath)) return;

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const migrated = data.map((loc: any) => ({
    ...loc,
    groups: loc.groups.map((grp: any) => ({
      ...grp,
      level: 'secondary',
      gradeNumber: 1 // Default existing groups to secondary 1
    }))
  }));

  fs.writeFileSync(filePath, JSON.stringify(migrated, null, 2));
  console.log(`Migrated locations.json`);
}

migrateFile('students.json');
migrateFile('lessons.json');
migrateFile('subscriptions.json'); // Might have grade too? Let's check
migrateLocations();
