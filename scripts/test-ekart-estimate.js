import dotenv from "dotenv";
dotenv.config({ path: "./.env.local" });

async function testEkartEstimate() {
  const ekartService = (await import("../src/lib/services/ekartService.js"))
    .default;

  try {
    console.log("Testing Ekart Estimate API...");

    // Test estimate from Lucknow to different cities
    const estimates = [
      { from: "226022", to: "110001", name: "Lucknow to Delhi" },
      { from: "226022", to: "400001", name: "Lucknow to Mumbai" },
      { from: "226022", to: "560001", name: "Lucknow to Bangalore" },
      { from: "226022", to: "226001", name: "Lucknow to Lucknow (same city)" },
    ];

    for (const test of estimates) {
      console.log(`\n${test.name}:`);
      try {
        const result = await ekartService.getEstimate({
          pickup_pincode: test.from,
          delivery_pincode: test.to,
          weight: 0.5,
          cod: 0,
        });
        console.log(JSON.stringify(result, null, 2));
      } catch (err) {
        console.log("Estimate API not available or error:", err.message);
      }
    }
  } catch (error) {
    console.error("Test failed:", error.message);
  } finally {
    process.exit(0);
  }
}

testEkartEstimate();
