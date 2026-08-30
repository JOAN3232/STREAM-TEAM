import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { selectPlan } from "../services/authService";

export default function Payment() {
  const navigate = useNavigate();

  const [selectedPlan, setSelectedPlan] = useState("premium");
  const [form, setForm] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const plans = [
    { id: "basic", name: "Basic", price: "₦2,500", quality: "SD", screens: 1 },
    { id: "standard", name: "Standard", price: "₦4,500", quality: "HD", screens: 2 },
    { id: "premium", name: "Premium", price: "₦7,000", quality: "4K + HDR", screens: 4 },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      await selectPlan(selectedPlan);
      setIsProcessing(false);
      setShowSuccess(true);
    } catch (error) {
      setIsProcessing(false);
      console.error("Plan selection error:", error);
      alert("Something went wrong saving your plan: " + error.message);
    }
  };

  const handleContinue = () => {
    navigate("/whos-watching");
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12 page-transition">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-['Cormorant_Garamond'] font-bold text-3xl md:text-4xl mb-2 text-[#8b5cf6]">
          Choose Your Plan
        </h1>
        <p className="text-white/50 mb-10">
          Cancel anytime. No commitments.
        </p>

        {/* Plan selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlan(plan.id)}
                className={`text-left rounded-lg p-5 border transition-all duration-300 ${
                  isSelected
                    ? "border-[#8b5cf6] bg-[#8b5cf6]/10 shadow-[0_0_20px_rgba(139,92,246,0.25)]"
                    : "border-white/10 bg-white/[0.03] hover:border-white/30"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-['Cormorant_Garamond'] font-bold text-lg">
                    {plan.name}
                  </span>
                  {isSelected && (
                    <span className="text-[#8b5cf6] text-xs font-bold tracking-wide">
                      SELECTED
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold mb-3">
                  {plan.price}
                  <span className="text-sm text-white/40 font-normal">
                    /mo
                  </span>
                </p>
                <ul className="text-sm text-white/50 space-y-1">
                  <li>{plan.quality}</li>
                  <li>{plan.screens} screen{plan.screens > 1 ? "s" : ""}</li>
                </ul>
              </button>
            );
          })}
        </div>

        {/* Payment form wrapping input elements */}
        <div className="bg-white/[0.03] border border-white/10 rounded-lg p-6 md:p-8">
          <h2 className="font-['Cormorant_Garamond'] font-bold text-xl mb-6 text-[#8b5cf6]">
            Payment Details
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-white/50 mb-1">
                Name on Card
              </label>
              <input
                type="text"
                name="cardName"
                value={form.cardName}
                onChange={handleChange}
                placeholder="Jane Doe"
                className="w-full bg-black/40 border border-white/10 rounded-md px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#8b5cf6] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-white/50 mb-1">
                Card Number
              </label>
              <input
                type="text"
                name="cardNumber"
                value={form.cardNumber}
                onChange={handleChange}
                placeholder="1234 5678 9012 3456"
                maxLength={15}
                className="w-full bg-black/40 border border-white/10 rounded-md px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#8b5cf6] transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/50 mb-1">
                  Expiry
                </label>
                <input
                  type="text"
                  name="expiry"
                  value={form.expiry}
                  onChange={handleChange}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="w-full bg-black/40 border border-white/10 rounded-md px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#8b5cf6] transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-white/50 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  name="cvv"
                  value={form.cvv}
                  onChange={handleChange}
                  placeholder="1234"
                  maxLength={4}
                  className="w-full bg-black/40 border border-white/10 rounded-md px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#8b5cf6] transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full mt-4 bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:opacity-50 text-white font-bold py-3 rounded-md transition-colors shadow-[0_0_20px_rgba(139,92,246,0.3)]"
            >
              {isProcessing
                ? "Processing..."
                : `Subscribe – ${plans.find((p) => p.id === selectedPlan)?.price}/mo`}
            </button>

            <p className="text-xs text-white/30 text-center pt-2">
              This is a mock payment form for demo purposes only.
            </p>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="page-transition bg-[#0a0a0a] border border-[#8b5cf6]/40 rounded-xl p-8 max-w-sm w-full mx-4 text-center shadow-[0_0_40px_rgba(139,92,246,0.25)]">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#8b5cf6]/15 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-[#8b5cf6]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h3 className="font-['Cormorant_Garamond'] font-bold text-2xl text-[#8b5cf6] mb-2">
              Payment Successful
            </h3>
            <p className="text-white/60 text-sm mb-6">
              You're subscribed to the{" "}
              <span className="text-white font-semibold">
                {plans.find((p) => p.id === selectedPlan)?.name}
              </span>{" "}
              plan. Enjoy streaming.
            </p>

            <button
              onClick={handleContinue}
              className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold py-3 rounded-md transition-colors"
            >
              Continue to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}