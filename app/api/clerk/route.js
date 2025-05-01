import connectDB from "@/config/db";
import User from "@/model/User";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

export async function POST(req) {
  const wh = new Webhook(process.env.SIGNING_SECRET); // make sure env var is correct
  const headerPayload = headers(); // ✅ no await
  const svixHeaders = {
    "svix-id": headerPayload.get("svix-id"),
    "svix-timestamp": headerPayload.get("svix-timestamp"),
    "svix-signature": headerPayload.get("svix-signature"),
  };

  const payload = await req.json();
  const body = JSON.stringify(payload);

  let event;
  try {
    event = wh.verify(body, svixHeaders);
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, type } = event;

  const userData = {
    _id: data.id,
    email: data?.email_addresses?.[0]?.email_address || "no-email",
    name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
    image: data.image_url || ""
  };

  await connectDB();

  try {
    switch (type) {
      case "user.created":
        await User.create(userData);
        break;
      case "user.updated":
        await User.findByIdAndUpdate(data.id, userData);
        break;
      case "user.deleted":
        await User.findByIdAndDelete(data.id);
        break;
      default:
        break;
    }
  } catch (dbErr) {
    console.error("DB operation failed:", dbErr);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json({ message: "Event received" }); // ✅ correct response
}
