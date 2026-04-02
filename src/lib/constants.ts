export type SchoolLevel = 'primary' | 'preparatory' | 'secondary';

export interface GradeConfig {
  number: number;
  label: string; // e.g. "الأول"
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
      { number: 1, label: 'الأول' },
      { number: 2, label: 'الثاني' },
      { number: 3, label: 'الثالث' },
      { number: 4, label: 'الرابع' },
      { number: 5, label: 'الخامس' },
      { number: 6, label: 'السادس' },
    ]
  },
  {
    id: 'preparatory',
    name: 'Preparatory',
    nameAr: 'الإعدادي',
    grades: [
      { number: 1, label: 'الأول' },
      { number: 2, label: 'الثاني' },
      { number: 3, label: 'الثالث' },
    ]
  },
  {
    id: 'secondary',
    name: 'Secondary',
    nameAr: 'الثانوي',
    grades: [
      { number: 1, label: 'الأول' },
      { number: 2, label: 'الثاني' },
      { number: 3, label: 'الثالث' },
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
