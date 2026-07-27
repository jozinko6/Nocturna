import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = await createServiceClient();

  const userId = session.metadata?.user_id;
  if (!userId) {
    console.error("No user_id in session metadata");
    return;
  }

  const existing = await supabase
    .from("payment_events")
    .select("id")
    .eq("stripe_session_id", session.id)
    .single();

  if (existing.data) {
    console.log("Already processed session:", session.id);
    return;
  }

  const amountTotal = session.amount_total ?? 0;
  const currency = session.currency ?? "eur";

  await supabase.from("payment_events").insert({
    user_id: userId,
    event_type: "checkout_completed",
    stripe_session_id: session.id,
    amount: amountTotal / 100,
    currency,
    package_id: session.metadata?.package_id || null,
    created_at: new Date().toISOString(),
  });

  const { data: character } = await supabase
    .from("characters")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (!character) {
    console.error("No character found for user:", userId);
    return;
  }

  const packageId = session.metadata?.package_id;
  const crystalMap: Record<string, number> = {
    crystal_pack_small: 50,
    crystal_pack_medium: 130,
    crystal_pack_large: 280,
    crystal_pack_xlarge: 575,
  };

  const crystals = crystalMap[packageId || ""] || 0;
  if (crystals > 0) {
    const { data: resources } = await supabase
      .from("character_resources")
      .select("crystals")
      .eq("character_id", character.id)
      .single();

    if (resources) {
      await supabase
        .from("character_resources")
        .update({
          crystals: resources.crystals + crystals,
          updated_at: new Date().toISOString(),
        })
        .eq("character_id", character.id);

      await supabase.from("economy_ledger").insert({
        character_id: character.id,
        type: "income",
        category: "crystal_purchase",
        amount: crystals,
        description: `Purchased ${crystals} crystals`,
        created_at: new Date().toISOString(),
      });
    }
  }

  console.log("Checkout completed:", session.id, "crystals:", crystals);
}

async function handleSubscriptionEvent(
  event: Stripe.Event,
  eventType: string
) {
  const subscription = event.data.object as Stripe.Subscription;
  const supabase = await createServiceClient();

  const userId = subscription.metadata?.user_id;
  if (!userId) {
    console.error("No user_id in subscription metadata");
    return;
  }

  const statusMap: Record<string, string> = {
    "customer.subscription.created": "active",
    "customer.subscription.updated": subscription.status === "active" ? "active" : "cancelled",
    "customer.subscription.deleted": "cancelled",
  };

  const status = statusMap[eventType] || "unknown";

  const { data: existing } = await supabase
    .from("memberships")
    .select("id")
    .eq("user_id", userId)
    .eq("stripe_subscription_id", subscription.id)
    .single();

  if (existing) {
    await supabase
      .from("memberships")
      .update({
        status,
        current_period_end: new Date(
          subscription.items.data[0].current_period_end * 1000
        ).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("memberships").insert({
      user_id: userId,
      stripe_subscription_id: subscription.id,
      status,
      plan_id: "monthly",
      current_period_end: new Date(
        subscription.items.data[0].current_period_end * 1000
      ).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  console.log("Subscription event:", eventType, "user:", userId);
}

async function createServiceClient() {
  const { createClient } = await import("@/lib/supabase/server");
  return createClient();
}

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionEvent(event, event.type);
        break;
      default:
        console.log("Unhandled event type:", event.type);
    }
  } catch (err) {
    console.error("Error processing webhook:", event.type, err);
    return NextResponse.json({ error: "Processing error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
