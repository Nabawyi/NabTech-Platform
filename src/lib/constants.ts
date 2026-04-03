export type SchoolLevel = 'primary' | 'preparatory' | 'secondary';

export interface GradeConfig {
  number: number;
  label: string; // e.g. "الأول"
  code: string;  // e.g. "pri_1"
}

export interface EducationLevel {
  id: SchoolLevel;
  name: string;
  nameAr: string;
  grades: GradeConfig[];
}

export const EDUCATION_LEVELS: EducationLevel[] = [
  {
    id: 'primary',
    name: 'Primary',
    nameAr: 'الابتدائي',
    grades: [
      { number: 1, label: 'الأول', code: 'pri_1' },
      { number: 2, label: 'الثاني', code: 'pri_2' },
      { number: 3, label: 'الثالث', code: 'pri_3' },
      { number: 4, label: 'الرابع', code: 'pri_4' },
      { number: 5, label: 'الخامس', code: 'pri_5' },
      { number: 6, label: 'السادس', code: 'pri_6' },
    ]
  },
  {
    id: 'preparatory',
    name: 'Preparatory',
    nameAr: 'الإعدادي',
    grades: [
      { number: 1, label: 'الأول', code: 'pre_1' },
      { number: 2, label: 'الثاني', code: 'pre_2' },
      { number: 3, label: 'الثالث', code: 'pre_3' },
    ]
  },
  {
    id: 'secondary',
    name: 'Secondary',
    nameAr: 'الثانوي',
    grades: [
      { number: 1, label: 'الأول', code: 'sec_1' },
      { number: 2, label: 'الثاني', code: 'sec_2' },
      { number: 3, label: 'الثالث', code: 'sec_3' },
    ]
  }
];

export function getGradeLabel(levelId: SchoolLevel, gradeNumber: number): string {
  const level = EDUCATION_LEVELS.find(l => l.id === levelId);
  const grade = level?.grades.find(g => g.number === gradeNumber);
  if (!level || !grade) return 'غير محدد';
  return `الصف ${grade.label} ${level.nameAr}`;
}

export function formatGradeShort(levelId: SchoolLevel, gradeNumber: number): string {
  const level = EDUCATION_LEVELS.find(l => l.id === levelId);
  if (!level) return '---';
  const prefix = level.id === 'primary' ? 'ابتدائي' : level.id === 'preparatory' ? 'إعدادي' : 'ثانوي';
  return `${gradeNumber} ${prefix}`;
}

export function getGradeCode(levelId: SchoolLevel, gradeNumber: number): string {
  const level = EDUCATION_LEVELS.find(l => l.id === levelId);
  const grade = level?.grades.find(g => g.number === gradeNumber);
  return grade?.code || `${levelId === 'primary' ? 'pri' : levelId === 'preparatory' ? 'pre' : 'sec'}_${gradeNumber}`;
}

