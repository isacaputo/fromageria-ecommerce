import { Webhook } from "svix";
import { headers } from "next/headers";
import { clerkClient, WebhookEvent } from "@clerk/clerk-sdk-node";
import { User } from "@prisma/client";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error(
      "Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Create Svix webhook instance
  const wh = new Webhook(SIGNING_SECRET);

  // Get request headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", { status: 400 });
  }

  // Get and verify webhook payload
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new Response("Error: Verification error", { status: 400 });
  }

  const eventType = evt.type;
  console.log("Received event type:", eventType);

  // Handle user creation and update events
  if (eventType === "user.created" || eventType === "user.updated") {
    console.log("event type", eventType);
    const data = JSON.parse(body).data;

    // Check if user exists in Clerk before proceeding
    try {
      const existingUser = await clerkClient.users.getUser(data.id);
      if (!existingUser) {
        console.warn(
          "Skipping user.updated: User not found in Clerk, likely deleted:",
          data.id
        );
        return new Response("User not found in Clerk, skipping update.", {
          status: 200,
        });
      }
    } catch (err) {
      console.warn(
        "Skipping user.updated: Clerk user lookup failed (probably deleted):",
        data.id
      );
      return new Response("User not found in Clerk, skipping update.", {
        status: 200,
      });
    }

    // Construct user data
    const user: Partial<User> = {
      id: data.id,
      name: `${data.first_name} ${data.last_name}`,
      email: data.email_addresses[0].email_address,
      picture: data.image_url,
    };

    if (!user) return;

    // Upsert user in database
    const dbUser = await db.user.upsert({
      where: { email: user.email },
      update: user,
      create: {
        id: user.id!,
        name: user.name!,
        email: user.email!,
        picture: user.picture!,
        role: user.role || "USER",
      },
    });

    // Update user's metadata in Clerk
    await clerkClient.users.updateUserMetadata(data.id, {
      privateMetadata: {
        role: dbUser.role || "USER",
      },
    });

    console.log("User updated in database and Clerk:", user.id);
  }

  // Handle user deletion event
  if (eventType === "user.deleted") {
    console.log("event type", eventType);
    const data = JSON.parse(body).data;
    const userId = data.id;

    try {
      await db.user.delete({
        where: { id: userId },
      });
      console.log("Deleted user from DB:", userId);
    } catch (err) {
      console.error("Error deleting user from DB:", err);
      return new Response("Error deleting user from DB", { status: 500 });
    }
  }

  return new Response("Webhook received", { status: 200 });
}
