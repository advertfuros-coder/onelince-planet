#!/usr/bin/env node

/**
 * Memory Leak Detection Script for Next.js
 * Scans API routes and components for common memory leak patterns
 */

const fs = require("fs");
const path = require("path");

const issues = [];

// Patterns that commonly cause memory leaks
const LEAK_PATTERNS = [
  {
    pattern: /setInterval\(/g,
    message: "setInterval without clearInterval - potential memory leak",
    severity: "HIGH",
  },
  {
    pattern: /addEventListener\(/g,
    message:
      "addEventListener without removeEventListener - potential memory leak",
    severity: "MEDIUM",
  },
  {
    pattern: /new\s+WebSocket\(/g,
    message: "WebSocket without proper cleanup - potential memory leak",
    severity: "HIGH",
  },
  {
    pattern: /mongoose\.connect\(/g,
    message:
      "Check if mongoose connection is reused (should use singleton pattern)",
    severity: "MEDIUM",
  },
  {
    pattern: /readFileSync\(/g,
    message:
      "readFileSync loads entire file into memory - use createReadStream instead",
    severity: "LOW",
  },
  {
    pattern: /Buffer\.from\(/g,
    message: "Buffer usage - ensure buffers are properly disposed",
    severity: "LOW",
  },
];

function scanDirectory(dir, filePattern = /\.(js|jsx|ts|tsx)$/) {
  const files = [];

  function walk(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      // Skip node_modules, .next, and other build directories
      if (entry.isDirectory()) {
        if (
          !["node_modules", ".next", ".git", "dist", "build"].includes(
            entry.name,
          )
        ) {
          walk(fullPath);
        }
      } else if (entry.isFile() && filePattern.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  LEAK_PATTERNS.forEach(({ pattern, message, severity }) => {
    let match;
    let lineNum = 0;

    for (const line of lines) {
      lineNum++;
      if (pattern.test(line)) {
        issues.push({
          file: filePath,
          line: lineNum,
          severity,
          message,
          code: line.trim(),
        });
      }
    }
  });
}

// Main execution
console.log("\n🔍 Scanning for potential memory leaks...\n");

const projectRoot = process.cwd();
const apiDir = path.join(projectRoot, "src", "app", "api");
const srcDir = path.join(projectRoot, "src");

console.log(`📁 Scanning directory: ${srcDir}\n`);

const files = scanDirectory(srcDir);
console.log(`📄 Found ${files.length} files to scan\n`);

files.forEach(scanFile);

// Group by severity
const high = issues.filter((i) => i.severity === "HIGH");
const medium = issues.filter((i) => i.severity === "MEDIUM");
const low = issues.filter((i) => i.severity === "LOW");

console.log("═══════════════════════════════════════════════════════\n");
console.log(`🔴 HIGH PRIORITY ISSUES: ${high.length}`);
console.log(`🟡 MEDIUM PRIORITY ISSUES: ${medium.length}`);
console.log(`🟢 LOW PRIORITY ISSUES: ${low.length}`);
console.log("\n═══════════════════════════════════════════════════════\n");

if (high.length > 0) {
  console.log("\n🔴 HIGH PRIORITY ISSUES:\n");
  high.forEach((issue, idx) => {
    console.log(`${idx + 1}. ${issue.file}:${issue.line}`);
    console.log(`   ${issue.message}`);
    console.log(`   Code: ${issue.code}`);
    console.log("");
  });
}

if (medium.length > 0) {
  console.log("\n🟡 MEDIUM PRIORITY ISSUES:\n");
  medium.forEach((issue, idx) => {
    console.log(`${idx + 1}. ${issue.file}:${issue.line}`);
    console.log(`   ${issue.message}`);
    console.log(`   Code: ${issue.code}`);
    console.log("");
  });
}

if (low.length > 0 && process.argv.includes("--verbose")) {
  console.log("\n🟢 LOW PRIORITY ISSUES:\n");
  low.forEach((issue, idx) => {
    console.log(`${idx + 1}. ${issue.file}:${issue.line}`);
    console.log(`   ${issue.message}`);
    console.log(`   Code: ${issue.code}`);
    console.log("");
  });
}

console.log("\n═══════════════════════════════════════════════════════\n");
console.log("💡 RECOMMENDATIONS:\n");
console.log("1. Review all HIGH priority issues immediately");
console.log(
  "2. Ensure all event listeners are cleaned up in useEffect cleanup",
);
console.log("3. Use singleton pattern for database connections");
console.log("4. Replace readFileSync with streaming for large files");
console.log("5. Clear intervals and timeouts in component cleanup");
console.log("\n");

if (issues.length === 0) {
  console.log("✅ No obvious memory leak patterns detected!");
  console.log("   Note: This doesn't guarantee no memory leaks exist.\n");
} else {
  console.log(`⚠️  Found ${issues.length} potential memory leak patterns`);
  console.log("   Review and fix these issues to reduce memory usage\n");
}
