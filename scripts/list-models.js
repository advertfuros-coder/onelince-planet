const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables manually
const envPath = path.join(__dirname, '../.env.local');
let apiKey = '';

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/GOOGLE_GEMINI_API_KEY=(.*)/);
  if (match) {
    apiKey = match[1].trim();
  }
} catch (e) {
  console.error("Could not read .env.local file");
}

if (!apiKey) {
  console.error("❌ API Key not found in .env.local");
  process.exit(1);
}

console.log(`✅ Found API Key: ${apiKey.substring(0, 5)}...`);

// Endpoint to list models
const version = 'v1beta';
const url = `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`;

console.log(`📡 Connecting to: ${url}`);

const req = https.get(url, (res) => {
  let body = '';
  
  res.on('data', (chunk) => body += chunk);
  
  res.on('end', () => {
    console.log(`\nResponse Status: ${res.statusCode}`);
    if (res.statusCode === 200) {
        console.log("✅ Success! Available models:");
        try {
            const parsed = JSON.parse(body);
            parsed.models.forEach(m => {
                if (m.name.includes('gemini')) {
                    console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
                }
            });
        } catch(e) {
            console.log("Response body:", body);
        }
    } else {
        console.error("❌ API Error:");
        console.error(body);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Request Error: ${e.message}`);
});
