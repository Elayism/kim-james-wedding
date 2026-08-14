"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { rsvpSchema, type RsvpFormData } from "@/lib/rsvpSchema";

const MEAL_OPTIONS = ["Chicken", "Beef", "Vegetarian", "Fish", "Pork", "Other"];

export default function RSVPForm() {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<RsvpFormData>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      full_name: "",
      email: "",
      attending: "accepts",
      guest_count: 1,
      guests: [{ name: "", meal: "Chicken" }],
      meal_preference: "Chicken",
      meal_other: "",
      dietary_restrictions: "",
      message: "",
    },
    mode: "onTouched",
  });

  const { fields, replace } = useFieldArray({
    control,
    name: "guests",
  });

  const selectedMeal = watch("meal_preference");
  const fullNameValue = watch("full_name");
  const guestCountValue = watch("guest_count");
  const attendingValue = watch("attending");
  const firstName = fullNameValue ? fullNameValue.split(" ")[0] : "Friend";

  // Automatically update guest fields when guest count or primary full_name changes
  useEffect(() => {
    const count = Math.max(1, Number(guestCountValue) || 1);
    const currentGuests = fields.map((g, idx) => ({
      name: idx === 0 && (!g.name || g.name === "") ? fullNameValue : g.name || "",
      meal: g.meal || "Chicken",
    }));

    // Adjust length
    if (currentGuests.length < count) {
      for (let i = currentGuests.length; i < count; i++) {
        currentGuests.push({
          name: i === 0 ? fullNameValue : "",
          meal: "Chicken",
        });
      }
    } else if (currentGuests.length > count) {
      currentGuests.splice(count);
    }

    // Ensure Guest 1 has primary full_name if empty
    if (currentGuests[0] && (!currentGuests[0].name || currentGuests[0].name === "")) {
      currentGuests[0].name = fullNameValue;
    }

    replace(currentGuests);
  }, [guestCountValue, fullNameValue]);

  const handleNext = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await trigger(["full_name", "email"]);
    } else if (step === 2) {
      isValid = await trigger(["attending", "guest_count"]);
    }

    if (isValid) {
      setStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: RsvpFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsSubmitted(true);
      } else {
        setSubmitError(result.message || "Failed to submit RSVP. Please try again.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      {/* Deadline Note Above */}
      <div className="text-center mb-6">
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-gold-brown)] font-semibold mb-1">
          Kindly RSVP by January 1, 2027
        </p>
        <h2 className="text-3xl md:text-4xl font-serif text-[var(--color-espresso)]">
          Confirm Your Attendance
        </h2>
      </div>

      {/* Main Container */}
      <div
        className="relative p-6 md:p-8 rounded-xl shadow-lg border border-[var(--color-champagne)] bg-[var(--color-antique-white)]"
        style={{ perspective: "1000px" }}
      >
        {isSubmitted ? (
          /* Wax Seal Stamp Success Animation */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8 text-center flex flex-col items-center justify-center space-y-6"
          >
            {/* Wax Seal Icon */}
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
              className="w-24 h-24 rounded-full flex items-center justify-center shadow-xl border-4 border-[var(--color-warm-sand)]"
              style={{
                backgroundColor: "var(--color-gold-brown)",
                color: "var(--color-ivory)",
              }}
            >
              <div className="text-center font-serif">
                <div className="text-2xl font-bold tracking-wider">K & J</div>
                <div className="text-[9px] uppercase tracking-widest opacity-90">
                  {attendingValue === "accepts" ? "Accepted" : "Declined"}
                </div>
              </div>
            </motion.div>

            {/* Thank You Message */}
            <div className="space-y-2">
              <h3 className="text-2xl font-serif text-[var(--color-gold-brown)]">
                RSVP Confirmed!
              </h3>
              <p className="text-lg font-serif text-[var(--color-espresso)]">
                Thank you, {firstName} — your response has been saved.
              </p>
              <p className="text-xs text-[var(--color-soft-taupe)] italic">
                {attendingValue === "accepts"
                  ? "We look forward to celebrating with you and your party on March 8, 2027!"
                  : "We are sad you cannot make it, but thank you for letting us know."}
              </p>
            </div>
          </motion.div>
        ) : (
          <div>
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--color-champagne)]">
              <span className="text-xs uppercase tracking-widest font-semibold text-[var(--color-gold-brown)] font-sans">
                Step {step} of 3
              </span>
              <div className="flex gap-1.5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === step
                        ? "w-6 bg-[var(--color-gold-brown)]"
                        : i < step
                        ? "w-3 bg-[var(--color-soft-taupe)]"
                        : "w-3 bg-[var(--color-champagne)]"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Form & 3D Flip Steps */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: -90, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="space-y-4 text-left"
                  >
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[var(--color-espresso)] font-semibold mb-1 font-sans">
                        Full Name <span className="text-red-700">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Maria Santos"
                        {...register("full_name")}
                        className="w-full px-4 py-2.5 rounded-md border border-[var(--color-warm-sand)] bg-[var(--color-ivory)] text-[var(--color-espresso)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold-brown)] transition"
                      />
                      {errors.full_name && (
                        <p className="text-xs text-red-600 mt-1 font-sans">
                          {errors.full_name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[var(--color-espresso)] font-semibold mb-1 font-sans">
                        Email Address <span className="text-[var(--color-soft-taupe)] font-normal">(Optional)</span>
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. maria@example.com"
                        {...register("email")}
                        className="w-full px-4 py-2.5 rounded-md border border-[var(--color-warm-sand)] bg-[var(--color-ivory)] text-[var(--color-espresso)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold-brown)] transition"
                      />
                      {errors.email && (
                        <p className="text-xs text-red-600 mt-1 font-sans">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: -90, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="space-y-5 text-left"
                  >
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[var(--color-espresso)] font-semibold mb-2 font-sans">
                        Will You Be Attending? <span className="text-red-700">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <label
                          className={`flex items-center justify-center p-3 rounded-md border cursor-pointer transition text-sm font-sans font-medium ${
                            watch("attending") === "accepts"
                              ? "border-[var(--color-gold-brown)] bg-[var(--color-ecru)] text-[var(--color-gold-brown)] shadow-sm"
                              : "border-[var(--color-warm-sand)] bg-[var(--color-ivory)] text-[var(--color-espresso)]"
                          }`}
                        >
                          <input
                            type="radio"
                            value="accepts"
                            {...register("attending")}
                            className="sr-only"
                          />
                          <span>Joyfully Accepts</span>
                        </label>

                        <label
                          className={`flex items-center justify-center p-3 rounded-md border cursor-pointer transition text-sm font-sans font-medium ${
                            watch("attending") === "declines"
                              ? "border-[var(--color-gold-brown)] bg-[var(--color-ecru)] text-[var(--color-gold-brown)] shadow-sm"
                              : "border-[var(--color-warm-sand)] bg-[var(--color-ivory)] text-[var(--color-espresso)]"
                          }`}
                        >
                          <input
                            type="radio"
                            value="declines"
                            {...register("attending")}
                            className="sr-only"
                          />
                          <span>Regretfully Declines</span>
                        </label>
                      </div>
                      {errors.attending && (
                        <p className="text-xs text-red-600 mt-1 font-sans">
                          {errors.attending.message}
                        </p>
                      )}
                    </div>

                    {attendingValue === "accepts" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                      >
                        <label className="block text-xs uppercase tracking-wider text-[var(--color-espresso)] font-semibold mb-1 font-sans">
                          Total Number of Guests in Your Party <span className="text-red-700">*</span>
                        </label>
                        <select
                          {...register("guest_count", { valueAsNumber: true })}
                          className="w-full px-4 py-2.5 rounded-md border border-[var(--color-warm-sand)] bg-[var(--color-ivory)] text-[var(--color-espresso)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold-brown)] transition font-sans"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <option key={num} value={num}>
                              {num} {num === 1 ? "Guest" : "Guests"}
                            </option>
                          ))}
                        </select>
                        <p className="text-[11px] text-[var(--color-soft-taupe)] italic mt-1">
                          You will enter names and meal choices for all {guestCountValue} guest(s) in the next step.
                        </p>
                        {errors.guest_count && (
                          <p className="text-xs text-red-600 mt-1 font-sans">
                            {errors.guest_count.message}
                          </p>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: -90, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="space-y-4 text-left max-h-[60vh] overflow-y-auto pr-1"
                  >
                    {attendingValue === "accepts" ? (
                      <div className="space-y-4">
                        <div className="bg-[var(--color-ecru)] p-3 rounded-md border border-[var(--color-champagne)]">
                          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold-brown)] mb-1 font-sans">
                            Guest Details & Food Preferences ({fields.length} Guest{fields.length > 1 ? "s" : ""})
                          </p>
                          <p className="text-xs text-[var(--color-espresso)] font-serif">
                            Please provide the name and meal selection for each attendee in your party.
                          </p>
                        </div>

                        {fields.map((field, index) => (
                          <div
                            key={field.id}
                            className="p-3.5 rounded-lg border border-[var(--color-warm-sand)] bg-[var(--color-ivory)] space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-gold-brown)] font-sans">
                                Guest #{index + 1} {index === 0 ? "(Primary)" : ""}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] uppercase tracking-wider text-[var(--color-espresso)] font-semibold mb-1 font-sans">
                                  Full Name
                                </label>
                                <input
                                  type="text"
                                  placeholder={`Guest #${index + 1} Name`}
                                  {...register(`guests.${index}.name` as const)}
                                  className="w-full px-3 py-1.5 text-xs rounded border border-[var(--color-champagne)] bg-white text-[var(--color-espresso)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-brown)]"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] uppercase tracking-wider text-[var(--color-espresso)] font-semibold mb-1 font-sans">
                                  Meal Preference
                                </label>
                                <select
                                  {...register(`guests.${index}.meal` as const)}
                                  className="w-full px-3 py-1.5 text-xs rounded border border-[var(--color-champagne)] bg-white text-[var(--color-espresso)] focus:outline-none focus:ring-1 focus:ring-[var(--color-gold-brown)] font-sans"
                                >
                                  {MEAL_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Primary Meal Fallback selection */}
                        <div className="pt-1">
                          <label className="block text-xs uppercase tracking-wider text-[var(--color-espresso)] font-semibold mb-1 font-sans">
                            Primary Party Meal Preference
                          </label>
                          <select
                            {...register("meal_preference")}
                            className="w-full px-4 py-2.5 rounded-md border border-[var(--color-warm-sand)] bg-[var(--color-ivory)] text-[var(--color-espresso)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold-brown)] transition font-sans text-sm"
                          >
                            {MEAL_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>

                        {selectedMeal === "Other" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                          >
                            <label className="block text-xs uppercase tracking-wider text-[var(--color-espresso)] font-semibold mb-1 font-sans">
                              Specify Meal Details
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Vegan Gluten-Free"
                              {...register("meal_other")}
                              className="w-full px-4 py-2 rounded-md border border-[var(--color-warm-sand)] bg-[var(--color-ivory)] text-[var(--color-espresso)] text-sm"
                            />
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 rounded-md bg-[var(--color-ecru)] border border-[var(--color-champagne)] text-center text-sm font-serif text-[var(--color-espresso)]">
                        We appreciate you letting us know that you cannot attend. Please leave us a note below!
                      </div>
                    )}

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[var(--color-espresso)] font-semibold mb-1 font-sans">
                        Dietary Restrictions / Allergies <span className="text-[var(--color-soft-taupe)] font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Peanut Allergy, Lactose Intolerant"
                        {...register("dietary_restrictions")}
                        className="w-full px-4 py-2.5 rounded-md border border-[var(--color-warm-sand)] bg-[var(--color-ivory)] text-[var(--color-espresso)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold-brown)] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[var(--color-espresso)] font-semibold mb-1 font-sans">
                        Leave Us A Message <span className="text-red-700">*</span>
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Share your well wishes or notes for Kimberlyn & James..."
                        {...register("message")}
                        className="w-full px-4 py-2.5 rounded-md border border-[var(--color-warm-sand)] bg-[var(--color-ivory)] text-[var(--color-espresso)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold-brown)] transition resize-none"
                      />
                      {errors.message && (
                        <p className="text-xs text-red-600 mt-1 font-sans">
                          {errors.message.message}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Server Submit Error Notification */}
              {submitError && (
                <div className="mt-4 p-3 rounded bg-red-50 border border-red-200 text-xs text-red-700 font-sans text-center">
                  {submitError}
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--color-champagne)]">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-5 py-2 rounded-full text-xs uppercase tracking-wider font-semibold border border-[var(--color-soft-taupe)] text-[var(--color-espresso)] hover:bg-[var(--color-ecru)] transition font-sans"
                  >
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2 rounded-full text-xs uppercase tracking-wider font-semibold text-[var(--color-ivory)] shadow transition hover:opacity-90 font-sans"
                    style={{ backgroundColor: "var(--color-gold-brown)" }}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 rounded-full text-xs uppercase tracking-wider font-semibold text-[var(--color-ivory)] shadow transition hover:opacity-90 disabled:opacity-50 flex items-center gap-2 font-sans"
                    style={{ backgroundColor: "var(--color-gold-brown)" }}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit RSVP"
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Contact Note Below */}
      <div className="text-center mt-6 text-xs text-[var(--color-soft-taupe)] font-serif">
        Questions? Reach Erlinda Oliver on Facebook:{" "}
        <a
          href="https://www.facebook.com/erlinda.oliver.58"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-sans text-[var(--color-gold-brown)] hover:opacity-80 transition font-medium"
        >
          Erlinda Oliver Facebook Profile ↗
        </a>
      </div>
    </div>
  );
}
