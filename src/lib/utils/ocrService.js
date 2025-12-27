// lib/utils/ocrService.js
import { createWorker } from "tesseract.js";

/**
 * OCR Service for extracting text from documents
 * Uses Tesseract.js (completely free, no API limits)
 */

export class OCRService {
  constructor() {
    this.worker = null;
  }

  async initialize() {
    if (!this.worker) {
      this.worker = await createWorker("eng");
    }
    return this.worker;
  }

  async extractText(imageFile) {
    try {
      console.log("📄 Starting OCR for:", imageFile.name, imageFile.type);
      await this.initialize();

      const {
        data: { text, confidence },
      } = await this.worker.recognize(imageFile);
      
      console.log("✅ OCR Complete! Confidence:", confidence + "%");
      console.log("📝 Extracted Text Length:", text.length, "characters");
      console.log("📄 Raw Text:", text);
      
      return text;
    } catch (error) {
      console.error("❌ OCR extraction error:", error);
      throw new Error("Failed to extract text from image: " + error.message);
    }
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

/**
 * Document-specific parsers with regex patterns
 */

export const DocumentParsers = {
  /**
   * PAN Card Parser (India)
   * Format: ABCDE1234F
   */
  parsePANCard: (text) => {
    const data = {};

    // Extract PAN number
    const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/g;
    const panMatch = text.match(panRegex);
    if (panMatch) {
      data.pan = panMatch[0];
    }

    // Extract name (usually in capital letters after "Name" or before PAN)
    const nameRegex = /(?:Name|NAME)\s*:?\s*([A-Z\s]{3,50})/;
    const nameMatch = text.match(nameRegex);
    if (nameMatch) {
      data.fullName = nameMatch[1].trim();
    }

    // Extract DOB
    const dobRegex =
      /(?:Date of Birth|DOB|Birth)\s*:?\s*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i;
    const dobMatch = text.match(dobRegex);
    if (dobMatch) {
      data.dateOfBirth = convertToISODate(dobMatch[1]);
    }

    return data;
  },

  /**
   * GST Certificate Parser
   * Format: 22AAAAA0000A1Z5
   */
  parseGSTCertificate: (text) => {
    const data = {};

    // Extract GSTIN
    const gstRegex = /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/g;
    const gstMatch = text.match(gstRegex);
    if (gstMatch) {
      data.gstin = gstMatch[0];
    }

    // Extract business name
    const businessRegex =
      /(?:Legal Name|Business Name|Trade Name)\s*:?\s*([A-Z][A-Za-z\s&.,()-]{3,100})/i;
    const businessMatch = text.match(businessRegex);
    if (businessMatch) {
      data.businessName = businessMatch[1].trim();
    }

    // Extract address
    const addressRegex =
      /(?:Address|Principal Place)\s*:?\s*([A-Za-z0-9\s,.-]{10,200})/i;
    const addressMatch = text.match(addressRegex);
    if (addressMatch) {
      const address = addressMatch[1].trim();
      data.businessAddress = address;
    }

    return data;
  },

  /**
   * Aadhaar Card Parser (India)
   * Format: 1234 5678 9012
   */
  parseAadhaar: (text) => {
    const data = {};

    // Extract Aadhaar number
    const aadhaarRegex = /\d{4}\s?\d{4}\s?\d{4}/g;
    const aadhaarMatch = text.match(aadhaarRegex);
    if (aadhaarMatch) {
      data.aadhaarNumber = aadhaarMatch[0].replace(/\s/g, "");
    }

    // Extract name
    const nameRegex = /([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,3})/;
    const nameMatch = text.match(nameRegex);
    if (nameMatch) {
      data.fullName = nameMatch[0];
    }

    // Extract DOB
    const dobRegex =
      /(?:DOB|Year of Birth)\s*:?\s*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i;
    const dobMatch = text.match(dobRegex);
    if (dobMatch) {
      data.dateOfBirth = convertToISODate(dobMatch[1]);
    }

    // Extract address
    const addressLines = text
      .split("\n")
      .filter(
        (line) => line.length > 20 && /\d/.test(line) && /[A-Za-z]/.test(line)
      );
    if (addressLines.length > 0) {
      data.address = addressLines.join(", ");
    }

    return data;
  },

  /**
   * Bank Statement / Cancelled Cheque Parser
   */
  parseBankDocument: (text) => {
    const data = {};

    // Extract Account Number
    const accountRegex =
      /(?:A\/C|Account|Acc)\s*(?:No|Number)?\s*:?\s*(\d{9,18})/i;
    const accountMatch = text.match(accountRegex);
    if (accountMatch) {
      data.accountNumber = accountMatch[1];
    }

    // Extract IFSC Code (India)
    const ifscRegex = /[A-Z]{4}0[A-Z0-9]{6}/g;
    const ifscMatch = text.match(ifscRegex);
    if (ifscMatch) {
      data.ifscCode = ifscMatch[0];
    }

    // Extract IBAN (UAE/International)
    const ibanRegex = /[A-Z]{2}\d{2}[A-Z0-9]{10,30}/g;
    const ibanMatch = text.match(ibanRegex);
    if (ibanMatch) {
      data.ifscCode = ibanMatch[0]; // Using ifscCode field for IBAN too
    }

    // Extract Bank Name
    const bankNames = [
      "HDFC",
      "ICICI",
      "SBI",
      "Axis",
      "Kotak",
      "Emirates NBD",
      "ADCB",
      "Mashreq",
    ];
    for (const bank of bankNames) {
      if (text.toUpperCase().includes(bank.toUpperCase())) {
        data.bankName = bank;
        break;
      }
    }

    // Extract account holder name
    const holderRegex =
      /(?:Name|Account Holder)\s*:?\s*([A-Z][A-Za-z\s]{3,50})/i;
    const holderMatch = text.match(holderRegex);
    if (holderMatch) {
      data.accountHolderName = holderMatch[1].trim();
    }

    return data;
  },

  /**
   * Passport Parser
   */
  parsePassport: (text) => {
    const data = {};

    // Extract passport number
    const passportRegex = /[A-Z]\d{7,9}/g;
    const passportMatch = text.match(passportRegex);
    if (passportMatch) {
      data.passportNumber = passportMatch[0];
    }

    // Extract name
    const nameRegex = /(?:Name|Surname)\s*:?\s*([A-Z][A-Za-z\s]{3,50})/i;
    const nameMatch = text.match(nameRegex);
    if (nameMatch) {
      data.fullName = nameMatch[1].trim();
    }

    // Extract DOB
    const dobRegex =
      /(?:Date of Birth|DOB)\s*:?\s*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i;
    const dobMatch = text.match(dobRegex);
    if (dobMatch) {
      data.dateOfBirth = convertToISODate(dobMatch[1]);
    }

    return data;
  },

  /**
   * Emirates ID Parser (UAE)
   */
  parseEmiratesID: (text) => {
    const data = {};

    // Extract Emirates ID number (784-YYYY-XXXXXXX-X)
    const eidRegex = /784[-\s]?\d{4}[-\s]?\d{7}[-\s]?\d/g;
    const eidMatch = text.match(eidRegex);
    if (eidMatch) {
      data.emiratesId = eidMatch[0].replace(/[-\s]/g, "");
    }

    // Extract name
    const nameRegex = /([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,4})/;
    const nameMatch = text.match(nameRegex);
    if (nameMatch) {
      data.fullName = nameMatch[0];
    }

    // Extract DOB
    const dobRegex = /(\d{2}[\/\-]\d{2}[\/\-]\d{4})/;
    const dobMatch = text.match(dobRegex);
    if (dobMatch) {
      data.dateOfBirth = convertToISODate(dobMatch[1]);
    }

    return data;
  },
};

/**
 * Auto-detect document type and parse accordingly
 */
export async function smartParseDocument(imageFile, documentType = "auto") {
  const ocr = new OCRService();

  try {
    console.log("🔍 Smart Parse Starting for document type:", documentType);
    
    // Extract text using OCR
    const text = await ocr.extractText(imageFile);
    console.log("✅ Text extracted successfully");

    let parsedData = {};

    // Auto-detect or use specified type
    if (documentType === "auto") {
      documentType = detectDocumentType(text);
      console.log("🎯 Auto-detected document type:", documentType);
    }

    // Parse based on document type
    console.log("🔄 Parsing text for:", documentType);
    
    switch (documentType) {
      case "pan":
        parsedData = DocumentParsers.parsePANCard(text);
        break;
      case "gst":
        parsedData = DocumentParsers.parseGSTCertificate(text);
        break;
      case "aadhaar":
        parsedData = DocumentParsers.parseAadhaar(text);
        break;
      case "bank":
        parsedData = DocumentParsers.parseBankDocument(text);
        break;
      case "passport":
        parsedData = DocumentParsers.parsePassport(text);
        break;
      case "emirates_id":
        parsedData = DocumentParsers.parseEmiratesID(text);
        break;
      default:
        console.warn("⚠️ Unknown document type, returning raw text");
        parsedData = { rawText: text };
    }

    console.log("✅ Parsed data:", parsedData);

    return {
      success: true,
      documentType,
      data: parsedData,
      rawText: text,
    };
  } catch (error) {
    console.error("❌ Smart parse error:", error);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    await ocr.terminate();
  }
}

/**
 * Detect document type from text content
 */
function detectDocumentType(text) {
  const upperText = text.toUpperCase();

  if (
    /INCOME TAX|PAN|PERMANENT ACCOUNT/.test(upperText) &&
    /[A-Z]{5}[0-9]{4}[A-Z]{1}/.test(text)
  ) {
    return "pan";
  }
  if (/GST|GOODS AND SERVICES TAX|GSTIN/.test(upperText)) {
    return "gst";
  }
  if (/AADHAAR|UIDAI|UNIQUE IDENTIFICATION/.test(upperText)) {
    return "aadhaar";
  }
  if (/PASSPORT|REPUBLIC OF INDIA/.test(upperText)) {
    return "passport";
  }
  if (
    /EMIRATES ID|IDENTITY CARD/.test(upperText) ||
    /784[-\s]?\d{4}/.test(text)
  ) {
    return "emirates_id";
  }
  if (/BANK|IFSC|ACCOUNT|CHEQUE/.test(upperText)) {
    return "bank";
  }

  return "unknown";
}

/**
 * Convert various date formats to ISO format (YYYY-MM-DD)
 */
function convertToISODate(dateStr) {
  const formats = [
    /(\d{2})[\/\-](\d{2})[\/\-](\d{4})/, // DD/MM/YYYY or DD-MM-YYYY
    /(\d{4})[\/\-](\d{2})[\/\-](\d{2})/, // YYYY/MM/DD or YYYY-MM-DD
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      // Assume DD/MM/YYYY format is most common
      if (match[3] && match[3].length === 4) {
        // DD/MM/YYYY
        return `${match[3]}-${match[2]}-${match[1]}`;
      } else {
        // YYYY/MM/DD
        return `${match[1]}-${match[2]}-${match[3]}`;
      }
    }
  }

  return dateStr;
}
