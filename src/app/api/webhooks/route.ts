import { Webhook } from "svix";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { clerkClient, WebhookEvent } from "@clerk/nextjs/server"; // Correct import
import { Role, User } from "@prisma/client";

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error("Error: Please add SIGNING_SECRET to .env.local");
  }

  const wh = new Webhook(SIGNING_SECRET);

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", { status: 400 });
  }

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

  if (eventType === "user.created" || eventType === "user.updated") {
    const data = JSON.parse(body).data;

    // Fetch existing user from DB
    const existingUser = await db.user.findUnique({
      where: { id: data.id },
    });

    // Get Clerk client instance
    const clerk = await clerkClient();

    // Fetch Clerk user
    let clerkUser;
    try {
      clerkUser = await clerk.users.getUser(data.id);
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        (error as { status?: number }).status === 404
      ) {
        console.warn(
          "User not found in Clerk, skipping metadata update for:",
          data.id
        );
        return new Response("User not found, skipping metadata update", {
          status: 200,
        });
      }
      throw error;
    }

    // Ensure role exists in Clerk metadata (default to USER if missing)
    let clerkRole = clerkUser.privateMetadata?.role as Role | undefined;
    if (!clerkRole) {
      clerkRole = "USER";
      await clerk.users.updateUserMetadata(data.id, {
        privateMetadata: { role: "USER" },
      });
      console.log("Set default role USER in Clerk for:", data.id);
    }

    // Construct updated user data
    const updatedUser: Partial<User> = {
      id: data.id,
      name: `${data.first_name} ${data.last_name}`,
      email: data.email_addresses[0]?.email_address,
      picture: data.image_url,
      role: clerkRole as Role, // Sync role from Clerk
    };

    // Check if the user changed before updating the DB
    if (
      existingUser &&
      existingUser.name === updatedUser.name &&
      existingUser.email === updatedUser.email &&
      existingUser.picture === updatedUser.picture &&
      existingUser.role === updatedUser.role
    ) {
      console.log(
        "No changes detected, skipping DB update for:",
        updatedUser.id
      );
    } else {
      // Update or insert the user in DB
      await db.user.upsert({
        where: { id: updatedUser.id },
        update: updatedUser,
        create: {
          id: updatedUser.id!,
          name: updatedUser.name!,
          email: updatedUser.email!,
          picture: updatedUser.picture!,
          role: updatedUser.role!,
        },
      });

      console.log("User updated in database:", updatedUser.id);
    }
  }

  if (eventType === "user.deleted") {
    const data = JSON.parse(body).data;
    const userId = data.id;

    try {
      // Delete user from DB
      await db.user.delete({ where: { id: userId } });
      console.log("Deleted user from DB:", userId);
    } catch (err) {
      console.error("Error deleting user from DB or Clerk:", err);
      return new Response("Error deleting user from DB or Clerk", {
        status: 500,
      });
    }
  }

  return new Response("Webhook received", { status: 200 });
}
