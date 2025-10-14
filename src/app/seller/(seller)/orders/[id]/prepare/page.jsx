st[(loading, setLoading)] = useState(true);
const [submitting, setSubmitting] = useState(false);
const [checklist, setChecklist] = useState({
  itemsVerified: false,
  packagingDone: false,
  labelAttached: false,
  invoicePrinted: false,
});

useEffect(() => {
  if (!isAuthenticated || !user) {
    router.push("/login");
    return;
  }

  if (params.id) {
    fetchOrderDetails();
  }
}, [params.id, isAuthenticated, user]);

const fetchOrderDetails = async () => {
  try {
    const response = await axios.get(`/api/seller/orders/${params.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.data.success) {
      setOrder(response.data.order);
    }
  } catch (error) {
    toast.error("Failed to fetch order details");
  } finally {
    setLoading(false);
  }
};

const toggleChecklistItem = (item) => {
  setChecklist((prev) => ({
    ...prev,
    [item]: !prev[item],
  }));
};

const allChecked = Object.values(checklist).every((v) => v);

const handleMarkReadyForPickup = async () => {
  if (!allChecked) {
    toast.error("Please complete all checklist items");
    return;
  }

  if (!confirm("Mark this order ready for pickup?")) return;

  setSubmitting(true);
  try {
    const response = await axios.post(
      `/api/seller/orders/${params.id}/mark-pickup`,
      { sellerId: user._id }, // Use user._id from auth context
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      toast.success("Order marked ready for pickup!");
      router.push(`/seller/orders/${params.id}`);
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to mark pickup");
  } finally {
    setSubmitting(false);
  }
};

if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
    </div>
  );
}

if (!order) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <FiPackage className="text-6xl text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Order Not Found</h2>
      </div>
    </div>
  );
}

return (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <FiArrowLeft className="text-2xl" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Prepare Order</h1>
            <p className="text-gray-600">Order #{order.orderNumber}</p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FiBox className="text-blue-600" />
          Items to Pack
        </h2>
        <div className="space-y-4">
          {order.items.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200"
            >
              <div className="relative w-20 h-20 flex-shrink-0 bg-white rounded-lg overflow-hidden">
                {item.images && item.images[0] ? (
                  <Image
                    src={item.images[0]}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <FiPackage className="text-3xl text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg mb-1">
                  {item.name}
                </h3>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600">
                    Quantity:{" "}
                    <span className="font-bold text-blue-600">
                      {item.quantity}
                    </span>
                  </span>
                  {item.sku && (
                    <span className="text-gray-600">SKU: {item.sku}</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 text-xl">
                  ₹{(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preparation Checklist */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FiCheckCircle className="text-green-600" />
          Preparation Checklist
        </h2>
        <div className="space-y-4">
          {[
            {
              key: "itemsVerified",
              label: "Verify all items and quantities",
              icon: FiBox,
            },
            {
              key: "packagingDone",
              label: "Pack items securely with proper cushioning",
              icon: FiPackage,
            },
            {
              key: "labelAttached",
              label: "Attach shipping label on package",
              icon: FiTruck,
            },
            {
              key: "invoicePrinted",
              label: "Print and include invoice",
              icon: FiCheckCircle,
            },
          ].map(({ key, label, icon: Icon }) => (
            <label
              key={key}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${
                checklist[key]
                  ? "bg-green-50 border-green-500"
                  : "bg-gray-50 border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="checkbox"
                checked={checklist[key]}
                onChange={() => toggleChecklistItem(key)}
                className="w-6 h-6 text-green-600 rounded focus:ring-2 focus:ring-green-500"
              />
              <Icon
                className={`text-2xl ${
                  checklist[key] ? "text-green-600" : "text-gray-400"
                }`}
              />
              <span
                className={`flex-1 font-medium ${
                  checklist[key] ? "text-green-900" : "text-gray-700"
                }`}
              >
                {label}
              </span>
              {checklist[key] && (
                <FiCheckCircle className="text-2xl text-green-600" />
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Warning */}
      {!allChecked && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="text-2xl text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-yellow-900 mb-2">
                Complete All Steps
              </h3>
              <p className="text-sm text-yellow-800">
                Please complete all checklist items before marking the order
                ready for pickup. This ensures proper handling and delivery of
                the order.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleMarkReadyForPickup}
        disabled={!allChecked || submitting}
        className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-lg shadow-lg"
      >
        {submitting ? (
          <>
            <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <FiCheckCircle className="text-2xl" />
            <span>Mark Ready for Pickup</span>
          </>
        )}
      </button>

      {/* Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <strong>What happens next?</strong> Once you mark this order ready for
          pickup, it will appear in the admin panel for delivery partner
          assignment. The courier will be scheduled to collect the package from
          your location.
        </p>
      </div>
    </div>
  </div>
);
