import dotenv from "dotenv";
dotenv.config({ path: "./.env.local" });

async function testEkart() {
  const ekartService = (await import("../src/lib/services/ekartService.js")).default;
  try {
    console.log("Testing Ekart Serviceability...");
    const pincode = "226022"; // Lucknow Vikas Nagar
    const result = await ekartService.checkServiceability(pincode);
    console.log(
      "Ekart Result for " + pincode + ":",
      JSON.stringify(result, null, 2)
    );

    const pincode2 = "110001"; // Delhi
    const result2 = await ekartService.checkServiceability(pincode2);
    console.log(
      "Ekart Result for " + pincode2 + ":",
      JSON.stringify(result2, null, 2)
    );
  } catch (error) {
    console.error("Test failed:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  } finally {
    process.exit(0);
  }
}

testEkart();
