import { NextResponse } from "next/server";
import { db } from "../../lib/firebase";
import { ref, push } from "firebase/database";

export async function POST(req: Request) {
  try {
    const { title, message, latitude, longitude } = await req.json();

    if (!title || !message || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const rocketRef = ref(db, "rockets");
    const newRocket = await push(rocketRef, { title, message, latitude, longitude });

    return NextResponse.json({ id: newRocket.key, message: "Rocket added successfully!" }, { status: 200 });
  } catch (error) {
    console.error("Error adding data:", error);
    return NextResponse.json({ error: "Failed to add rocket" }, { status: 500 });
  }
}
