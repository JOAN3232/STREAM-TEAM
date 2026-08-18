import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function PaymentCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState("Verifying your payment...");

  useEffect(() => {
    const verifyPayment = async () => {
      const reference =
        searchParams.get("reference") ||
        searchParams.get("trxref");

      if (!reference) {
        setStatus("Payment reference was not found.");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:8081/api/payments/verify/${reference}`
        );

        if (!response.ok) {
          throw new Error("Unable to verify payment");
        }

        const result = await response.json();

        const paymentStatus = result?.data?.status;

        if (result?.status === true && paymentStatus === "success") {
          setStatus("Payment confirmed. Redirecting...");

          setTimeout(() => {
            navigate("/whos-watching", {
              replace: true,
            });
          }, 1200);

          return;
        }

        setStatus("Payment could not be confirmed.");
      } catch (error) {
        console.error("Payment verification failed:", error);
        setStatus("Unable to verify payment. Please try again.");
      }
    };

    verifyPayment();
  }, [navigate, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07050d] px-6 text-white">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-violet-400" />

        <h1
          className="mt-6 text-3xl font-semibold"
          style={{
            fontFamily: '"Cormorant Garamond", serif',
          }}
        >
          STREAM
        </h1>

        <p className="mt-3 text-sm text-white/50">
          {status}
        </p>
      </div>
    </main>
  );
}