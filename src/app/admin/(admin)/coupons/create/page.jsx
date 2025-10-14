import CouponCreationForm from "@/app/components/admin/CouponCreationForm";

 
export default function CreateCouponPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <CouponCreationForm />
      </div>
    </div>
  );
}
