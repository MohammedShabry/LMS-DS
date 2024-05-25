import React from "react";
import Layout from "../../Layout/Layout";
import { loadStripe } from "@stripe/stripe-js";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

const public_stripe_key = "pk_test_51PGZAwBQcpRS4FFbPsaZRZaOXcHTemtOHz448lachZeief6goRcLj2lFrehZf281wNESr7dxIbCYzNXrHTTbclIQ00VhxU00sY";

export default function Checkout() {
  const { state } = useLocation();
  const { userInfo } = useSelector((state) => state.signIn);
  const price = state?.price;
  const courseId = state?.courseId;
  const description = state?.description; 
  const numberOfLectures = state?.numberOfLectures; 
  const status = state?.status;
  const title = state?.title;
  const userId = userInfo.userId;

  const handleSubscription = async (e) => {
    e.preventDefault();

    try {
      const requestBody = {
        courseId: courseId,
        description: description,
        numberOfLectures: numberOfLectures,
        status: status,
        userId: userId,
        price: price,
      };

      // Save payment details
      await savePaymentDetails();

      const stripePromise = await loadStripe(public_stripe_key);
      const response = await fetch(
        "http://localhost:3001/create-stripe-session-subscription",
        {
          method: "POST",
          headers: { "Content-Type": "Application/JSON" },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.status === 409) {
        const data = await response.json();
        if (data && data.redirectUrl) {
          window.location.href = data.redirectUrl; // Redirect to billing portal if user is already subscribed
        }
      } else {
        const session = await response.json();
        stripePromise.redirectToCheckout({
          sessionId: session.id,
        });
      }
    } catch (error) {
      console.error("Error handling subscription:", error);
      // Handle error gracefully
    }
  };

  const savePaymentDetails = async () => {
    try {
      const requestBody = {
        courseId: courseId,
        userId: userId,
        price: price,
        title: title
      };
      await fetch("http://localhost:3000/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
    } catch (error) {
      console.error("Error saving payment details:", error);
      // Handle error gracefully
      throw error;
    }
  };

  return (
    <Layout>
      <section className="flex flex-col gap-6 items-center py-8 px-3 min-h-[100vh]">
        <form
          onSubmit={handleSubscription}
          className="flex flex-col dark:bg-gray-800 bg-white gap-4 rounded-lg md:py-10 py-7 md:px-8 md:pt-3 px-3 md:w-[500px] w-full shadow-custom dark:shadow-xl transition duration-300"
        >
          <div>
            <h1 className="bg-yellow-500 w-full text-center py-4 text-2xl font-bold rounded-tl-lg rounded-tr-lg text-white">
              Subscription Bundle
            </h1>
            <div className="px-4 space-y-7 text-center text-gray-600 dark:text-gray-300">
              <p className="text-lg mt-5">
                Unlock access to all available courses on our platform for{" "}
                <span className="text-yellow-500 font-bold">1 year</span>. This
                includes both existing and new courses.
              </p>

              <p className="flex items-center justify-center gap-1 text-2xl font-bold text-yellow-500">
                LKR:
                <span>{price}</span>
              </p>

              <div className="text-xs">
                <p className="text-blue-600 dark:text-yellow-500">
                  100% refund on cancellation
                </p>
                <p>* Terms and conditions apply *</p>
              </div>

              <button
                type="submit"
                className="bg-yellow-500  transition duration-300 w-full text-xl font-bold text-white py-2 rounded-bl-lg rounded-br-lg"
              >
                Buy now
              </button>
            </div>
          </div>
        </form>
      </section>
    </Layout>
  );
}
