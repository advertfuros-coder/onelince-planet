// app/api/reviews/[id]/moderate/route.js
export async function PATCH(request, { params }) {
  await connectDB();
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const decoded = verifyToken(token);
  if (!decoded || (decoded.role !== "admin" && decoded.role !== "seller")) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }
  const { status, reply } = await request.json();
  const { id } = await params;
  const review = await Review.findById(id);
  if (!review) {
    return NextResponse.json(
      { success: false, message: "Review not found" },
      { status: 404 }
    );
  }
  if (status) {
    review.status = status; // e.g., 'published', 'hidden'
  }
  if (reply) {
    review.reply = {
      text: reply.text,
      date: new Date(),
      author: decoded.id,
    };
  }
  await review.save();
  return NextResponse.json({ success: true, review });
}
