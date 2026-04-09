import { getLessonsByLevelAndGrade } from "@/app/actions/lessons";
import { getUserSession } from "@/app/actions/students";
import { getGradeLabel } from "@/lib/constants";
import { redirect } from "next/navigation";
import LessonsGrid from "./LessonsGrid";

export default async function StudentLessonsPage() {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const studentLevel = session.stage ?? session.level ?? "secondary";
  const studentGradeNum = session.gradeNumber ?? 1;
  const gradeLabel = getGradeLabel(studentLevel as any, studentGradeNum as any);
  
  let lessons: any[] = [];
  try {
    lessons = await getLessonsByLevelAndGrade(studentLevel as any, studentGradeNum as any);
  } catch (error: any) {
    if (error.message === "Unauthorized") redirect("/login");
  }

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 pb-20 px-4">
      <LessonsGrid initialLessons={lessons} gradeLabel={gradeLabel} />
    </div>
  );
}
