// app/api/seller/integrations/amazon/connect/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";
import jwt from "jsonwebtoken";
import { encryptData, getLastChars } from "@/lib/security/encryption";

/**
 * Connect Amazon Seller Central using SP-API credentials
 * Requires: Seller ID, AWS Access Key, AWS Secret Key, Refresh Token, Region
 */
export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const body = await request.json();
    const {
      sellerId,
      awsAccessKey,
      awsSecretKey,
      refreshToken,
      region,
      marketplaceId,
    } = body;

    // Validate input
    if (
      !sellerId ||
      !awsAccessKey ||
      !awsSecretKey ||
      !refreshToken ||
      !region
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "All fields are required: Seller ID, AWS Access Key, AWS Secret Key, Refresh Token, and Region",
        },
        { status: 400 }
      );
    }

    // Validate region
    const validRegions = [
      "us-east-1",
      "eu-west-1",
      "us-west-2",
      "ap-northeast-1",
    ];
    if (!validRegions.includes(region)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid region. Must be one of: us-east-1, eu-west-1, us-west-2, ap-northeast-1",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if another seller already connected this Amazon account
    const existingConnection = await User.findOne({
      _id: { $ne: decoded.userId },
      "amazonIntegration.sellerId": sellerId,
      "amazonIntegration.isConnected": true,
    });

    if (existingConnection) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This Amazon Seller account is already connected to another user",
        },
        { status: 409 }
      );
    }

    // Encrypt the credentials using seller ID as salt
    const {
      encrypted: encryptedAccessKey,
      iv: accessKeyIV,
      authTag: accessKeyAuthTag,
    } = encryptData(awsAccessKey, decoded.userId + "_aws_access");
    const {
      encrypted: encryptedSecretKey,
      iv: secretKeyIV,
      authTag: secretKeyAuthTag,
    } = encryptData(awsSecretKey, decoded.userId + "_aws_secret");
    const {
      encrypted: encryptedRefreshToken,
      iv: refreshTokenIV,
      authTag: refreshTokenAuthTag,
    } = encryptData(refreshToken, decoded.userId + "_refresh");

    // Update seller with encrypted credentials
    await User.findByIdAndUpdate(decoded.userId, {
      "amazonIntegration.isConnected": true,
      "amazonIntegration.sellerId": sellerId,
      "amazonIntegration.region": region,
      "amazonIntegration.marketplaceId": marketplaceId || "ATVPDKIKX0DER", // Default to US

      // Encrypted credentials
      "amazonIntegration.encryptedAccessKey": encryptedAccessKey,
      "amazonIntegration.accessKeyIV": accessKeyIV,
      "amazonIntegration.accessKeyAuthTag": accessKeyAuthTag,

      "amazonIntegration.encryptedSecretKey": encryptedSecretKey,
      "amazonIntegration.secretKeyIV": secretKeyIV,
      "amazonIntegration.secretKeyAuthTag": secretKeyAuthTag,

      "amazonIntegration.encryptedRefreshToken": encryptedRefreshToken,
      "amazonIntegration.refreshTokenIV": refreshTokenIV,
      "amazonIntegration.refreshTokenAuthTag": refreshTokenAuthTag,

      "amazonIntegration.accessKeyLastFour": getLastChars(awsAccessKey, 4),
      "amazonIntegration.tokenCreatedAt": new Date(),
      "amazonIntegration.tokenLastValidated": new Date(),
      "amazonIntegration.isTokenValid": true,
      "amazonIntegration.failedAttempts": 0,

      "amazonIntegration.syncSettings": {
        autoSyncProducts: true,
        autoSyncInventory: true,
        autoSyncOrders: false,
        syncInterval: "daily",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Amazon Seller Central connected successfully",
      sellerInfo: {
        sellerId,
        region,
        marketplaceId: marketplaceId || "ATVPDKIKX0DER",
      },
    });
  } catch (error) {
    console.error("Amazon connect error:", error);

    if (error.name === "JsonWebTokenError") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid authentication token",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to connect Amazon Seller Central. Please try again.",
      },
      { status: 500 }
    );
  }
}
