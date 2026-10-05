# Tchotcho Pay — FlutterFlow App Spec
*Complete screen-by-screen blueprint for iOS & Android*

---

## DESIGN SYSTEM

### Colors (add to FlutterFlow Theme)
| Token | Hex | Use |
|-------|-----|-----|
| Primary (Navy) | `#020B2D` | All backgrounds |
| Secondary (Blue) | `#0A1F6E` | Cards, panels |
| Brand Blue | `#1055CC` | Buttons secondary |
| Cyan | `#00AEEF` | Primary buttons, links, highlights |
| Light Cyan | `#7FD4F7` | Subtext, icons |
| White | `#F0F6FF` | Body text |
| Gray | `#8FA8CC` | Placeholder text |
| Green | `#00C896` | Success, money received, available |
| Red | `#FF4C6A` | Errors, alerts |
| Gold | `#F7B731` | Badges, coming soon, warnings |

### Typography (add to FlutterFlow Theme)
| Style | Font | Size | Weight |
|-------|------|------|--------|
| Display | Poppins | 28px | Bold |
| Heading 1 | Poppins | 22px | SemiBold |
| Heading 2 | Poppins | 18px | SemiBold |
| Body | Inter | 15px | Regular |
| Body Small | Inter | 13px | Regular |
| Label | Inter | 12px | Medium |
| Button | Poppins | 16px | Bold |

### Component Defaults
- Button border radius: 12px
- Card border radius: 16px
- Input border radius: 10px
- Bottom nav height: 64px
- Page padding: 20px horizontal

---

## APP ARCHITECTURE

### Navigation Structure
```
App
├── Auth Flow (not logged in)
│   ├── Splash Screen
│   ├── Onboarding (3 slides)
│   ├── Sign Up Flow
│   │   ├── Step 1 — Name + Email + Password
│   │   ├── Step 2 — Phone Verification (OTP)
│   │   ├── Step 3 — Country + Date of Birth
│   │   └── Step 4 — ID Verification (KYC)
│   └── Login
│       ├── Email + Password
│       └── Forgot Password
│
└── Main App (logged in)
    ├── Bottom Nav
    │   ├── 🏠 Home (Dashboard)
    │   ├── 💸 Send
    │   ├── 💳 Card
    │   ├── 🛒 Market
    │   └── 👤 Profile
    │
    ├── Home Tab
    │   ├── Dashboard
    │   ├── Add Funds
    │   ├── Transaction Detail
    │   └── Notifications
    │
    ├── Send Tab
    │   ├── Send Money — Enter Amount
    │   ├── Send Money — Choose Recipient
    │   ├── Send Money — Review & Confirm
    │   ├── Send Money — Success
    │   └── Transaction History
    │
    ├── Card Tab
    │   ├── Card Dashboard
    │   ├── Card Details (flip animation)
    │   ├── Card Freeze/Unfreeze
    │   └── Card Transactions
    │
    ├── Market Tab
    │   ├── Marketplace Home
    │   ├── Mobile Top-Up
    │   ├── Bill Pay
    │   ├── Merchant Pay (QR)
    │   └── Order Confirmation
    │
    └── Profile Tab
        ├── Profile Home
        ├── Edit Profile
        ├── KYC Status
        ├── Security Settings
        ├── Referral Program
        ├── Help & Support
        └── Logout
```

---

## SCREEN SPECS

---

### SCREEN 1 — SPLASH SCREEN
**Route:** `/splash`
**Duration:** 2 seconds, then auto-navigate

**Layout:**
- Full screen background: Navy `#020B2D`
- Center: Tchotcho Pay logo (image asset), 160px wide
- Below logo: "lajan an nan men nou" — Inter Regular, 14px, Gray
- Bottom: loading indicator (cyan, small)

**Logic:**
- On load: check if user is logged in
- If logged in → navigate to `/home`
- If not → navigate to `/onboarding`

---

### SCREEN 2 — ONBOARDING
**Route:** `/onboarding`
**Type:** PageView (swipeable, 3 slides)

**Slide 1:**
- Illustration: money flying to Haiti (use Lottie animation or PNG)
- Headline: "Send Money to Haiti Instantly"
- Body: "Under 3% fees. Arrives in 60 seconds. Available 24/7."

**Slide 2:**
- Illustration: USDC coin / wallet
- Headline: "Save in Digital Dollars"
- Body: "Hold USDC — stable, secure, protected from inflation."

**Slide 3:**
- Illustration: Visa card
- Headline: "Spend Anywhere with Your Visa Card"
- Body: "Virtual card available now. Physical card coming soon."

**Bottom of all slides:**
- Dot indicator (3 dots, active = cyan)
- "Get Started" button → `/signup` (shown on slide 3, hidden on 1 & 2)
- "Skip" text link → `/signup` (shown on slides 1 & 2)
- "Already have an account? Log in" → `/login`

---

### SCREEN 3 — SIGN UP — STEP 1
**Route:** `/signup/step1`

**Fields:**
- First Name (text input, required)
- Last Name (text input, required)
- Email (email input, required, validate format)
- Password (password input, min 8 chars, show/hide toggle)
- Confirm Password (must match)

**Bottom:**
- "Continue" button (cyan, full width) → validates then goes to Step 2
- Progress indicator: Step 1 of 4, cyan bar at top

**Validation errors shown inline below each field in red.**

---

### SCREEN 4 — SIGN UP — STEP 2 (Phone OTP)
**Route:** `/signup/step2`

**Fields:**
- Phone number input with country flag selector (+1 US default)
- "Send Code" button

**After code sent:**
- 6-digit OTP input (6 boxes, auto-advance)
- Countdown timer "Resend in 0:59"
- "Resend Code" link (appears after timer)

**Bottom:**
- "Verify" button → validates OTP → goes to Step 3
- Back arrow top-left

---

### SCREEN 5 — SIGN UP — STEP 3 (Personal Info)
**Route:** `/signup/step3`

**Fields:**
- Date of Birth (date picker, must be 18+)
- Country of Residence (dropdown: US, Canada, France, Other)
- Referral code (optional text input)

**Bottom:**
- "Continue" button → Step 4

---

### SCREEN 6 — SIGN UP — STEP 4 (KYC / ID Verification)
**Route:** `/signup/step4`

**Layout:**
- Header: "Verify Your Identity"
- Subtext: "Required by law. Takes 2 minutes. Your data is encrypted."

**Options (card buttons):**
- 📄 Government ID (Passport, Driver's License, National ID)
- 🤳 Take a selfie

**Flow:**
- User taps "Government ID" → camera opens → front of ID → back of ID
- User taps "Selfie" → front camera opens → capture
- Both uploaded → show "Under Review" state
- Status: Pending / Approved / Rejected (stored in user profile)

**Bottom:**
- "Submit for Review" button
- Note: "Most reviews complete in under 5 minutes"

**API:** Connect to Unit or Synctera KYC API

---

### SCREEN 7 — LOGIN
**Route:** `/login`

**Fields:**
- Email input
- Password input (show/hide)

**Bottom:**
- "Log In" button (cyan, full width)
- "Forgot Password?" link → `/forgot-password`
- "Don't have an account? Sign Up" → `/signup`

**Biometrics:**
- If device supports Face ID / Touch ID: show biometric prompt on load after first login

---

### SCREEN 8 — FORGOT PASSWORD
**Route:** `/forgot-password`

**Fields:**
- Email input

**Flow:**
- Enter email → "Send Reset Link" button
- Success state: "Check your email for a reset link"

---

### SCREEN 9 — HOME / DASHBOARD
**Route:** `/home`
**Bottom Nav:** Tab 1

**Layout (scroll view):**

**Header (sticky):**
- Left: "Good morning, [First Name] 👋" — Poppins SemiBold 18px
- Right: Bell icon (notifications badge if unread)

**Balance Card:**
- Full-width card, gradient background (Navy → Blue)
- "USDC Balance" label — Gray, 13px
- Balance amount: "$247.50 USDC" — Poppins Bold 32px, White
- "≈ $247.50 USD" — Gray, 13px
- Row of 4 quick action buttons below:
  - [➕ Add] [💸 Send] [🔄 Convert] [📤 Cash Out]
  - Each: circular icon button, 56px, Blue background, Cyan icon

**KYC Banner** (show only if KYC not complete):
- Yellow/Gold banner: "⚠️ Verify your identity to unlock all features" → taps to KYC screen

**Recent Transactions (last 5):**
- Section header: "Recent Activity" + "See All" link → `/transactions`
- Each row:
  - Left: icon (green arrow up = sent, green arrow down = received)
  - Center: "Sent to Marie J." + date/time
  - Right: "-$50.00" (red) or "+$100.00" (green)

**Quick Send (if contacts saved):**
- Horizontal scroll of avatar bubbles with name below
- "+" bubble to add new recipient

---

### SCREEN 10 — ADD FUNDS
**Route:** `/add-funds`
**Accessed from:** Dashboard quick action [➕ Add]

**Options (card selection):**

**Debit / Credit Card**
- Card number input (with card type icon auto-detection: Visa/MC)
- Expiry + CVV
- Amount input with currency selector
- Fee shown: "2.5% card fee — $2.50"
- Total shown: "$102.50"
- "Add Funds" button

**Bank Transfer (ACH)**
- "Connect your bank" — Plaid Link integration
- After bank connected: show bank name + account ending
- Amount input
- Fee shown: "Free"
- Note: "ACH transfers take 1 business day"
- "Transfer Funds" button

**API:** Stripe (card) + Plaid (ACH)

---

### SCREEN 11 — SEND MONEY — ENTER AMOUNT
**Route:** `/send/amount`
**Bottom Nav:** Tab 2

**Layout:**
- Header: "Send Money to Haiti"
- Large number pad (calculator style)
- Amount display: "$0.00" — Poppins Bold 40px, center
- Below: "Recipient gets: 0.00 USDC" (updates live as user types)
- Fee line: "Fee: $0.00 (≤ 3%)" — Gray, 13px
- Exchange rate: "1 USD = 1 USDC = ~130.50 HTG" — Gray, 12px
- "Continue" button (disabled until amount > $1)

---

### SCREEN 12 — SEND MONEY — CHOOSE RECIPIENT
**Route:** `/send/recipient`

**Tabs:**
- Recent | Contacts | New

**Recent tab:**
- List of recent recipients (avatar + name + last sent date)
- Tap to select

**Contacts tab:**
- Search bar
- Alphabet-indexed list of saved contacts

**New tab:**
- "Send by Phone Number" — phone input with country flag
- "Send by Username" — @username input
- "Send by QR Code" — opens camera to scan QR

**Selected recipient shows:**
- Avatar + name at top
- "Send to [Name]?" confirmation chip

---

### SCREEN 13 — SEND MONEY — REVIEW & CONFIRM
**Route:** `/send/review`

**Layout (summary card):**
- "Review Transfer"
- You send: $100.00 USD
- Fee: $2.50 (2.5%)
- Recipient gets: $97.50 USDC
- To: Marie Jean — +509 XXXX XXXX
- Estimated arrival: Instant

**PIN / Biometric confirmation:**
- "Confirm with Face ID" or 6-digit PIN entry

**"Confirm & Send" button (cyan, full width)**

---

### SCREEN 14 — SEND MONEY — SUCCESS
**Route:** `/send/success`

**Layout:**
- Lottie animation: green checkmark / confetti
- "Transfer Complete! 🎉"
- "Marie Jean received $97.50 USDC"
- Transaction ID: #TCP-83920
- Share receipt button (generates image to share via WhatsApp)
- "Send Another" button
- "Back to Home" button

---

### SCREEN 15 — TRANSACTION HISTORY
**Route:** `/transactions`

**Layout:**
- Search bar at top
- Filter chips: All | Sent | Received | Card | Top-Up | Bills
- Date-grouped list:
  - Today
  - Yesterday
  - This Week
  - Older

**Each transaction row:**
- Icon (type-based)
- Title + subtitle (e.g., "Sent to Marie J." + "Instant transfer")
- Amount (red = debit, green = credit)
- Status badge (Completed / Pending / Failed)
- Tap → Transaction Detail screen

---

### SCREEN 16 — TRANSACTION DETAIL
**Route:** `/transactions/:id`

**Layout:**
- Amount (large, top center)
- Status badge
- Details list:
  - Date & Time
  - Transaction ID
  - From / To
  - Fee charged
  - Method (USDC on Base)
  - Reference number
- "Download Receipt" button (PDF)
- "Report an Issue" link → contact form

---

### SCREEN 17 — CARD DASHBOARD
**Route:** `/card`
**Bottom Nav:** Tab 3

**Layout:**

**3D Card Visual:**
- Animated card (front/back flip on tap)
- Front: Tchotcho Pay Visa design, user name, last 4 digits
- Back: CVV (hidden by default, tap eye to reveal)
- "Virtual Card" green badge

**Card Actions Row:**
- [❄️ Freeze] [📋 Details] [⚙️ Settings]

**Card Info:**
- Card number: •••• •••• •••• 4821 (tap to copy)
- Expiry: 12/28
- CVV: ••• (tap to reveal)
- Billing address

**Spending Limit:**
- Progress bar: "$247 of $500 daily limit used"

**Recent Card Transactions:**
- Last 5 card transactions
- "See All" → filtered transaction history

**Physical Card Banner** (if not ordered):
- Gold card: "Physical card coming soon — Join the waitlist"

---

### SCREEN 18 — MARKETPLACE HOME
**Route:** `/market`
**Bottom Nav:** Tab 4

**Layout:**

**Header:** "Haitian Marketplace 🇭🇹"
**Subtext:** "Pay for services in Haiti with your USDC"

**Category Grid (2 columns):**
- 📱 Mobile Top-Up (Digicel / Natcom)
- ⚡ Electricity (EDH)
- 🎓 School Fees
- 🏥 Healthcare
- 🛒 Local Merchants
- 📦 Delivery
- 🚌 Transportation
- 💧 Water Bill

Each category: rounded card, icon, label, Navy background with Cyan border

**Featured Merchants** (horizontal scroll):
- Merchant logo + name + "Pay with USDC"

---

### SCREEN 19 — MOBILE TOP-UP
**Route:** `/market/topup`

**Fields:**
- Provider selection: [Digicel] [Natcom] (toggle chips)
- Haiti phone number input (+509 prefix, 8 digits)
- Amount selector: $5 / $10 / $15 / $20 / Custom
- "Your USDC Balance: $247.50"
- Fee: $0.15 (1%)
- "Top-Up Now" button

**Success:**
- "📱 $10 added to +509 XXXX XXXX"
- SMS confirmation sent

**API:** Digicel/Natcom top-up API (via a top-up aggregator like Reloadly)

---

### SCREEN 20 — BILL PAY
**Route:** `/market/billpay`

**Fields:**
- Bill type dropdown: Electricity (EDH) / Water / Other
- Account/meter number input
- Amount input
- "Your USDC Balance: $247.50"
- "Pay Bill" button

**Confirmation:**
- "✅ EDH Bill paid — $25.00"
- Receipt downloadable

---

### SCREEN 21 — QR PAYMENT (MERCHANT PAY)
**Route:** `/market/qr`

**Layout:**
- Camera view (full screen) for scanning merchant QR code
- OR "Show My QR" tab → displays user's personal QR code
- After scan: show merchant name + amount + "Confirm Payment"

---

### SCREEN 22 — PROFILE HOME
**Route:** `/profile`
**Bottom Nav:** Tab 5

**Layout:**
- Avatar (initials circle if no photo) + Name + email
- KYC Status badge (Verified ✅ / Pending ⏳ / Unverified ⚠️)
- USDC Balance (small)

**Menu List:**
- 👤 Edit Profile → `/profile/edit`
- 🔐 Security & PIN → `/profile/security`
- 🪙 KYC Status → `/profile/kyc`
- 🎁 Refer & Earn → `/profile/referral`
- 📊 Statements → `/transactions`
- ❓ Help & Support → `/profile/help`
- 📄 Terms & Privacy → webview of tchotchopay.com/terms
- 🌐 Language → EN / HT / FR selector
- 🚪 Log Out (red text)

---

### SCREEN 23 — SECURITY SETTINGS
**Route:** `/profile/security`

**Options:**
- Change Password
- Change PIN (6-digit)
- Face ID / Touch ID toggle
- 2-Factor Authentication toggle
- Active Sessions (list, revoke option)
- "Freeze Account" (emergency, locks everything)

---

### SCREEN 24 — REFERRAL PROGRAM
**Route:** `/profile/referral`

**Layout:**
- "Refer a Friend, Earn $10 🎁"
- Your referral code: TCP-FEDNER (tap to copy)
- Share buttons: WhatsApp | iMessage | Copy Link
- Earnings: "You've earned $0 from 0 referrals"
- Rules: "Both you and your friend earn $10 when they send their first transfer"
- Referral history list

---

### SCREEN 25 — NOTIFICATIONS
**Route:** `/notifications`

**Each notification:**
- Icon (type-based: money, card, system)
- Title + body
- Timestamp
- Unread = bold + cyan dot

**Types:**
- 💸 "Marie received your $97.50"
- 💳 "Card used at Amazon — $23.40"
- ⚠️ "Your KYC verification is complete"
- 🎁 "Your referral earned you $10"

---

## DATA MODELS (FlutterFlow Collections)

### Users Collection
```
- uid (string, primary key)
- firstName (string)
- lastName (string)
- email (string)
- phone (string)
- country (string)
- dateOfBirth (date)
- kycStatus (enum: pending, approved, rejected)
- usdcBalance (double)
- referralCode (string)
- referredBy (string)
- createdAt (timestamp)
- profilePhotoUrl (string)
```

### Transactions Collection
```
- txId (string)
- userId (string, ref → Users)
- type (enum: send, receive, topup, billpay, card, cashout)
- amount (double)
- fee (double)
- currency (string: USDC)
- status (enum: pending, completed, failed)
- recipientId (string)
- recipientName (string)
- recipientPhone (string)
- note (string)
- createdAt (timestamp)
- blockchain_txHash (string)
```

### Recipients Collection
```
- recipientId (string)
- userId (string, ref → Users)
- name (string)
- phone (string)
- username (string)
- avatarUrl (string)
- lastSentAt (timestamp)
- totalSent (double)
```

### Cards Collection
```
- cardId (string)
- userId (string, ref → Users)
- type (enum: virtual, physical)
- status (enum: active, frozen, cancelled)
- last4 (string)
- expiry (string)
- billingAddress (map)
- createdAt (timestamp)
- dailyLimit (double)
- dailySpent (double)
```

---

## API INTEGRATIONS

| Service | What it does | FlutterFlow integration |
|---------|-------------|------------------------|
| **Firebase Auth** | Login, signup, OTP, password reset | Built into FlutterFlow |
| **Firestore** | Store users, transactions, cards | Built into FlutterFlow |
| **Stripe** | Card deposits, Stripe Issuing (virtual card) | Custom API call |
| **Plaid** | Bank account verification + ACH | Custom API call |
| **Bridge** | USDC wallet creation, USD→USDC conversion | Custom API call |
| **Unit/Synctera** | KYC verification, compliance | Custom API call |
| **Reloadly** | Haiti mobile top-up (Digicel/Natcom) | Custom API call |
| **OneSignal** | Push notifications | FlutterFlow plugin |
| **Lottie** | Animations (success, loading) | FlutterFlow plugin |

**In FlutterFlow:** Add each external API under Settings → API Calls → Add API Call. Define the endpoint, headers (Authorization: Bearer [key]), body, and response fields.

---

## FLUTTERFLOW BUILD ORDER

Build screens in this order — each phase is usable:

### Phase 1 — Foundation (Week 1–2)
- [ ] Set up theme (colors, fonts, components)
- [ ] Splash Screen
- [ ] Onboarding (3 slides)
- [ ] Login screen
- [ ] Sign Up Step 1–3 (no KYC yet)
- [ ] Firebase Auth connected
- [ ] Bottom nav shell (all 5 tabs, placeholder content)

### Phase 2 — Core Wallet (Week 3–4)
- [ ] Dashboard / Home screen
- [ ] Balance card component
- [ ] Transaction history list
- [ ] Transaction detail screen
- [ ] Firestore connected for transactions
- [ ] Notifications screen

### Phase 3 — Send Money (Week 5–6)
- [ ] Send — Enter Amount screen
- [ ] Send — Choose Recipient screen
- [ ] Send — Review screen
- [ ] Send — Success screen
- [ ] Recipient contacts (save/load from Firestore)
- [ ] Bridge API connected (USDC transfer)

### Phase 4 — Card (Week 7)
- [ ] Card Dashboard
- [ ] 3D card flip animation
- [ ] Card details (masked number, CVV reveal)
- [ ] Card freeze toggle
- [ ] Stripe Issuing API connected

### Phase 5 — Marketplace (Week 8)
- [ ] Marketplace home grid
- [ ] Mobile Top-Up screen
- [ ] Bill Pay screen
- [ ] QR scanner screen
- [ ] Reloadly API connected

### Phase 6 — KYC + Profile (Week 9–10)
- [ ] KYC Step 4 — ID upload
- [ ] Unit/Synctera KYC API connected
- [ ] Profile home
- [ ] Edit profile
- [ ] Security settings
- [ ] Referral screen
- [ ] Add Funds (Stripe card + Plaid ACH)

### Phase 7 — Polish + Launch (Week 11–12)
- [ ] Lottie animations on success screens
- [ ] Push notifications (OneSignal)
- [ ] Error states on all screens
- [ ] Empty states on all lists
- [ ] Loading states on all API calls
- [ ] App icon + splash screen assets
- [ ] App Store screenshots
- [ ] Submit to App Store + Google Play

---

## APP STORE REQUIREMENTS

**App icon:** 1024 × 1024 px PNG (no transparency, no rounded corners — Apple adds them)
**Splash screen:** 1242 × 2688 px (iPhone) + multiple sizes
**Screenshots:** 6.7" iPhone, 12.9" iPad (minimum)
**App name:** Tchotcho Pay
**Subtitle:** Send Money to Haiti Instantly
**Keywords:** Haiti remittance, send money Haiti, USDC wallet, Haitian diaspora, mobile money Haiti
**Category:** Finance
**Age rating:** 17+ (financial transactions)

**Google Play:**
- Same icon
- Feature graphic: 1024 × 500 px
- Same screenshots

---

## FLUTTERFLOW RESOURCES

- Start here: flutterflow.io/learn (official tutorials)
- Finance app template: search "wallet" in FlutterFlow marketplace — use as starting base
- Lottie animations: lottiefiles.com (free, search "success", "money", "transfer")
- Icons: use FlutterFlow's built-in Material Icons or Tabler Icons

---

*Tchotcho Pay · tchotchopay.com · lajan an nan men nou 🇭🇹*
