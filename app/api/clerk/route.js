import connectDB from "@/config/db";
import User from "@/model/User";
import { headers } from "next/headers";
import {  NextRequest } from "next/server";
import { Webhook } from "svix";


export async function POST(req){
    const wh = new Webhook(process.env.SIGHNING_SECRET)
    const headerPayload = await headers()
    const svixHeaders = {
        "svix-id" : headerPayload.get("svix-id"),
        "svix-timestamp" : headerPayload.get("svix-timestamp"),
        "svix-signature" : headerPayload.get("svix-signature"),
    }

    // get the payload and varify

    const payload = await req.json();
    const body = JSON.stringify(payload)
    const {data, type} = wh.verify(body,svixHeaders)

    console.log("🔍 Verified Clerk Event Type:", type);
console.log("📦 Verified Clerk Data:", data);

    // prepare the user data to be saved inthe database


    const userData  = {
        _id:data?.id,
        email: data.email_addresses?.[0]?.email_address || "noemail@example.com",
        name:`${data?.first_name} ${data?.last_name}`,
        image:data?.image_url
    }

    console.log("🧾 Prepared User Data:", userData);


    await connectDB()

    switch (type) {
        case 'user.created':
            await User.create(userData)
            break;

        case 'user.updated':
            await User.findByIdAndUpdate(data.id, userData)
            break;
        
        case 'user.deleted':
            await User.findByIdAndDelete(data.id)
            break;       
    
        default:
            break;
    }

    return NextRequest.json({message:"Event recieved"})
}