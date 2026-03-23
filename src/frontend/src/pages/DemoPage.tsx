import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export default function DemoPage() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      <button
        type="button"
        onClick={() => navigate({ to: "/" })}
        className="fixed top-4 left-4 z-50 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft className="h-5 w-5 text-gray-700" />
      </button>

      <div className="max-w-md mx-auto px-6 pt-24 pb-12 flex flex-col items-center text-center">
        <div className="h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center text-4xl mb-6">
          💬
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Chat with Sellers
        </h1>
        <p className="text-gray-500 mb-8">
          Chat with sellers directly from any listing.
        </p>
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-full transition-colors shadow-md"
          data-ocid="demo.primary_button"
        >
          Browse Listings
        </button>
      </div>
    </div>
  );
}
