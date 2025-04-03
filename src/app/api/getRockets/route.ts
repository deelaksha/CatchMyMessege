import { NextResponse } from "next/server";
import { db } from "../../lib/firebase";
import { ref, get } from "firebase/database";

export async function GET() {
  try {
    const snapshot = await get(ref(db, "rockets"));
    if (!snapshot.exists()) {
      return NextResponse.json({ rockets: [] }, { status: 200 });
    }

    const rockets = Object.entries(snapshot.val()).map(([id, data]: any) => ({
      id,
      ...data,
    }));

    return NextResponse.json({ rockets }, { status: 200 });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: "Failed to fetch rockets" }, { status: 500 });
  }
}
