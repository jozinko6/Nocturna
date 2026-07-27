import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceClient();

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const { error: questResetError } = await supabase
    .from("daily_quest_progress")
    .update({
      current_value: 0,
      completed: false,
      reward_claimed: false,
      date: today,
      updated_at: new Date().toISOString(),
    })
    .eq("date", yesterday);

  if (questResetError) {
    console.error("Quest reset error:", questResetError);
  }

  const { error: attackResetError } = await supabase
    .from("characters")
    .update({
      daily_attack_count: 0,
      daily_attack_reset: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .lte("daily_attack_count", 0);

  if (attackResetError) {
    console.error("Attack reset error:", attackResetError);
  }

  console.log("Daily reset completed:", today);

  return NextResponse.json({
    success: true,
    date: today,
    timestamp: new Date().toISOString(),
  });
}

async function createServiceClient() {
  const { createClient } = await import("@/lib/supabase/server");
  return createClient();
}
