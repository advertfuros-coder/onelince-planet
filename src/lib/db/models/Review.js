// lib/db/models/Review.js
import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: { type: Number, min: 1, max: 5, required: true },
    title: { type: String, maxlength: 100 },
    comment: { type: String, maxlength: 1000, required: true },
    images: [{ url: String, publicId: String }],
    verified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["published", "pending", "hidden"],
      default: "published",
    },
    reply: {
      text: String,
      date: Date,
      author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
  },
  { timestamps: true }
);

ReviewSchema.post("save", async function () {
  const Product = mongoose.model("Product");
  const reviews = await mongoose
    .model("Review")
    .find({ product: this.product, status: "published" });
  const avgRating =
    reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  await Product.findByIdAndUpdate(this.product, {
    "ratings.average": avgRating,
    "ratings.count": reviews.length,
  });
});

export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);
