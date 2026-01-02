#!/usr/bin/env node

/**
 * Automated Code Update Script
 * Updates all seller references to use new nested structure
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

// Mapping of old paths to new paths
const replacements = [
  // Business Info fields
  { old: /seller\.businessName/g, new: "seller.businessInfo?.businessName" },
  { old: /seller\.gstin/g, new: "seller.businessInfo?.gstin" },
  { old: /seller\.pan/g, new: "seller.businessInfo?.pan" },
  { old: /seller\.businessType/g, new: "seller.businessInfo?.businessType" },
  {
    old: /seller\.businessCategory/g,
    new: "seller.businessInfo?.businessCategory",
  },
  {
    old: /seller\.establishedYear/g,
    new: "seller.businessInfo?.establishedYear",
  },

  // Personal Details fields
  { old: /seller\.contactEmail/g, new: "seller.personalDetails?.email" },
  { old: /seller\.contactPhone/g, new: "seller.personalDetails?.phone" },
  { old: /seller\.contactName/g, new: "seller.personalDetails?.fullName" },

  // For assignments (without optional chaining)
  {
    old: /seller\.businessInfo\?\?\.businessName\s*=/g,
    new: "seller.businessInfo.businessName =",
  },
  {
    old: /seller\.businessInfo\?\?\.gstin\s*=/g,
    new: "seller.businessInfo.gstin =",
  },
  {
    old: /seller\.businessInfo\?\?\.pan\s*=/g,
    new: "seller.businessInfo.pan =",
  },
  {
    old: /seller\.personalDetails\?\?\.email\s*=/g,
    new: "seller.personalDetails.email =",
  },
  {
    old: /seller\.personalDetails\?\?\.phone\s*=/g,
    new: "seller.personalDetails.phone =",
  },
  {
    old: /seller\.personalDetails\?\?\.fullName\s*=/g,
    new: "seller.personalDetails.fullName =",
  },
];

// Directories to search
const searchDirs = [
  join(projectRoot, "src/app/api"),
  join(projectRoot, "src/app/admin"),
  join(projectRoot, "src/lib/services"),
];

let totalFiles = 0;
let updatedFiles = 0;
let totalReplacements = 0;

function processFile(filePath) {
  try {
    const content = readFileSync(filePath, "utf8");
    let newContent = content;
    let fileReplacements = 0;

    replacements.forEach(({ old, new: replacement }) => {
      const matches = newContent.match(old);
      if (matches) {
        fileReplacements += matches.length;
        newContent = newContent.replace(old, replacement);
      }
    });

    if (fileReplacements > 0) {
      writeFileSync(filePath, newContent, "utf8");
      console.log(`✅ Updated: ${filePath.replace(projectRoot, ".")}`);
      console.log(`   Replacements: ${fileReplacements}\n`);
      updatedFiles++;
      totalReplacements += fileReplacements;
    }

    totalFiles++;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function walkDirectory(dir) {
  try {
    const files = readdirSync(dir);

    files.forEach((file) => {
      const filePath = join(dir, file);
      const stat = statSync(filePath);

      if (stat.isDirectory()) {
        // Skip node_modules and .next
        if (!file.startsWith(".") && file !== "node_modules") {
          walkDirectory(filePath);
        }
      } else if (file.endsWith(".js") || file.endsWith(".jsx")) {
        processFile(filePath);
      }
    });
  } catch (error) {
    console.error(`❌ Error walking directory ${dir}:`, error.message);
  }
}

console.log("\n🔄 Starting Automated Code Update\n");
console.log("=".repeat(60));
console.log("\n📝 Updating seller references to new nested structure...\n");

searchDirs.forEach((dir) => {
  console.log(`📁 Searching: ${dir.replace(projectRoot, ".")}\n`);
  walkDirectory(dir);
});

console.log("=".repeat(60));
console.log("\n📊 Update Summary:\n");
console.log(`   📄 Total Files Scanned: ${totalFiles}`);
console.log(`   ✅ Files Updated: ${updatedFiles}`);
console.log(`   🔄 Total Replacements: ${totalReplacements}\n`);

if (updatedFiles > 0) {
  console.log("🎉 Code update completed successfully!\n");
  console.log("📝 Next Steps:");
  console.log("   1. Review the changes");
  console.log("   2. Test the application");
  console.log("   3. Restart your dev server if needed\n");
} else {
  console.log("ℹ️  No files needed updating.\n");
}
