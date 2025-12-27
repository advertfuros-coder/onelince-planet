# OCR Troubleshooting Guide

## How to Test OCR Feature

### 1. Open Browser Console

1. Go to http://localhost:3001/seller/onboarding
2. Open Developer Tools (F12 or Cmd+Option+I)
3. Go to Console tab
4. Navigate to Step 3 (Business Info)

### 2. Upload a Document

Click "Smart Upload PAN (Auto-Fill)" or "Upload GST Certificate"

### 3. Check Console Logs

You should see these logs:

```
📤 PAN file selected: [filename]
🔍 Smart Parse Starting for document type: pan
📄 Starting OCR for: [filename]
✅ OCR Complete! Confidence: XX%
📝 Extracted Text Length: XXX characters
📄 Raw Text: [extracted text]
✅ Text extracted successfully
🎯 Auto-detected document type: pan
🔄 Parsing text for: pan
✅ Parsed data: {pan: "XXXXX0000X", fullName: "..."}
```

## Common Issues & Solutions

### Issue 1: No Logs Appearing

**Cause**: JavaScript error preventing execution
**Solution**: Check for any red errors in console

### Issue 2: "Failed to initialize worker"

**Cause**: Tesseract.js not loading properly
**Solution**:

```bash
npm install tesseract.js --force
```

### Issue 3: Text Extracted but Fields Not Filling

**Cause**: Regex patterns not matching document format

**Debug Steps**:

1. Check the "Raw Text" in console
2. Compare with regex patterns in ocrService.js
3. Adjust regex if needed

**PAN Regex**: `/[A-Z]{5}[0-9]{4}[A-Z]{1}/g`
**GST Regex**: `/\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/g`

### Issue 4: Low Confidence Score

**Cause**: Poor image quality
**Solution**:

- Use high resolution images (300+ DPI)
- Ensure good contrast
- Crop to just the relevant section

### Issue 5: PDF Not Working

**Cause**: Tesseract.js works with images, not directly with PDFs
**Solution**: PDFs are currently not supported. Use:

- Screenshot of PDF
- Convert PDF to image first
- Or we can add pdf.js library

## How to Add PDF Support

Install pdf.js:

```bash
npm install pdfjs-dist
```

Update ocrService.js to convert PDF to image first.

## Testing with Sample Documents

### Good Test Images:

- Clear, high-resolution scans
- Black text on white background
- No watermarks or stamps overlapping text
- Properly oriented (not rotated)

### Example PAN Format:

```
PERMANENT ACCOUNT NUMBER
Name: HARSH RAO
PAN: ABCDE1234F
Date of Birth: 01/01/1990
```

### Example GST Format:

```
GOODS AND SERVICES TAX
GSTIN: 27ABCDE1234F1Z5
Legal Name: ONLINE PLANET TRADING LLC
```

## Manual Testing

If OCR is not working, you can manually test the extraction:

### Test PAN Parser:

```javascript
import { DocumentParsers } from "@/lib/utils/ocrService";

const testText = `
PERMANENT ACCOUNT NUMBER
Name: HARSH RAO  
PAN: ABCDE1234F
Date of Birth: 01/01/1990
`;

const result = DocumentParsers.parsePANCard(testText);
console.log(result);
// Should output: { pan: "ABCDE1234F", fullName: "HARSH RAO", dateOfBirth: "1990-01-01" }
```

### Test GST Parser:

```javascript
const gstText = `
GOODS AND SERVICES TAX
GSTIN: 27ABCDE1234F1Z5
Legal Name: ONLINE PLANET TRADING LLC
`;

const result = DocumentParsers.parseGSTCertificate(gstText);
console.log(result);
// Should output: { gstin: "27ABCDE1234F1Z5", businessName: "ONLINE PLANET TRADING LLC" }
```

## Performance Notes

- **First load**: Tesseract downloads ~5MB of language data (one-time)
- **Processing time**: 2-10 seconds depending on image size
- **Caching**: Language data is cached in browser

## Next Steps

Once basic OCR is working:

1. Add PDF support with pdf.js
2. Add image preprocessing (contrast enhancement, deskew)
3. Add support for more document types
4. Implement confidence-based warnings
5. Add manual verification step for low-confidence extractions
