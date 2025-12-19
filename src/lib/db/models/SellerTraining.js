// lib/db/models/SellerTraining.js
import mongoose from "mongoose";

const SellerTrainingSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // Onboarding progress
    onboarding: {
      completed: {
        type: Boolean,
        default: false,
      },
      currentStep: {
        type: Number,
        default: 1,
      },
      totalSteps: {
        type: Number,
        default: 10,
      },
      steps: [
        {
          stepNumber: Number,
          title: String,
          description: String,
          completed: {
            type: Boolean,
            default: false,
          },
          completedAt: Date,
          skipped: {
            type: Boolean,
            default: false,
          },
        },
      ],
      startedAt: {
        type: Date,
        default: Date.now,
      },
      completedAt: Date,
    },

    // Course progress
    courses: [
      {
        courseId: String,
        title: String,
        category: {
          type: String,
          enum: ["basics", "advanced", "marketing", "analytics", "operations"],
        },
        status: {
          type: String,
          enum: ["not_started", "in_progress", "completed"],
          default: "not_started",
        },
        progress: {
          type: Number,
          default: 0, // Percentage
        },
        lessons: [
          {
            lessonId: String,
            title: String,
            type: {
              type: String,
              enum: ["video", "article", "quiz", "interactive"],
            },
            duration: Number, // in minutes
            completed: {
              type: Boolean,
              default: false,
            },
            completedAt: Date,
            quizScore: Number,
            timeSpent: Number,
          },
        ],
        startedAt: Date,
        completedAt: Date,
        certificateIssued: {
          type: Boolean,
          default: false,
        },
        certificateUrl: String,
      },
    ],

    // Certifications
    certifications: [
      {
        name: String,
        level: {
          type: String,
          enum: ["beginner", "intermediate", "advanced", "expert"],
        },
        issuedAt: Date,
        expiresAt: Date,
        certificateId: String,
        certificateUrl: String,
        score: Number,
        verified: {
          type: Boolean,
          default: true,
        },
      },
    ],

    // Achievements & Badges
    achievements: [
      {
        type: {
          type: String,
          enum: [
            "first_product",
            "first_sale",
            "hundred_sales",
            "five_star_rating",
            "fast_shipper",
            "course_completed",
            "certified_seller",
            "power_seller",
          ],
        },
        title: String,
        description: String,
        icon: String,
        earnedAt: {
          type: Date,
          default: Date.now,
        },
        points: Number,
      },
    ],

    // Learning preferences
    preferences: {
      learningStyle: {
        type: String,
        enum: ["visual", "auditory", "reading", "kinesthetic"],
      },
      pace: {
        type: String,
        enum: ["slow", "medium", "fast"],
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        push: {
          type: Boolean,
          default: true,
        },
        frequency: {
          type: String,
          enum: ["daily", "weekly", "monthly"],
          default: "weekly",
        },
      },
      favoriteTopics: [String],
    },

    // Progress tracking
    stats: {
      totalCoursesCompleted: { type: Number, default: 0 },
      totalLessonsCompleted: { type: Number, default: 0 },
      totalTimeSpent: { type: Number, default: 0 }, // in minutes
      totalPoints: { type: Number, default: 0 },
      currentStreak: { type: Number, default: 0 }, // days
      longestStreak: { type: Number, default: 0 },
      lastActivityDate: Date,
      averageQuizScore: { type: Number, default: 0 },
    },

    // Recommended courses
    recommendations: [
      {
        courseId: String,
        title: String,
        reason: String,
        priority: Number,
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Webinar attendance
    webinars: [
      {
        webinarId: String,
        title: String,
        scheduledAt: Date,
        attended: {
          type: Boolean,
          default: false,
        },
        attendedAt: Date,
        duration: Number,
        recording: String,
        certificateIssued: Boolean,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Method to complete onboarding step
SellerTrainingSchema.methods.completeOnboardingStep = function (stepNumber) {
  const step = this.onboarding.steps.find((s) => s.stepNumber === stepNumber);
  if (step) {
    step.completed = true;
    step.completedAt = new Date();

    // Update current step
    if (stepNumber === this.onboarding.currentStep) {
      this.onboarding.currentStep = stepNumber + 1;
    }

    // Check if all steps completed
    const allCompleted = this.onboarding.steps.every(
      (s) => s.completed || s.skipped
    );
    if (allCompleted) {
      this.onboarding.completed = true;
      this.onboarding.completedAt = new Date();

      // Award achievement
      this.addAchievement(
        "course_completed",
        "Onboarding Complete",
        "Completed seller onboarding",
        100
      );
    }
  }

  return this.save();
};

// Method to complete lesson
SellerTrainingSchema.methods.completeLesson = function (
  courseId,
  lessonId,
  timeSpent,
  quizScore
) {
  const course = this.courses.find((c) => c.courseId === courseId);
  if (!course) return this.save();

  const lesson = course.lessons.find((l) => l.lessonId === lessonId);
  if (lesson) {
    lesson.completed = true;
    lesson.completedAt = new Date();
    lesson.timeSpent = timeSpent;
    if (quizScore !== undefined) lesson.quizScore = quizScore;

    // Update course progress
    const completedLessons = course.lessons.filter((l) => l.completed).length;
    course.progress = (completedLessons / course.lessons.length) * 100;

    // Update stats
    this.stats.totalLessonsCompleted += 1;
    this.stats.totalTimeSpent += timeSpent;
    this.stats.lastActivityDate = new Date();

    // Check if course completed
    if (course.progress === 100) {
      course.status = "completed";
      course.completedAt = new Date();
      this.stats.totalCoursesCompleted += 1;

      // Issue certificate
      course.certificateIssued = true;
      course.certificateUrl = `/certificates/${this.sellerId}/${courseId}`;
    }
  }

  return this.save();
};

// Method to add achievement
SellerTrainingSchema.methods.addAchievement = function (
  type,
  title,
  description,
  points
) {
  // Check if already earned
  const exists = this.achievements.some((a) => a.type === type);
  if (exists) return this.save();

  this.achievements.push({
    type,
    title,
    description,
    points,
    earnedAt: new Date(),
  });

  this.stats.totalPoints += points;

  return this.save();
};

// Method to update streak
SellerTrainingSchema.methods.updateStreak = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActivity = this.stats.lastActivityDate
    ? new Date(this.stats.lastActivityDate)
    : null;
  if (lastActivity) {
    lastActivity.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      // Consecutive day
      this.stats.currentStreak += 1;
      if (this.stats.currentStreak > this.stats.longestStreak) {
        this.stats.longestStreak = this.stats.currentStreak;
      }
    } else if (daysDiff > 1) {
      // Streak broken
      this.stats.currentStreak = 1;
    }
  } else {
    this.stats.currentStreak = 1;
  }

  this.stats.lastActivityDate = new Date();
  return this.save();
};

export default mongoose.models.SellerTraining ||
  mongoose.model("SellerTraining", SellerTrainingSchema);
