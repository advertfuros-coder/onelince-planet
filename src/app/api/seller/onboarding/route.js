import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Seller from "@/lib/db/models/Seller";
import User from "@/lib/db/models/User";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import bcrypt from "bcryptjs";
import emailService from "@/lib/email/emailService";
import { generateSellerWelcomeEmail } from "@/lib/email/templates/sellerWelcome";

export async function POST(request) {
  try {
    await connectDB();

    const formData = await request.formData();

    // Extract text fields
    const email = formData.get("email");
    const phone = formData.get("phone");
    const businessType = formData.get("businessType");
    const fullName = formData.get("fullName");
    const dateOfBirth = formData.get("dateOfBirth");
    const residentialAddress = JSON.parse(
      formData.get("residentialAddress") || "{}"
    );
    const businessName = formData.get("businessName");
    const gstin = formData.get("gstin");
    const pan = formData.get("pan");
    const businessCategory = formData.get("businessCategory");
    const establishedYear = formData.get("establishedYear");
    const bankDetails = JSON.parse(formData.get("bankDetails") || "{}");
    const storeInfo = JSON.parse(formData.get("storeInfo") || "{}");

    // Check if user already exists
    let existingUser = await User.findOne({ email });

    if (existingUser) {
      // Check if seller application already exists
      const existingSeller = await Seller.findOne({ userId: existingUser._id });
      if (existingSeller) {
        return NextResponse.json(
          {
            success: false,
            message: "A seller application already exists for this email",
          },
          { status: 400 }
        );
      }
    }

    // Check if GSTIN already exists
    const existingGstin = await Seller.findOne({ gstin });
    if (existingGstin) {
      return NextResponse.json(
        {
          success: false,
          message: "This GST/TRN number is already registered",
        },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    const uploadsDir = join(
      process.cwd(),
      "public",
      "uploads",
      "seller-documents"
    );
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory already exists
    }

    // Function to save uploaded file
    const saveFile = async (file, prefix) => {
      if (!file) return null;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileName = `${prefix}-${Date.now()}-${file.name.replace(
        /[^a-zA-Z0-9.]/g,
        "_"
      )}`;
      const filepath = join(uploadsDir, fileName);

      await writeFile(filepath, buffer);
      return `/uploads/seller-documents/${fileName}`;
    };

    // Process file uploads
    const documentUrls = {
      governmentId: await saveFile(formData.get("governmentId"), "gov-id"),
      tradeLicense: await saveFile(
        formData.get("tradeLicense"),
        "trade-license"
      ),
      cancelledCheque: await saveFile(
        formData.get("cancelledCheque"),
        "cheque"
      ),
      panCard: await saveFile(formData.get("panCard"), "pan"),
      gstCertificate: await saveFile(formData.get("gstCertificate"), "gst"),
      idProof: await saveFile(formData.get("idProof"), "id-proof"),
      addressProof: await saveFile(
        formData.get("addressProof"),
        "address-proof"
      ),
      bankStatement: await saveFile(
        formData.get("bankStatement"),
        "bank-statement"
      ),
      storeLogo: await saveFile(formData.get("storeLogo"), "logo"),
      storeBanner: await saveFile(formData.get("storeBanner"), "banner"),
    };

    // Create user if doesn't exist
    let userId;
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(phone.slice(-6), 10); // Temporary password

      const newUser = await User.create({
        name: fullName,
        email,
        password: hashedPassword,
        phone,
        role: "seller",
        isVerified: false,
        dateOfBirth,
        address: residentialAddress,
      });

      userId = newUser._id;
    } else {
      userId = existingUser._id;
    }

    // Create seller profile
    const seller = await Seller.create({
      userId,
      businessName,
      gstin,
      pan,
      businessType,
      businessCategory,
      establishedYear: establishedYear ? parseInt(establishedYear) : undefined,

      bankDetails: {
        accountNumber: bankDetails.accountNumber,
        ifscCode: bankDetails.ifscCode,
        accountHolderName: bankDetails.accountHolderName,
        bankName: bankDetails.bankName,
        accountType: bankDetails.accountType || "current",
        branch: bankDetails.branch,
        upiId: bankDetails.upiId,
      },

      pickupAddress: {
        addressLine1: residentialAddress.addressLine1,
        addressLine2: residentialAddress.addressLine2,
        city: residentialAddress.city,
        state: residentialAddress.state,
        pincode: residentialAddress.pincode,
        country: residentialAddress.country || "AE",
      },

      storeInfo: {
        storeName: storeInfo.storeName,
        storeDescription: storeInfo.storeDescription,
        storeLogo: documentUrls.storeLogo,
        storeBanner: documentUrls.storeBanner,
        storeCategories: storeInfo.storeCategories || [],
        website: storeInfo.website,
        customerSupportEmail: storeInfo.customerSupportEmail,
        customerSupportPhone: storeInfo.customerSupportPhone,
        socialMedia: storeInfo.socialMedia || {},
      },

      documents: {
        panCard: {
          url: documentUrls.panCard,
          verified: false,
          uploadedAt: documentUrls.panCard ? new Date() : undefined,
        },
        gstCertificate: {
          url: documentUrls.gstCertificate,
          verified: false,
          uploadedAt: documentUrls.gstCertificate ? new Date() : undefined,
        },
        idProof: {
          url: documentUrls.idProof || documentUrls.governmentId,
          verified: false,
          uploadedAt:
            documentUrls.idProof || documentUrls.governmentId
              ? new Date()
              : undefined,
        },
        addressProof: {
          url: documentUrls.addressProof,
          verified: false,
          uploadedAt: documentUrls.addressProof ? new Date() : undefined,
        },
        bankStatement: {
          url: documentUrls.bankStatement || documentUrls.cancelledCheque,
          verified: false,
          uploadedAt:
            documentUrls.bankStatement || documentUrls.cancelledCheque
              ? new Date()
              : undefined,
        },
        tradeLicense: {
          url: documentUrls.tradeLicense,
          verified: false,
          uploadedAt: documentUrls.tradeLicense ? new Date() : undefined,
        },
      },

      verificationStatus: "pending",
      isActive: false,
      isVerified: false,
    });

    // Generate application ID
    const applicationId = `ONP-${seller._id
      .toString()
      .slice(-8)
      .toUpperCase()}`;

    // Send welcome email to seller
    try {
      const emailHtml = generateSellerWelcomeEmail({
        sellerName: fullName,
        email,
        applicationId,
        businessName,
      });

      const emailResult = await emailService.sendEmail({
        to: email,
        subject: "🎉 Welcome to Online Planet - Your Seller Journey Begins!",
        html: emailHtml,
      });

      if (emailResult.success) {
        console.log("✅ Welcome email sent to:", email);
        if (emailResult.previewUrl) {
          console.log("📧 Email preview:", emailResult.previewUrl);
        }
      } else {
        console.error("❌ Failed to send welcome email:", emailResult.error);
      }
    } catch (emailError) {
      console.error("❌ Email sending error:", emailError);
      // Don't fail the registration if email fails
    }

    // TODO: Send notification to admin for approval

    return NextResponse.json({
      success: true,
      message: "Seller registration submitted successfully",
      sellerId: seller._id,
      applicationId,
    });
  } catch (error) {
    console.error("Seller onboarding error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit registration",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
