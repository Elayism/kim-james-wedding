"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FadeInSection, { childVariants } from "./FadeInSection";
import { CornerFlourish, SectionDivider } from "./Flourishes";

export default function GiftRegistry() {
  const [copiedLabel, setCopiedLabel] = useState("");
  const [activeQrModal, setActiveQrModal] = useState(null); // "maribank" | "gcash" | null

  const details = {
    maribank: {
      bankName: "MariBank",
      accountName: "Kimberlyn Oliver",
      accountNumber: "14848808514",
    },
    gcash: {
      name: "GCash",
      accountName: "Kimberlyn / James",
      number: "0917-123-4567",
    },
    emails: [
      { email: "jameskurt2014@hotmail.com", label: "James (International)" },
      { email: "kimberlynoliver13@gmail.com", label: "Kimberlyn (International)" },
    ],
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(""), 3000);
  };

  const copyAllDetails = () => {
    const fullText = `Kimberlyn & James Wedding Gift Details:

MARIBANK
Account Name: ${details.maribank.accountName}
Account Number: ${details.maribank.accountNumber}

GCASH
Number: ${details.gcash.number}

INTERNATIONAL EMAILS
- ${details.emails[0].email}
- ${details.emails[1].email}`;

    copyToClipboard(fullText, "All Gift Details");
  };

  return (
    <div
      className="w-full flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: "var(--color-ivory)" }}
    >
      <FadeInSection>
        <motion.h2 variants={childVariants} className="text-3xl md:text-5xl font-serif text-[var(--color-gold-brown)] font-letterpress mb-1 text-center">
          Gift Registry
        </motion.h2>

        <motion.div variants={childVariants}>
          <SectionDivider />
        </motion.div>

        <motion.div variants={childVariants} className="relative p-6 md:p-8 rounded-lg bg-[var(--color-antique-white)] border border-[var(--color-champagne)] shadow-sm max-w-2xl mx-auto font-serif">
          <CornerFlourish position="top-left" />
          <CornerFlourish position="bottom-right" />

          <p className="text-base md:text-lg text-[var(--color-espresso)] leading-relaxed mb-6 text-center">
            Your presence at our wedding is the greatest gift of all. However, should you wish to honor us with a gift, a monetary contribution toward our future together would be sincerely appreciated.
          </p>

          {/* Toast Notification */}
          <AnimatePresence>
            {copiedLabel && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 mx-auto max-w-sm flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[var(--color-ecru)] border border-[var(--color-warm-sand)] text-xs text-[var(--color-gold-brown)] font-sans font-semibold shadow-md text-center"
              >
                <svg className="w-4 h-4 text-[var(--color-gold-brown)] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <span>Copied {copiedLabel} to clipboard!</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4 font-sans text-xs">
            {/* MariBank Card */}
            <div className="p-4 rounded-lg bg-[var(--color-ivory)] border border-[var(--color-champagne)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[var(--color-gold-brown)] text-sm font-serif uppercase tracking-wider">MariBank</span>
                </div>
                <div className="text-[var(--color-espresso)] font-medium mt-0.5">
                  Account Name: <span className="font-bold">{details.maribank.accountName}</span>
                </div>
                <div className="text-[var(--color-espresso)] font-medium">
                  Account No: <span className="font-mono font-bold text-sm tracking-wider">{details.maribank.accountNumber}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 sm:pt-0">
                <button
                  onClick={() => copyToClipboard(details.maribank.accountNumber, "MariBank Account #")}
                  className="px-3 py-1.5 rounded-full border border-[var(--color-gold-brown)] text-[var(--color-gold-brown)] hover:bg-[var(--color-ecru)] font-semibold transition text-[11px] flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.66-2.166 1.638m9.332 0c.065.616.216 1.206.444 1.764M15.666 3.888A2.25 2.25 0 0118 6.75v9a2.25 2.25 0 01-2.25 2.25h-9A2.25 2.25 0 014.5 15.75v-9A2.25 2.25 0 016.75 3.5h9m0 0a2.25 2.25 0 012.25 2.25" />
                  </svg>
                  Copy No.
                </button>
                <button
                  onClick={() => setActiveQrModal("maribank")}
                  className="px-3 py-1.5 rounded-full bg-[var(--color-ecru)] text-[var(--color-gold-brown)] hover:bg-[var(--color-warm-sand)] font-semibold transition text-[11px] flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-1.036.84-1.875 1.875-1.875h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5A1.875 1.875 0 013.75 9.375v-4.5zM3.75 14.625c0-1.036.84-1.875 1.875-1.875h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5a1.875 1.875 0 01-1.875-1.875v-4.5zM13.5 4.875c0-1.036.84-1.875 1.875-1.875h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5A1.875 1.875 0 0113.5 9.375v-4.5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 14.625c0-1.036.84-1.875 1.875-1.875h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5a1.875 1.875 0 01-1.875-1.875v-4.5z" />
                  </svg>
                  QR Code
                </button>
              </div>
            </div>

            {/* GCash Card */}
            <div className="p-4 rounded-lg bg-[var(--color-ivory)] border border-[var(--color-champagne)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[var(--color-gold-brown)] text-sm font-serif uppercase tracking-wider">GCash</span>
                </div>
                <div className="text-[var(--color-espresso)] font-medium mt-0.5">
                  Number: <span className="font-mono font-bold text-sm tracking-wider">{details.gcash.number}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 sm:pt-0">
                <button
                  onClick={() => copyToClipboard(details.gcash.number, "GCash Number")}
                  className="px-3 py-1.5 rounded-full border border-[var(--color-gold-brown)] text-[var(--color-gold-brown)] hover:bg-[var(--color-ecru)] font-semibold transition text-[11px] flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.66-2.166 1.638m9.332 0c.065.616.216 1.206.444 1.764M15.666 3.888A2.25 2.25 0 0118 6.75v9a2.25 2.25 0 01-2.25 2.25h-9A2.25 2.25 0 014.5 15.75v-9A2.25 2.25 0 016.75 3.5h9m0 0a2.25 2.25 0 012.25 2.25" />
                  </svg>
                  Copy No.
                </button>
                <button
                  onClick={() => setActiveQrModal("gcash")}
                  className="px-3 py-1.5 rounded-full bg-[var(--color-ecru)] text-[var(--color-gold-brown)] hover:bg-[var(--color-warm-sand)] font-semibold transition text-[11px] flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-1.036.84-1.875 1.875-1.875h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5A1.875 1.875 0 013.75 9.375v-4.5zM3.75 14.625c0-1.036.84-1.875 1.875-1.875h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5a1.875 1.875 0 01-1.875-1.875v-4.5zM13.5 4.875c0-1.036.84-1.875 1.875-1.875h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5A1.875 1.875 0 0113.5 9.375v-4.5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 14.625c0-1.036.84-1.875 1.875-1.875h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5a1.875 1.875 0 01-1.875-1.875v-4.5z" />
                  </svg>
                  QR Code
                </button>
              </div>
            </div>

            {/* International Emails */}
            <div className="p-4 rounded-lg bg-[var(--color-ivory)] border border-[var(--color-champagne)] space-y-3">
              <div className="font-bold text-[var(--color-gold-brown)] text-sm font-serif uppercase tracking-wider">
                International Guests (Email Details)
              </div>
              {details.emails.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-[var(--color-champagne)]/40 pt-2">
                  <div>
                    <div className="text-[10px] text-[var(--color-soft-taupe)] uppercase tracking-wider font-semibold">
                      {item.label}
                    </div>
                    <div className="text-[var(--color-espresso)] font-mono text-xs font-semibold">
                      {item.email}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(item.email, item.label)}
                      className="px-3 py-1 rounded-full border border-[var(--color-gold-brown)] text-[var(--color-gold-brown)] hover:bg-[var(--color-ecru)] font-semibold transition text-[10px]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.66-2.166 1.638m9.332 0c.065.616.216 1.206.444 1.764M15.666 3.888A2.25 2.25 0 0118 6.75v9a2.25 2.25 0 01-2.25 2.25h-9A2.25 2.25 0 014.5 15.75v-9A2.25 2.25 0 016.75 3.5h9m0 0a2.25 2.25 0 012.25 2.25" />
                      </svg>
                      Copy
                    </button>
                    <a
                      href={`mailto:${item.email}`}
                      className="px-3 py-1 rounded-full bg-[var(--color-ecru)] text-[var(--color-gold-brown)] hover:bg-[var(--color-warm-sand)] font-semibold transition text-[10px]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                      Send Email
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Master Copy All Button */}
          <div className="mt-8 flex flex-col items-center justify-center">
              <button
                onClick={copyAllDetails}
                className="relative inline-flex items-center gap-2 px-8 py-3 rounded-full text-xs font-sans font-semibold uppercase tracking-wider text-[var(--color-ivory)] shadow transition-all duration-300 hover:scale-105 active:scale-95"
                style={{ backgroundColor: "var(--color-gold-brown)" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.002 4.002 0 00-3.09-3.09L2.25 12l2.846-.813a4.002 4.002 0 003.09-3.09L9 5.25l.813 2.846a4.002 4.002 0 003.09 3.09L15.75 12l-2.846.813a4.002 4.002 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423L16.5 15l.394 1.183a2.25 2.25 0 001.423 1.423L19.5 18.75l-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
                Copy All Gift Details
              </button>
          </div>
        </motion.div>
      </FadeInSection>

      {/* QR Code Modal Overlay */}
      <AnimatePresence>
        {activeQrModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setActiveQrModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-ivory)] p-6 rounded-2xl border border-[var(--color-champagne)] max-w-sm w-full text-center shadow-2xl relative font-sans"
            >
                <button
                  onClick={() => setActiveQrModal(null)}
                  className="absolute top-3 right-3 text-[var(--color-espresso)] hover:text-[var(--color-gold-brown)] font-bold text-lg p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

              <h3 className="text-xl font-serif text-[var(--color-gold-brown)] font-bold mb-1 uppercase tracking-wider">
                {activeQrModal === "maribank" ? "MariBank QR Code" : "GCash QR Code"}
              </h3>
              <p className="text-xs text-[var(--color-soft-taupe)] mb-4">
                Scan using your {activeQrModal === "maribank" ? "MariBank" : "GCash"} mobile app
              </p>

              {/* QR Image Placeholder / Preview */}
              <div className="w-56 h-56 mx-auto bg-white p-4 rounded-xl border border-[var(--color-champagne)] flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
                <img
                  src={`/images/${activeQrModal}-qr.png`}
                  alt={`${activeQrModal} QR Code`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to placeholder if image does not exist yet
                    e.currentTarget.style.display = "none";
                    if (e.currentTarget.nextElementSibling) {
                      e.currentTarget.nextElementSibling.style.display = "flex";
                    }
                  }}
                />
                <div className="hidden flex-col items-center justify-center text-center space-y-2 p-2">
                  <svg className="w-16 h-16 text-[var(--color-gold-brown)] opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  <p className="text-[11px] font-semibold text-[var(--color-gold-brown)]">
                    {activeQrModal === "maribank" ? "MariBank" : "GCash"} QR Placeholder
                  </p>
                  <p className="text-[9px] text-[var(--color-soft-taupe)]">
                    Upload image to <code>public/images/{activeQrModal}-qr.png</code>
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--color-champagne)]">
                <button
                  onClick={() => {
                    const val = activeQrModal === "maribank" ? details.maribank.accountNumber : details.gcash.number;
                    copyToClipboard(val, activeQrModal === "maribank" ? "MariBank Account #" : "GCash Number");
                  }}
                  className="w-full py-2 rounded-full bg-[var(--color-gold-brown)] text-[var(--color-ivory)] font-semibold text-xs shadow hover:opacity-90 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.66-2.166 1.638m9.332 0c.065.616.216 1.206.444 1.764M15.666 3.888A2.25 2.25 0 0118 6.75v9a2.25 2.25 0 01-2.25 2.25h-9A2.25 2.25 0 014.5 15.75v-9A2.25 2.25 0 016.75 3.5h9m0 0a2.25 2.25 0 012.25 2.25" />
                  </svg>
                  Copy {activeQrModal === "maribank" ? "Account No." : "GCash No."}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
