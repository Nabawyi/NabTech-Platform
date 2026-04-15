
import { createClient } from "./src/lib/supabase/server.ts";

async function checkTables() {
    const supabase = await createClient();
    
    console.log("Checking quizzes table...");
    const { data: q, error: qe } = await supabase.from('quizzes').select('id').limit(1);
    console.log("Quizzes:", { data: q, error: qe });

    console.log("Checking quiz_attempts table...");
    const { data: qa, error: qae } = await supabase.from('quiz_attempts').select('id').limit(1);
    console.log("Quiz Attempts:", { data: qa, error: qae });

    console.log("Checking exams table...");
    const { data: e, error: ee } = await supabase.from('exams').select('id').limit(1);
    console.log("Exams:", { data: e, error: ee });
}

checkTables();
