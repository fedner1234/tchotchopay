# TchotchoPay Mobile App — Designer Feedback
**From:** Fedner François, Founder  
**Date:** October 28, 2026  
**Re:** Mobile App Screen Mockups (Round 1 Review)

---

## Overall Impression

Strong start. The navy and gold color palette is on-brand and the variety of screens covered is good. Below is detailed feedback screen by screen to guide the next revision.

---

## 🟢 What's Working — Keep These

- **Splash / Logo screen** — The TchotchoPay logo centered on dark navy looks great. This is the right first impression.
- **Virtual Card screen** — The blue gradient card design looks premium and modern. This is a highlight of the designs.
- **QR Pay screen (user's own QR code)** — Clean, centered layout with the QR code prominent. Good use of white card against the background.
- **Color consistency** — Navy (#0A1F6E) and gold/yellow accent are used consistently. Keep this exact palette across all screens.
- **Bottom navigation bar** — The 4-tab nav (Home, Send, Wallet, Profile) is clear and well-positioned.

---

## 🔴 Priority Changes Needed

### 1. Onboarding / Form Screens (Row 1, Screens 2–7)
- **Problem:** The form fields look cramped and text is very small. Users filling out KYC (ID verification) need large, easy-to-tap fields.
- **Fix:** Increase field height to at least 52px, add 16px padding inside each field, and increase label font size to 14px minimum.
- **Fix:** Add more vertical spacing between form sections — at least 24px between groups.
- **Fix:** The "Continue" / "Next" button should be full-width, large (56px height), and in the gold/yellow accent color — not a small button at the bottom.

### 2. Send Money Screen
- **Problem:** The amount entry field is not prominent enough. Sending money is the core action — the amount input needs to be the hero of this screen.
- **Fix:** Make the amount input extra large (font size 40–48px) centered on screen, similar to Cash App or Venmo's style.
- **Fix:** Show the estimated arrival time and fee clearly below the amount (e.g., "Arrives in ~2 min · Fee: $2.99").

### 3. Wallet / Home Dashboard (Row 2, Screen 1)
- **Problem:** The balance display could be more impactful.
- **Fix:** Show the USDC balance in large bold text at the top with a "≈ $X USD" conversion below it in smaller gray text.
- **Fix:** The transaction history list rows need more spacing — at least 64px per row — so they're easy to tap.

### 4. Top-Up Screen
- **Problem:** Country/carrier selection looks like a plain list. 
- **Fix:** Use flag emoji + carrier logo chips (pill-shaped buttons) so the user can tap their country/carrier quickly. Haiti 🇭🇹 should always be first.

### 5. QR Scanner Screen (Row 3, Screens 4–6)
- **Problem:** These screens look slightly different in style from the rest of the app — the camera viewfinder frame is generic.
- **Fix:** Add the TchotchoPay navy color to the corner brackets of the scan frame. Add a short instruction text below: "Point your camera at a TchotchoPay QR code."
- **Fix:** Make sure the background behind the viewfinder is dark/dimmed, not white.

### 6. Analytics / Stats Screen (Row 3, Last Screen)
- **Problem:** The bar chart screen looks generic and could belong to any app.
- **Fix:** Add "TchotchoPay" branding to this screen. Include the user's name at the top and label the chart clearly (e.g., "Money Sent — Last 30 Days").
- **Fix:** Use the brand navy and gold colors for the chart bars, not generic blue/gray.

---

## 🟡 General Polish Notes (Apply to All Screens)

| Item | Requirement |
|------|-------------|
| **Font** | Use a single clean sans-serif — Inter, DM Sans, or Poppins. No mixing font styles. |
| **Button style** | Primary buttons: gold/yellow background, navy text, 56px height, 12px border radius, full width. Secondary buttons: white background, navy border and text. |
| **Icons** | Use a consistent icon set throughout — recommend Phosphor Icons or Lucide. Do not mix icon styles. |
| **Status bar** | Show iPhone status bar (time, signal, battery) at the top of every screen in white text — this makes it look like a real app. |
| **Error states** | Please include at least one error state design — e.g., "Invalid phone number" shown in red below the input field. |
| **Loading state** | Include a loading spinner design for when the app is processing a transfer. |
| **Empty state** | Show what the transaction history looks like when there are no transactions yet (first-time user). |
| **Typography sizing** | Minimum body text: 14px. Minimum label text: 12px. Never go smaller than 12px on any text. |
| **Touch targets** | All tappable elements must be at least 44×44px — this is Apple's minimum guideline. |

---

## 📱 Screens Still Missing — Please Add

1. **Identity Verification (KYC) locked screen** — When user hasn't verified yet, show a lock icon 🔒 with "Verify your identity to unlock this feature" and a "Verify Now" button. This is needed for Send Money, Wallet, QR Pay, and Top-Up.
2. **Transfer Confirmation screen** — After entering amount and recipient, show a summary: "You send $100 → Marie receives 100 USDC. Fee: $2.99. Tap Confirm to send."
3. **Success screen** — After a transfer completes, show a full-screen success animation (checkmark ✅, confetti, or similar) with the transfer details.
4. **Cash Out / Withdraw screen** — User selects: withdraw to local bank, agent pickup, or convert to HTG.
5. **Notification / Alert screen** — What does an incoming payment notification look like?
6. **Referral screen** — "Invite friends, earn rewards" with the user's referral code and a share button.

---

## 📋 Deliverable Request for Next Round

Please deliver the next revision as:
- **Figma file** with all screens in a single page, organized by flow (Onboarding → Home → Send Money → Wallet → Top-Up → QR Pay → Settings)
- **Export** each screen as PNG at 3x resolution
- **Component library** showing buttons, inputs, cards, and icons used

---

## Contact

Questions? Reach out to: fednerfrancois@yahoo.com  
App reference: The existing Expo React Native app code is available for technical specifications.

---

*Thank you — the foundation is strong. These changes will take it from good to excellent.*
