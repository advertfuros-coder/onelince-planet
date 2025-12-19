// app/api/ai/generate-description/route.js
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/utils/auth";
import {
  generateProductDescription,
  enhanceProductTitle,
  generateFromImages,
  translateDescription,
} from "@/lib/services/aiProductGenerator";

export async function POST(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, data } = body;

    let result;

    switch (action) {
      case "generate_description":
        result = await generateProductDescription(data);
        break;

      case "enhance_title":
        result = await enhanceProductTitle(data.title, data.category);
        break;

      case "from_images":
        result = await generateFromImages(data.images);
        break;

      case "translate":
        result = await translateDescription(data.description, data.language);
        break;

      default:
        return NextResponse.json(
          { success: false, message: "Invalid action" },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI Generate Description Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
