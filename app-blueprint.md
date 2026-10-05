# Tchotcho Pay — Complete App Blueprint
*Step by step from idea to App Store. Follow this in order.*

---

## PHASE 1 — LEGAL FOUNDATION
**Timeline: Week 1–2**
**Do this before anything else. Partners won't talk to you without it.**

### Step 1 — Form your LLC
- Go to stripe.com/atlas → $500 → forms a Delaware C-Corp instantly
- OR go to your state Secretary of State website → file LLC → $90–125
- Get your **Articles of Incorporation** document (you'll need this for every partner)
- Recommended: **Delaware C-Corp** if you plan to raise investment
- Recommended: **Wyoming LLC** if you want cheapest and simplest

### Step 2 — Get your EIN (Free, same day)
- Go to irs.gov/ein
- Apply online → takes 10 minutes
- You get your EIN number immediately
- Save it — every partner application asks for it

### Step 3 — Open a business bank account
- Go to mercury.com → apply online → free → no minimum balance
- Deposit at least $500 to show you're serious
- Get your business bank account number and routing number
- You'll need these for partner applications

### Step 4 — Register your trademark (optional but smart)
- Go to uspto.gov → search "Tchotcho Pay" → file trademark
- Cost: $250 per class
- Protects your brand name legally

---

## PHASE 2 — PARTNER APPLICATIONS
**Timeline: Week 2–4 (apply to all at once — they all take time)**
**You need: LLC docs + EIN + business bank account before applying**

### Step 5 — Apply to Stripe (Payments + Card Issuing)
- Go to stripe.com → create account with business email
- Go to stripe.com/issuing → apply for Stripe Issuing (Visa card)
- Go to stripe.com/connect → apply for Stripe Connect (marketplace)
- **What to say:** "We are building a remittance platform for the Haitian diaspora. We need Stripe Payments for deposits and Stripe Issuing for virtual Visa Debit cards."
- **Timeline:** 3–7 days for approval
- **Cost:** No monthly fee, pay per transaction

### Step 6 — Apply to Plaid (Bank Verification)
- Go to plaid.com/contact → "Get API Access"
- Select: Financial Services → Payments
- **What to say:** "We need Plaid to verify US bank accounts for ACH deposits into our remittance platform."
- **Timeline:** 3–5 days
- **Cost:** Free sandbox, pay per API call in production

### Step 7 — Apply to Bridge (USDC/Stablecoin)
- Go to bridge.xyz → click "Get Started"
- **What to say:** "We are building a remittance app for Haiti using USDC on Base blockchain. We need Bridge to convert USD to USDC and manage user wallets."
- **Timeline:** 1–3 weeks
- **Cost:** Per transaction fee (small %)

### Step 8 — Apply to Unit or Synctera (Banking Infrastructure)
This is your most important and longest application.

**Unit (unit.co):**
- Go to unit.co → "Get Started"
- Apply for: Deposit Accounts + KYC/AML + Compliance
- **What to say:** "We are building a fintech platform for Haitian diaspora remittances. We need Unit for FDIC-insured accounts, KYC verification, and AML compliance. We have X users on our waitlist."
- **Timeline:** 8–16 weeks (longest wait)
- **Cost:** Monthly platform fee + per account fee

**Synctera (synctera.com):**
- Alternative to Unit, similar product
- Apply at synctera.com/get-started
- **Timeline:** 8–12 weeks

> Apply to BOTH Unit and Synctera at the same time. Go with whoever approves you first.

### Step 9 — Apply to Reloadly (Haiti Top-Up)
- Go to reloadly.com → create account
- **What to say:** "We need Reloadly to power mobile top-ups for Digicel and Natcom in Haiti inside our remittance app."
- **Timeline:** 1–3 days (easiest approval)
- **Cost:** Per transaction fee

### Step 10 — Contact MonCash (Haiti Cash-Out)
- Email: partnerships@digicelgroup.com
- Subject: "Partnership Inquiry — Tchotcho Pay Cash-Out Network"
- **What to say:** "We are building a USDC remittance platform for the Haitian diaspora. We want to partner with MonCash to offer cash-out services to recipients in Haiti. We have [X] users on our waitlist and are launching in Q[X] 2026."
- **Timeline:** 2–8 weeks to get a response
- **Backup:** Build your own agent network via agent-signup.html while you wait

---

## PHASE 3 — FIREBASE SETUP
**Timeline: Week 2–3 (do this while waiting for partner approvals)**

### Step 11 — Create Firebase Project
- Go to firebase.google.com
- Click "Create a project" → name it "tchotchopay"
- Enable these services:
  - **Authentication** (email/password + phone OTP)
  - **Firestore Database** (store users, transactions, cards)
  - **Storage** (profile photos, KYC documents)
  - **Cloud Functions** (for API webhooks)

### Step 12 — Connect Firebase to FlutterFlow
- In FlutterFlow → Settings → Firebase
- Click "Connect to Firebase"
- Follow the steps to link your Firebase project
- FlutterFlow will auto-generate your database rules

### Step 13 — Set up Firestore Collections
Create these collections in Firebase:
- `users` — user profiles
- `transactions` — all transfers, top-ups, payments
- `cards` — virtual and physical card records
- `recipients` — saved recipients
- `notifications` — push notification log

---

## PHASE 4 — BUILD THE APP IN FLUTTERFLOW
**Timeline: Week 3–12**
**Build in this exact order — each phase is a working milestone**

### MILESTONE 1 — Shell (Week 3)
- [ ] Theme set up (colors + fonts) ✅ Done
- [ ] SplashScreen ✅ In progress
- [ ] Bottom navigation bar (5 tabs)
- [ ] Placeholder screens for all 5 tabs
- [ ] Firebase connected

### MILESTONE 2 — Auth Flow (Week 4)
- [ ] Onboarding screen (3 slides, swipeable)
- [ ] Sign Up Step 1 — Name + Email + Password
- [ ] Sign Up Step 2 — Phone OTP verification
- [ ] Sign Up Step 3 — Country + Date of Birth
- [ ] Login screen
- [ ] Forgot Password screen
- [ ] Firebase Auth connected (email + phone)
- [ ] After login → navigate to Home tab

### MILESTONE 3 — Wallet Dashboard (Week 5)
- [ ] Home/Dashboard screen
- [ ] USDC balance card (large, center)
- [ ] 4 quick action buttons (Add, Send, Convert, Cash Out)
- [ ] Recent transactions list (pull from Firestore)
- [ ] Transaction detail screen
- [ ] Notifications screen

### MILESTONE 4 — Send Money Flow (Week 6–7)
- [ ] Send — Enter Amount screen (number pad)
- [ ] Send — Choose Recipient screen (search + recent)
- [ ] Send — Review & Confirm screen
- [ ] Send — Success screen (animation)
- [ ] Save recipients to Firestore
- [ ] Connect Bridge API (USDC transfer)

### MILESTONE 5 — Add Funds (Week 7)
- [ ] Add Funds screen
- [ ] Debit/credit card input (Stripe)
- [ ] Bank transfer (Plaid Link)
- [ ] Connect Stripe API
- [ ] Connect Plaid API

### MILESTONE 6 — Visa Card (Week 8)
- [ ] Card Dashboard screen
- [ ] 3D card flip animation
- [ ] Card details (masked number, CVV reveal)
- [ ] Freeze/unfreeze toggle
- [ ] Card transactions list
- [ ] Connect Stripe Issuing API

### MILESTONE 7 — Marketplace (Week 9)
- [ ] Marketplace home (category grid)
- [ ] Mobile Top-Up screen
- [ ] Bill Pay screen
- [ ] QR Code scanner (pay merchants)
- [ ] Connect Reloadly API (top-ups)

### MILESTONE 8 — KYC + Profile (Week 10)
- [ ] KYC screen — ID upload (front + back)
- [ ] Selfie capture screen
- [ ] Connect Unit/Synctera KYC API
- [ ] Profile home screen
- [ ] Edit profile
- [ ] Security settings (PIN, biometrics)
- [ ] Referral screen

### MILESTONE 9 — Cash Out (Week 11)
- [ ] Cash Out screen
- [ ] Options: Bank transfer / Agent / HTG conversion
- [ ] Connect MonCash API or agent network
- [ ] Confirmation + receipt

### MILESTONE 10 — Polish (Week 12)
- [ ] Lottie animations on all success screens
- [ ] Error states on every screen
- [ ] Empty states on all lists
- [ ] Loading states on all API calls
- [ ] Push notifications (OneSignal)
- [ ] App icon (1024×1024 PNG)
- [ ] Splash screen asset
- [ ] Test on real iPhone and Android device

---

## PHASE 5 — TESTING
**Timeline: Week 13–14**

### Step 14 — Internal Testing
- Use FlutterFlow's built-in preview on your phone
- Test every flow end to end:
  - Sign up → KYC → Add funds → Send money → Receive → Cash out
- Fix all bugs before external testing

### Step 15 — Beta Testing (TestFlight + Google Play Beta)
- Add 20–50 beta testers from your waitlist
- iOS: submit to TestFlight (Apple's beta platform)
- Android: submit to Google Play Internal Testing
- Collect feedback, fix issues
- Run for 2–4 weeks

---

## PHASE 6 — APP STORE SUBMISSION
**Timeline: Week 15–16**

### Step 16 — Apple App Store
- Create Apple Developer account: developer.apple.com → $99/year
- Prepare:
  - App icon: 1024×1024 PNG
  - Screenshots: 6.7" iPhone size
  - App description (use text from your website)
  - Privacy policy URL: tchotchopay.com/terms
- Submit for review → Apple takes 1–3 days
- **Category:** Finance
- **Age rating:** 17+

### Step 17 — Google Play Store
- Create Google Play Developer account: play.google.com/console → $25 one-time
- Prepare:
  - Same icon and screenshots
  - Feature graphic: 1024×500 PNG
- Submit for review → Google takes 1–3 days

---

## PHASE 7 — LAUNCH
**Timeline: Month 5–6**

### Step 18 — Soft Launch (invite only)
- Send Email 4 from your email sequence to waitlist
- Invite first 500 users only
- Monitor transactions, fix issues
- Make sure KYC, sending, and cash-out all work end to end

### Step 19 — Public Launch
- Open to all users
- Send press release to Haitian Times, Fintech Nexus, TechCrunch
- Post social media content from your social media kit
- Run referral program

### Step 20 — Growth
- Activate Zoho Campaigns email automation
- Start paid social ads (Instagram + Facebook, Haitian diaspora targeting)
- Recruit more agents in Haiti
- Apply to fintech accelerators (Y Combinator, Techstars Fintech)

---

## COMPLETE CHECKLIST

### Legal ✅
- [ ] LLC/Corp formed
- [ ] EIN obtained
- [ ] Business bank account opened
- [ ] Trademark filed

### Partners ✅
- [ ] Stripe approved
- [ ] Plaid approved
- [ ] Bridge approved
- [ ] Unit OR Synctera approved
- [ ] Reloadly account active
- [ ] MonCash partnership signed

### Tech ✅
- [ ] Firebase project set up
- [ ] FlutterFlow app built (all 10 milestones)
- [ ] All APIs connected and tested
- [ ] Apple Developer account created
- [ ] Google Play account created

### Marketing ✅
- [ ] Website live (tchotchopay.com) ✅ Done
- [ ] Zoho email sequence active
- [ ] Social media accounts created
- [ ] Canva templates built
- [ ] Press release ready

### Launch ✅
- [ ] Beta testing complete
- [ ] App Store approved
- [ ] Google Play approved
- [ ] Soft launch to waitlist
- [ ] Public launch

---

## ESTIMATED COSTS TO LAUNCH

| Item | Cost |
|------|------|
| LLC formation | $90–500 |
| Apple Developer | $99/year |
| Google Play | $25 one-time |
| FlutterFlow | $30–70/month |
| Firebase | Free to start |
| Unit/Synctera | $500–2,000/month |
| Stripe | Per transaction only |
| Plaid | Per API call |
| Bridge | Per transaction |
| Mercury bank | Free |
| **Total to launch** | **~$1,000–3,000** |

---

## TIMELINE SUMMARY

| Month | What happens |
|-------|-------------|
| Month 1 | LLC + EIN + bank + apply to all partners |
| Month 2 | Build FlutterFlow Milestones 1–5 |
| Month 3 | Build FlutterFlow Milestones 6–10 |
| Month 4 | Partners approve, connect APIs, internal testing |
| Month 5 | Beta testing, App Store submission |
| Month 6 | 🚀 PUBLIC LAUNCH |

---

*Tchotcho Pay — Lajan an nan men nou 🇭🇹*
*tchotchopay.com · hello@tchotchopay.com*
