import { createAdminClient } from "@/lib/supabase/admin";

async function main() {
  const admin = createAdminClient();
  const { data, error } = await admin.from("teacher_settings").select("*").limit(1);
  console.log("Data:", JSON.stringify(data, null, 2));
  console.log("Error:", error);
}

main();
