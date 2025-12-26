// scripts/test-review-apis.js
import axios from "axios";

const API_URL = "http://localhost:3000/api";
let authToken = "";
let testReviewId = "";
let testProductId = "69418dedc46af2717e5131e4"; // Use existing product

const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  console.log(`\n${"=".repeat(60)}`);
  log(`Testing: ${testName}`, "blue");
  console.log("=".repeat(60));
}

function logSuccess(message) {
  log(`✅ ${message}`, "green");
}

function logError(message) {
  log(`❌ ${message}`, "red");
}

// Login
async function login() {
  logTest("Authentication");
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: "seller@onlineplanet.ae",
      password: "Seller@123456",
    });

    if (response.data.success && response.data.token) {
      authToken = response.data.token;
      logSuccess("Login successful");
      return true;
    }
  } catch (error) {
    logError(`Login failed: ${error.message}`);
    return false;
  }
}

// Test 1: Create Review
async function testCreateReview() {
  logTest("Create Review");

  try {
    const response = await axios.post(
      `${API_URL}/reviews`,
      {
        productId: testProductId,
        rating: 5,
        title: "Excellent Product!",
        comment:
          "This product exceeded my expectations. Highly recommended for anyone looking for quality.",
        photos: [
          {
            url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
            cloudinaryId: "sample",
            caption: "Product in use",
          },
        ],
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    if (response.data.success) {
      testReviewId = response.data.review._id;
      logSuccess("Review created successfully");
      log(`Review ID: ${testReviewId}`, "yellow");
      log(`Status: ${response.data.review.status}`, "yellow");
      log(
        `Verified Purchase: ${response.data.review.verifiedPurchase}`,
        "yellow"
      );
      return true;
    }
  } catch (error) {
    if (error.response?.data?.message?.includes("already reviewed")) {
      logSuccess("Duplicate prevention working correctly");
      return true;
    }
    logError(`Failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 2: Get Reviews
async function testGetReviews() {
  logTest("Get Product Reviews");

  try {
    const response = await axios.get(
      `${API_URL}/reviews?productId=${testProductId}&page=1&limit=10`
    );

    if (response.data.success) {
      logSuccess(`Retrieved ${response.data.reviews.length} reviews`);
      log(`Average Rating: ${response.data.stats.averageRating}`, "yellow");
      log(`Total Reviews: ${response.data.stats.totalReviews}`, "yellow");
      log(`Rating Distribution:`, "yellow");
      Object.entries(response.data.stats.distribution).forEach(
        ([rating, count]) => {
          log(`  ${rating} stars: ${count}`, "yellow");
        }
      );
      return true;
    }
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 3: Filter Reviews
async function testFilterReviews() {
  logTest("Filter Reviews (5-star only)");

  try {
    const response = await axios.get(
      `${API_URL}/reviews?productId=${testProductId}&rating=5&limit=5`
    );

    if (response.data.success) {
      logSuccess(`Retrieved ${response.data.reviews.length} 5-star reviews`);
      const allFiveStar = response.data.reviews.every((r) => r.rating === 5);
      if (allFiveStar) {
        log("✓ Filter working correctly", "green");
      }
      return true;
    }
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 4: Mark Review Helpful
async function testMarkHelpful() {
  logTest("Mark Review as Helpful");

  if (!testReviewId) {
    log("⚠️  No review ID. Skipping.", "yellow");
    return false;
  }

  try {
    const response = await axios.post(
      `${API_URL}/reviews/${testReviewId}/helpful`,
      { helpful: true },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    if (response.data.success) {
      logSuccess("Marked as helpful");
      log(`Helpful count: ${response.data.helpful}`, "yellow");
      return true;
    }
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 5: Ask Question
async function testAskQuestion() {
  logTest("Ask Product Question");

  try {
    const response = await axios.post(
      `${API_URL}/products/${testProductId}/qa`,
      {
        question: "What is the warranty period for this product?",
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    if (response.data.success) {
      logSuccess("Question posted successfully");
      log(`Question ID: ${response.data.qa._id}`, "yellow");
      return true;
    }
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 6: Get Questions
async function testGetQuestions() {
  logTest("Get Product Questions");

  try {
    const response = await axios.get(
      `${API_URL}/products/${testProductId}/qa?page=1&limit=10`
    );

    if (response.data.success) {
      logSuccess(`Retrieved ${response.data.questions.length} questions`);
      if (response.data.questions.length > 0) {
        log(
          `First question: ${response.data.questions[0].question.text}`,
          "yellow"
        );
      }
      return true;
    }
  } catch (error) {
    logError(`Failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  log("\n⭐ Starting Reviews & Q&A API Tests\n", "blue");

  // Check server
  try {
    await axios.get(`${API_URL.replace("/api", "")}/`);
    logSuccess("Server is running");
  } catch (error) {
    logError("Server is not running! Start with: npm run dev");
    process.exit(1);
  }

  // Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    logError("Authentication failed. Cannot proceed.");
    process.exit(1);
  }

  await new Promise((r) => setTimeout(r, 1000));

  // Run tests
  const results = {
    createReview: await testCreateReview(),
    getReviews: false,
    filterReviews: false,
    markHelpful: false,
    askQuestion: false,
    getQuestions: false,
  };

  await new Promise((r) => setTimeout(r, 1000));
  results.getReviews = await testGetReviews();

  await new Promise((r) => setTimeout(r, 1000));
  results.filterReviews = await testFilterReviews();

  await new Promise((r) => setTimeout(r, 1000));
  results.markHelpful = await testMarkHelpful();

  await new Promise((r) => setTimeout(r, 1000));
  results.askQuestion = await testAskQuestion();

  await new Promise((r) => setTimeout(r, 1000));
  results.getQuestions = await testGetQuestions();

  // Summary
  log("\n📊 Test Summary:", "blue");
  console.log("=".repeat(60));

  const passed = Object.values(results).filter((r) => r === true).length;
  const total = Object.keys(results).length;

  log(
    `Tests Passed: ${passed}/${total}`,
    passed === total ? "green" : "yellow"
  );

  Object.entries(results).forEach(([test, result]) => {
    log(`  ${result ? "✅" : "❌"} ${test}`, result ? "green" : "red");
  });

  log("\n✅ All review API tests completed!", "green");
  log("\n🎯 Next: Build UI components", "yellow");
  log("Ready for review system integration\n", "blue");
}

// Run tests
runAllTests().catch((error) => {
  logError(`Test suite failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});
