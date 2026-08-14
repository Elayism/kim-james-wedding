import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const expectedPassword = process.env.DASHBOARD_PASSWORD || "wedding2027";

    if (!password || password !== expectedPassword) {
      return NextResponse.json(
        { success: false, message: "Incorrect password" },
        { status: 401 }
      );
    }

    // Password matches — set HTTP-only authentication cookie
    const response = NextResponse.json({ success: true });
    
    // Set dashboard_auth cookie
    (await cookies()).set({
      name: "dashboard_auth",
      value: "true",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    console.error("Dashboard auth error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
