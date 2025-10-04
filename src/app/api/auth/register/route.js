// app/api/auth/register/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";
import jwt from "jsonwebtoken";

export async function POST(request) {
  await connectDB();
  const body = await request.json();
  const { name, email, password, phone } = body;

  if (!name || !email || !password)
    return NextResponse.json(
      { success: false, message: "Missing fields" },
      { status: 400 }
    );

  const exists = await User.findOne({ email });
  if (exists)
    return NextResponse.json(
      { success: false, message: "User exists" },
      { status: 400 }
    );

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: "customer",
    isVerified: true,
  });
  const token = jwt.sign(
    { id: user._id, role: "customer" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  return NextResponse.json({
    success: true,
    user: {
      name: user.name,
      email: user.email,
      _id: user._id,
      phone,
      role: "customer",
    },
    token,
  });
}
