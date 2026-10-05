# Tchotcho Pay — Developer Handoff Document
**Version:** 1.0
**Date:** July 2026
**Prepared by:** Tchotcho Pay LLC
**Contact:** hello@tchotchopay.com
**Website:** tchotchopay.com

---

## PROJECT OVERVIEW

Tchotcho Pay is a fintech mobile application for the Haitian diaspora. It combines:
1. Money transfer (US/Canada/France → Haiti)
2. USDC digital wallet on Base blockchain
3. Visa Debit card (virtual + physical)
4. Haitian marketplace (top-up, bill pay, merchants)
5. Peer-to-peer payments
6. Agent cash-out network in Haiti

**Target platforms:** iOS (14+) and Android (8+)
**Preferred tech stack:** Flutter (via FlutterFlow export or native Flutter)
**Backend:** Firebase (Auth + Firestore + Storage + Functions)
**Language:** English (primary), Haitian Creole, French

---

## DESIGN SYSTEM

### Color Tokens
```dart
const Color navy       = Color(0xFF020B2D); // Primary background
const Color blue       = Color(0xFF0A1F6E); // Cards, panels
const Color mid        = Color(0xFF1055CC); // Secondary elements
const Color cyan       = Color(0xFF00AEEF); // Primary CTA, highlights
const Color light      = Color(0xFF7FD4F7); // Subtext, icons
const Color gray       = Color(0xFF8FA8CC); // Placeholder text
const Color white      = Color(0xFFF0F6FF); // Body text
const Color green      = Color(0xFF00C896); // Success, received money
const Color red        = Color(0xFFFF4C6A); // Errors, sent money
const Color gold       = Color(0xFFF7B731); // Badges, coming soon
const Color purple     = Color(0xFF8B5CF6); // Accent (optional)
```

### Typography
```dart
// Headings
TextStyle display  = TextStyle(fontFamily: 'Poppins', fontSize: 28, fontWeight: FontWeight.w800);
TextStyle heading1 = TextStyle(fontFamily: 'Poppins', fontSize: 22, fontWeight: FontWeight.w700);
TextStyle heading2 = TextStyle(fontFamily: 'Poppins', fontSize: 18, fontWeight: FontWeight.w600);

// Body
TextStyle body      = TextStyle(fontFamily: 'Inter', fontSize: 15, fontWeight: FontWeight.w400);
TextStyle bodySmall = TextStyle(fontFamily: 'Inter', fontSize: 13, fontWeight: FontWeight.w400);
TextStyle label     = TextStyle(fontFamily: 'Inter', fontSize: 12, fontWeight: FontWeight.w500);
TextStyle button    = TextStyle(fontFamily: 'Poppins', fontSize: 16, fontWeight: FontWeight.w700);
```

### Spacing & Radius
```dart
const double paddingPage   = 20.0;  // Horizontal page padding
const double radiusCard    = 16.0;  // Card border radius
const double radiusButton  = 12.0;  // Button border radius
const double radiusInput   = 10.0;  // Input field border radius
const double navHeight     = 64.0;  // Bottom nav bar height
```

---

## APP ARCHITECTURE

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | Flutter (Dart) |
| State Management | Provider or Riverpod |
| Backend | Firebase (Auth, Firestore, Storage, Functions) |
| Payments | Stripe SDK |
| Bank Verification | Plaid Link SDK |
| Stablecoin | Bridge API (REST) |
| Banking/KYC | Unit API (REST) |
| Top-Up | Reloadly API (REST) |
| Push Notifications | OneSignal or Firebase FCM |
| Analytics | Firebase Analytics |
| Crash Reporting | Firebase Crashlytics |

### Folder Structure
```
lib/
├── main.dart
├── app.dart
├── config/
│   ├── theme.dart
│   ├── routes.dart
│   └── constants.dart
├── models/
│   ├── user_model.dart
│   ├── transaction_model.dart
│   ├── card_model.dart
│   └── recipient_model.dart
├── services/
│   ├── auth_service.dart
│   ├── firestore_service.dart
│   ├── stripe_service.dart
│   ├── plaid_service.dart
│   ├── bridge_service.dart
│   ├── unit_service.dart
│   └── reloadly_service.dart
├── providers/
│   ├── auth_provider.dart
│   ├── wallet_provider.dart
│   └── transaction_provider.dart
├── screens/
│   ├── auth/
│   │   ├── splash_screen.dart
│   │   ├── onboarding_screen.dart
│   │   ├── login_screen.dart
│   │   ├── signup_step1_screen.dart
│   │   ├── signup_step2_screen.dart
│   │   ├── signup_step3_screen.dart
│   │   └── kyc_screen.dart
│   ├── home/
│   │   ├── home_screen.dart
│   │   ├── add_funds_screen.dart
│   │   ├── transaction_history_screen.dart
│   │   └── transaction_detail_screen.dart
│   ├── send/
│   │   ├── send_amount_screen.dart
│   │   ├── send_recipient_screen.dart
│   │   ├── send_review_screen.dart
│   │   └── send_success_screen.dart
│   ├── card/
│   │   ├── card_screen.dart
│   │   └── card_settings_screen.dart
│   ├── market/
│   │   ├── market_screen.dart
│   │   ├── topup_screen.dart
│   │   ├── billpay_screen.dart
│   │   └── qr_pay_screen.dart
│   └── profile/
│       ├── profile_screen.dart
│       ├── edit_profile_screen.dart
│       ├── security_screen.dart
│       ├── referral_screen.dart
│       └── help_screen.dart
├── widgets/
│   ├── balance_card.dart
│   ├── transaction_tile.dart
│   ├── visa_card_widget.dart
│   ├── bottom_nav.dart
│   ├── custom_button.dart
│   ├── custom_input.dart
│   └── loading_overlay.dart
└── utils/
    ├── formatters.dart
    ├── validators.dart
    └── helpers.dart
```

---

## FIREBASE SETUP

### Collections & Schema

#### `users` collection
```
users/{uid}
├── uid: string
├── firstName: string
├── lastName: string
├── email: string
├── phone: string (E.164 format: +15551234567)
├── country: string (US | CA | FR | HT | OTHER)
├── dateOfBirth: timestamp
├── profilePhotoUrl: string (nullable)
├── kycStatus: string (pending | approved | rejected | not_started)
├── kycSubmittedAt: timestamp (nullable)
├── usdcBalance: number (stored in cents: 10000 = $100.00 USDC)
├── referralCode: string (auto-generated, e.g. TCP-FEDNER)
├── referredBy: string (nullable, referral code of referrer)
├── referralEarnings: number
├── unitAccountId: string (nullable, from Unit API)
├── stripeCustomerId: string (nullable)
├── bridgeWalletId: string (nullable)
├── cardId: string (nullable, from Stripe Issuing)
├── language: string (en | ht | fr)
├── pushToken: string (nullable)
├── createdAt: timestamp
└── updatedAt: timestamp
```

#### `transactions` collection
```
transactions/{txId}
├── txId: string (auto-generated)
├── userId: string (ref → users)
├── type: string (send | receive | topup | billpay | card | cashout | deposit)
├── status: string (pending | processing | completed | failed | cancelled)
├── amount: number (in cents)
├── fee: number (in cents)
├── netAmount: number (amount - fee, in cents)
├── currency: string (USDC | USD | HTG)
├── recipientId: string (nullable)
├── recipientName: string (nullable)
├── recipientPhone: string (nullable)
├── description: string
├── bridgeTxHash: string (nullable, Base blockchain tx)
├── stripeTxId: string (nullable)
├── reloadlyTxId: string (nullable)
├── metadata: map (additional data per type)
├── createdAt: timestamp
└── updatedAt: timestamp
```

#### `recipients` collection
```
recipients/{recipientId}
├── recipientId: string
├── userId: string (ref → users)
├── name: string
├── phone: string
├── username: string (nullable)
├── avatarUrl: string (nullable)
├── lastSentAt: timestamp
├── totalSentCents: number
├── sendCount: number
└── createdAt: timestamp
```

#### `cards` collection
```
cards/{cardId}
├── cardId: string (from Stripe Issuing)
├── userId: string
├── type: string (virtual | physical)
├── status: string (active | frozen | cancelled | pending)
├── last4: string
├── expMonth: number
├── expYear: number
├── brand: string (visa)
├── billingAddress: map
│   ├── line1: string
│   ├── city: string
│   ├── state: string
│   ├── postalCode: string
│   └── country: string
├── dailyLimitCents: number (default: 50000 = $500)
├── dailySpentCents: number (resets at midnight)
├── createdAt: timestamp
└── updatedAt: timestamp
```

#### `notifications` collection
```
notifications/{notifId}
├── notifId: string
├── userId: string
├── type: string (transfer | card | kyc | referral | system)
├── title: string
├── body: string
├── read: boolean
├── actionUrl: string (nullable, deep link)
└── createdAt: timestamp
```

---

## SCREEN SPECIFICATIONS

---

### AUTH FLOW

#### SCREEN: SplashScreen
**File:** `splash_screen.dart`
**Route:** `/splash`

```
Layout:
- Scaffold background: navy (#020B2D)
- Column (mainAxisAlignment: center, crossAxisAlignment: center)
  - Image.network('https://tchotchopay.com/logo.png', width: 160, height: 160, fit: BoxFit.contain)
  - SizedBox(height: 16)
  - Text('lajan an nan men nou', style: bodySmall, color: gray)
  - SizedBox(height: 32)
  - CircularProgressIndicator(color: cyan, strokeWidth: 2)

Logic (initState):
  - await Future.delayed(Duration(seconds: 2))
  - Check FirebaseAuth.instance.currentUser
  - If logged in → Navigator.pushReplacementNamed('/home')
  - If not → Navigator.pushReplacementNamed('/onboarding')
```

---

#### SCREEN: OnboardingScreen
**File:** `onboarding_screen.dart`
**Route:** `/onboarding`

```
Layout:
- PageView with 3 pages, PageController
- Each page:
  - Image (illustration, centered, 240px)
  - SizedBox(height: 32)
  - Text(headline, style: heading1, textAlign: center)
  - SizedBox(height: 12)
  - Text(body, style: body, color: gray, textAlign: center)
- Bottom fixed row:
  - DotsIndicator (3 dots, active = cyan)
  - SizedBox(height: 24)
  - If page < 2: Row with Skip(left) + Next button(right)
  - If page == 2: Full width "Get Started" button → /signup/step1

Slide content:
  Page 1: image=money_transfer.png, headline="Send Money to Haiti Instantly", body="Under 3% fees. Arrives in 60 seconds. 24/7."
  Page 2: image=usdc_wallet.png, headline="Save in Digital Dollars", body="Hold USDC — stable, protected from HTG inflation."
  Page 3: image=visa_card.png, headline="Spend Anywhere with Visa", body="Virtual card now. Physical card coming soon."
```

---

#### SCREEN: SignUpStep1
**File:** `signup_step1_screen.dart`
**Route:** `/signup/step1`

```
Layout:
- AppBar: back arrow, no title, transparent
- Progress bar at top: 25% (step 1 of 4), color: cyan
- Padding(20px horizontal)
- Text('Create your account', style: heading1)
- SizedBox(height: 8)
- Text('It takes less than 3 minutes.', style: body, color: gray)
- SizedBox(height: 32)
- CustomInput(label: 'First Name', id: 'firstName', type: text, required: true)
- SizedBox(height: 16)
- CustomInput(label: 'Last Name', id: 'lastName', type: text, required: true)
- SizedBox(height: 16)
- CustomInput(label: 'Email Address', id: 'email', type: email, required: true)
- SizedBox(height: 16)
- CustomInput(label: 'Password', id: 'password', type: password, minLength: 8, showToggle: true)
- SizedBox(height: 16)
- CustomInput(label: 'Confirm Password', id: 'confirmPassword', type: password, mustMatch: 'password')
- Spacer()
- CustomButton(label: 'Continue', onTap: _validateAndNext)

Validation:
  - All fields required
  - Email must be valid format
  - Password min 8 characters
  - confirmPassword must match password
  - On success: store in local state, navigate to /signup/step2

Error display: Red text below each field
```

---

#### SCREEN: SignUpStep2 (Phone OTP)
**File:** `signup_step2_screen.dart`
**Route:** `/signup/step2`

```
Layout:
- Progress bar: 50%
- Text('Verify your phone', style: heading1)
- Text('We'll send a 6-digit code', style: body, color: gray)
- SizedBox(height: 32)
- Row: CountryCodePicker + PhoneNumberInput
- SizedBox(height: 24)
- CustomButton('Send Code', onTap: _sendOTP)

After OTP sent - show:
- Text('Enter the 6-digit code sent to [phone]')
- OtpInputField (6 boxes, auto-advance, auto-submit on last digit)
- CountdownTimer('Resend in 0:59')
- After timer: TextButton('Resend Code')
- CustomButton('Verify', onTap: _verifyOTP)

Firebase Phone Auth:
  - FirebaseAuth.instance.verifyPhoneNumber()
  - On codeSent: store verificationId
  - On verify: PhoneAuthCredential → signInWithCredential
  - On success → /signup/step3
```

---

#### SCREEN: SignUpStep3
**File:** `signup_step3_screen.dart`
**Route:** `/signup/step3`

```
Layout:
- Progress bar: 75%
- Text('Almost done', style: heading1)
- SizedBox(height: 32)
- DatePicker(label: 'Date of Birth', minAge: 18)
- SizedBox(height: 16)
- Dropdown(label: 'Country of Residence', options: [US, Canada, France, Haiti, Other])
- SizedBox(height: 16)
- CustomInput(label: 'Referral Code (optional)', id: 'referralCode')
- Spacer()
- CustomButton('Create Account', onTap: _createAccount)

On Create Account:
  - Validate age >= 18
  - Create Firebase user document in Firestore
  - Generate unique referralCode (TCP-[FIRSTNAME][4 random digits])
  - Navigate to /signup/kyc
```

---

#### SCREEN: KYCScreen
**File:** `kyc_screen.dart`
**Route:** `/signup/kyc`

```
Layout:
- Progress bar: 100%
- Text('Verify your identity', style: heading1)
- Text('Required by law. Takes 2 minutes. Data is encrypted.', style: body, color: gray)
- SizedBox(height: 32)
- KYC option cards (tap to select):
  Card 1: Icon=document, Title='Government ID', Sub='Passport, Driver's License, or National ID'
  Card 2: Icon=camera, Title='Take a Selfie', Sub='A photo of your face to match your ID'
- SizedBox(height: 24)
- CustomButton('Submit for Review', onTap: _submitKYC)
- Text('Most reviews complete in under 5 minutes', style: label, color: gray)

ID Upload flow:
  - image_picker → camera or gallery
  - Upload to Firebase Storage: kyc/{uid}/front.jpg and kyc/{uid}/back.jpg
  - POST to Unit API: /verify-identity with document URLs

Selfie flow:
  - image_picker → front camera
  - Upload to Firebase Storage: kyc/{uid}/selfie.jpg
  - POST to Unit API with selfie URL

On submit:
  - Update users/{uid}/kycStatus = 'pending'
  - Show success toast: 'Identity submitted! We'll notify you when approved.'
  - Navigate to /home
```

---

#### SCREEN: LoginScreen
**File:** `login_screen.dart`
**Route:** `/login`

```
Layout:
- Logo centered at top (100px)
- SizedBox(height: 32)
- Text('Welcome back', style: heading1)
- SizedBox(height: 32)
- CustomInput(label: 'Email', type: email)
- SizedBox(height: 16)
- CustomInput(label: 'Password', type: password, showToggle: true)
- SizedBox(height: 8)
- Align(right): TextButton('Forgot Password?') → /forgot-password
- SizedBox(height: 24)
- CustomButton('Log In', onTap: _login)
- SizedBox(height: 16)
- Divider with 'or' text
- SizedBox(height: 16)
- BiometricButton (if available: Face ID / Touch ID)
- Spacer()
- TextButton('Don\'t have an account? Sign Up') → /signup/step1

Login logic:
  - FirebaseAuth.instance.signInWithEmailAndPassword()
  - On success → /home
  - On error → show inline error
  - Biometric: local_auth package → check device biometrics
```

---

### MAIN APP FLOW

#### WIDGET: BottomNav
**File:** `bottom_nav.dart`

```dart
BottomNavigationBar(
  currentIndex: _currentIndex,
  backgroundColor: blue,
  selectedItemColor: cyan,
  unselectedItemColor: gray,
  type: BottomNavigationBarType.fixed,
  items: [
    BottomNavigationBarItem(icon: Icon(Icons.home_outlined), activeIcon: Icon(Icons.home), label: 'Home'),
    BottomNavigationBarItem(icon: Icon(Icons.send_outlined), activeIcon: Icon(Icons.send), label: 'Send'),
    BottomNavigationBarItem(icon: Icon(Icons.credit_card_outlined), activeIcon: Icon(Icons.credit_card), label: 'Card'),
    BottomNavigationBarItem(icon: Icon(Icons.storefront_outlined), activeIcon: Icon(Icons.storefront), label: 'Market'),
    BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: 'Profile'),
  ],
)
```

---

#### SCREEN: HomeScreen (Dashboard)
**File:** `home_screen.dart`
**Route:** `/home`

```
Layout (SingleChildScrollView):

1. Header Row:
   - Left: "Good morning, [firstName] 👋" — heading2
   - Right: IconButton(bell icon) → /notifications
     - Badge: red dot if unread notifications

2. KYC Banner (visible only if kycStatus != 'approved'):
   - Container(color: gold.withOpacity(0.1), border: gold)
   - Text('⚠️ Verify your identity to unlock all features')
   - Tap → /signup/kyc

3. Balance Card:
   - Container(
       decoration: BoxDecoration(
         gradient: LinearGradient(colors: [navy, blue]),
         borderRadius: BorderRadius.circular(20),
       ),
       padding: EdgeInsets.all(24),
     )
   - Text('USDC Balance', style: label, color: gray)
   - Text('$247.50', style: display, color: white) ← pull from Firestore
   - Text('≈ $247.50 USD', style: bodySmall, color: gray)
   - SizedBox(height: 24)
   - Row of 4 QuickActionButtons:
     - Add → /add-funds
     - Send → /send/amount
     - Convert (grayed out, coming soon)
     - Cash Out → /cashout

4. Quick Send (horizontal scroll):
   - Text('Quick Send', style: heading2)
   - SingleChildScrollView(scrollDirection: Axis.horizontal)
   - Each avatar: Column(CircleAvatar + name below) → /send/amount with recipient pre-filled
   - Last: CircleAvatar('+') → /send/recipient

5. Recent Transactions:
   - Row: Text('Recent Activity') + TextButton('See All') → /transactions
   - StreamBuilder from Firestore:
     transactions where userId == currentUser.uid, orderBy createdAt desc, limit 5
   - TransactionTile for each

6. Floating refresh on pull-to-refresh
```

---

#### SCREEN: AddFundsScreen
**File:** `add_funds_screen.dart`
**Route:** `/add-funds`

```
Layout:
- TabBar: [Card] [Bank Transfer]

Card tab:
  - CustomInput(label: 'Card Number', type: cardNumber) ← card_field Flutter package
  - Row: CustomInput(Expiry) + CustomInput(CVV)
  - CustomInput(label: 'Amount', type: number, prefix: '$')
  - FeeRow: 'Card fee: 2.5% = $X.XX'
  - TotalRow: 'You pay: $XXX.XX'
  - CustomButton('Add Funds', onTap: _chargeCard)
  
  Stripe logic:
    - Create PaymentMethod via Stripe SDK
    - POST to your Firebase Function: /create-payment-intent
    - Firebase Function calls Stripe API: paymentIntents.create()
    - Confirm payment on client
    - On success: update Firestore balance, create transaction record

Bank Transfer tab:
  - PlaidLink button: 'Connect Your Bank'
  - Plaid SDK: LinkTokenConfiguration → PlaidLink.open()
  - On success: get public_token → POST to Firebase Function
  - Firebase Function: plaid.itemPublicTokenExchange() → save access_token
  - CustomInput(label: 'Transfer Amount', type: number)
  - Text('Free · Takes 1 business day')
  - CustomButton('Transfer Funds', onTap: _initiateACH)
```

---

#### SCREEN: SendAmountScreen
**File:** `send_amount_screen.dart`
**Route:** `/send/amount`

```
Layout:
- Text('Send to Haiti', style: heading1)
- SizedBox(height: 32)
- Amount display: Text('$0.00', style: display) — updates as user types
- NumberPad (custom widget, 0-9 + backspace + decimal)
- SizedBox(height: 16)
- Text('Recipient gets: 0.00 USDC', style: body, color: green)
- Text('Fee: ≤ 3%', style: label, color: gray)
- Text('1 USD = 1 USDC = ~130.50 HTG', style: label, color: gray)
- Spacer()
- CustomButton('Continue', enabled: amount > 1.00, onTap: → /send/recipient)

Amount logic:
  - fee = amount * 0.025 (2.5%)
  - recipientGets = amount - fee
  - Display updates on every keypress
  - Min amount: $1.00
  - Max amount: based on user's daily limit from Unit
```

---

#### SCREEN: SendRecipientScreen
**File:** `send_recipient_screen.dart`
**Route:** `/send/recipient`

```
Layout:
- TabBar: [Recent] [Contacts] [New]

Recent tab:
  - StreamBuilder: recipients where userId == uid, orderBy lastSentAt, limit 10
  - RecipientTile: avatar + name + last sent date
  - Tap → store selectedRecipient, navigate to /send/review

Contacts tab:
  - SearchBar at top
  - StreamBuilder: all recipients for user, filtered by search query
  - Alphabetically grouped

New tab:
  - Segmented control: [Phone] [Username] [QR Code]
  - Phone: CustomInput(countryCode + phone number)
  - Username: CustomInput('@username')
  - QR: camera widget → scan QR → parse tchotchopay://pay?user=xxx
  - CustomButton('Continue', onTap: _lookupAndContinue)
  
  Lookup logic:
    - Query Firestore: users where phone == input OR username == input
    - If found: show user preview card
    - If not found: show error 'No user found with this number'
```

---

#### SCREEN: SendReviewScreen
**File:** `send_review_screen.dart`
**Route:** `/send/review`

```
Layout:
- Text('Review Transfer', style: heading1)
- SizedBox(height: 32)
- Summary card:
  Row: 'You send' → '$100.00 USD'
  Row: 'Fee (2.5%)' → '$2.50'
  Divider
  Row: 'Recipient gets' → '$97.50 USDC' (green, bold)
  Row: 'To' → '[Name] · [phone]'
  Row: 'Arrives' → 'Instantly'
- SizedBox(height: 32)
- PIN entry (6-digit) OR LocalAuth biometric
- SizedBox(height: 24)
- CustomButton('Confirm & Send', onTap: _executeTransfer)
- TextButton('Cancel')

Transfer logic:
  - Verify user PIN or biometric
  - Check user USDC balance >= (amount + fee)
  - POST to Firebase Function: /send-usdc
  - Firebase Function calls Bridge API to transfer USDC
  - Deduct from sender balance in Firestore
  - Credit recipient balance in Firestore
  - Create transaction record for both users
  - Send push notification to recipient
  - On success → /send/success
  - On failure → show error dialog
```

---

#### SCREEN: SendSuccessScreen
**File:** `send_success_screen.dart`
**Route:** `/send/success`

```
Layout:
- Lottie animation: green checkmark (success.json from lottiefiles.com)
- Text('Transfer Complete! 🎉', style: heading1, textAlign: center)
- Text('[Name] received $97.50 USDC', style: body, color: gray, textAlign: center)
- Text('Transaction ID: #TCP-83920', style: label, color: gray)
- SizedBox(height: 32)
- CustomButton('Share Receipt', onTap: _shareReceipt)  ← share_plus package
- TextButton('Send Another') → /send/amount
- TextButton('Back to Home') → /home
```

---

#### SCREEN: CardScreen
**File:** `card_screen.dart`
**Route:** `/card`

```
Layout:
- 3D Card Widget (AnimatedBuilder with Transform):
  Front face:
    - Gradient background: LinearGradient(navy → blue)
    - Logo top left (white, 80px wide)
    - 'VIRTUAL' badge (green, top right)
    - Gold EMV chip (center left)
    - Card number: '•••• •••• •••• [last4]'
    - Bottom row: user name left, 'VISA DEBIT' right
  Back face:
    - Magnetic stripe (black bar)
    - Signature strip with CVV
    - Support info
  
  Flip on tap: setState(() => _isFlipped = !_isFlipped)
  Animation: TweenAnimationBuilder<double>(tween: Tween(begin: 0, end: _isFlipped ? 180 : 0))

- Card action row:
  - IconButton(freeze/unfreeze) → calls Stripe Issuing API
  - IconButton(details) → shows full card number + CVV (authenticated)
  - IconButton(settings) → /card/settings

- Card details section:
  - 'Card Number': •••• •••• •••• 4821  [copy icon]
  - 'Expiry': 12/28
  - 'CVV': ••• [eye icon to reveal — requires biometric]
  - 'Daily Limit': $500

- Recent card transactions (last 10)

Stripe Issuing:
  - GET /v1/issuing/cards/{card_id} → card details
  - POST /v1/issuing/cards/{card_id} body: {status: inactive} → freeze
  - POST /v1/issuing/cards/{card_id} body: {status: active} → unfreeze
```

---

#### SCREEN: MarketScreen
**File:** `market_screen.dart`
**Route:** `/market`

```
Layout:
- Text('Haitian Marketplace 🇭🇹', style: heading1)
- Text('Pay for services in Haiti with USDC', style: body, color: gray)
- SizedBox(height: 24)
- GridView.count(crossAxisCount: 2, children: [
    CategoryCard(icon: '📱', label: 'Mobile Top-Up', route: '/market/topup'),
    CategoryCard(icon: '⚡', label: 'Electricity (EDH)', route: '/market/billpay?type=electricity'),
    CategoryCard(icon: '🎓', label: 'School Fees', route: '/market/billpay?type=school'),
    CategoryCard(icon: '🏥', label: 'Healthcare', route: '/market/billpay?type=healthcare'),
    CategoryCard(icon: '🛒', label: 'Local Merchants', route: '/market/qr'),
    CategoryCard(icon: '💧', label: 'Water Bill', route: '/market/billpay?type=water'),
  ])
```

---

#### SCREEN: TopUpScreen
**File:** `topup_screen.dart`
**Route:** `/market/topup`

```
Layout:
- Text('Mobile Top-Up 📱', style: heading1)
- SizedBox(height: 24)
- Provider selector (segmented control):
  [Digicel] [Natcom]
- SizedBox(height: 16)
- CustomInput(label: 'Haiti Phone Number', prefix: '+509', maxLength: 8, type: phone)
- SizedBox(height: 24)
- Amount chips (wrap row):
  $5 | $10 | $15 | $20 | [Custom]
- SizedBox(height: 16)
- Balance row: 'Your balance: $247.50 USDC'
- Fee row: 'Fee: $0.15 (1%)'
- CustomButton('Top-Up Now', onTap: _sendTopUp)

Reloadly API:
  POST https://topups.reloadly.com/topups
  {
    "recipientPhone": { "countryCode": "HT", "number": "XXXXXXXX" },
    "amount": 10,
    "currencyCode": "USD",
    "operatorId": [Digicel ID | Natcom ID]
  }
  
On success:
  - Deduct from user USDC balance
  - Create transaction record (type: topup)
  - Show success screen
```

---

#### SCREEN: ProfileScreen
**File:** `profile_screen.dart`
**Route:** `/profile`

```
Layout:
- Header: CircleAvatar(radius: 36, initials) + Name + Email
- KYC badge: 'Verified ✅' (green) | 'Pending ⏳' (gold) | 'Verify Now ⚠️' (red, tappable)
- Divider
- MenuList:
  ListTile(icon: person, title: 'Edit Profile') → /profile/edit
  ListTile(icon: security, title: 'Security & PIN') → /profile/security
  ListTile(icon: verified, title: 'KYC Status') → /signup/kyc
  ListTile(icon: gift, title: 'Refer & Earn') → /profile/referral
  ListTile(icon: chart, title: 'Statements') → /transactions
  ListTile(icon: help, title: 'Help & Support') → /profile/help
  ListTile(icon: document, title: 'Terms & Privacy') → webview(tchotchopay.com/terms)
  ListTile(icon: language, title: 'Language', trailing: 'EN') → language picker
  ListTile(icon: logout, title: 'Log Out', color: red, onTap: _logout)
```

---

#### SCREEN: ReferralScreen
**File:** `referral_screen.dart`
**Route:** `/profile/referral`

```
Layout:
- Text('Refer a Friend, Earn $10 🎁', style: heading1, textAlign: center)
- SizedBox(height: 24)
- Container(border: cyan, borderRadius: 12):
  Row: Text(user.referralCode, style: heading2) + IconButton(copy)
- SizedBox(height: 24)
- Share buttons:
  - ElevatedButton('Share on WhatsApp') → open wa.me with pre-filled message
  - ElevatedButton('Copy Link') → clipboard
  - ElevatedButton('Share via iMessage') → share_plus package
- Divider
- Text('Your referrals', style: heading2)
- Text('Earned: $X from X referrals', style: body, color: green)
- StreamBuilder: users where referredBy == userReferralCode → list

Share message:
  "Hey! I'm using Tchotcho Pay to send money to Haiti for less than 3% fees. Sign up with my code [CODE] and we both earn $10! tchotchopay.com"
```

---

## API INTEGRATIONS

### Firebase Functions (Backend)
All sensitive API calls go through Firebase Cloud Functions — never expose API keys in the Flutter app.

#### Function: createPaymentIntent
```javascript
// POST /createPaymentIntent
// Body: { amount, currency, customerId }
const paymentIntent = await stripe.paymentIntents.create({
  amount: amount, // in cents
  currency: 'usd',
  customer: customerId,
  payment_method_types: ['card'],
});
return { clientSecret: paymentIntent.client_secret };
```

#### Function: sendUSDC
```javascript
// POST /sendUSDC
// Body: { fromUserId, toUserId, amountCents }
// 1. Verify sender balance in Firestore
// 2. Call Bridge API to transfer USDC
// 3. Update both user balances in Firestore
// 4. Create transaction records
// 5. Send push notifications via FCM
```

#### Function: verifyKYC
```javascript
// POST /verifyKYC
// Body: { userId, idFrontUrl, idBackUrl, selfieUrl }
// Call Unit API: POST /users with KYC documents
// Update Firestore: users/{uid}/kycStatus
```

#### Function: issueCard
```javascript
// POST /issueCard
// Body: { userId }
// Call Stripe Issuing: POST /v1/issuing/cards
// Store cardId in Firestore: users/{uid}/cardId
```

### Bridge API (USDC)
```
Base URL: https://api.bridge.xyz/v0
Auth: Authorization: Bearer [BRIDGE_API_KEY]

Create wallet:
POST /customers/{customerId}/wallets
{ "chain": "base", "currency": "usdc" }

Transfer USDC:
POST /transfers
{
  "amount": "97.50",
  "on_behalf_of": "customer_id",
  "source": { "payment_rail": "usdc", "currency": "usdc", "from_address": "0x..." },
  "destination": { "payment_rail": "usdc", "currency": "usdc", "to_address": "0x..." }
}
```

### Unit API (Banking/KYC)
```
Base URL: https://api.unit.co
Auth: Authorization: Bearer [UNIT_API_KEY]

Create individual customer:
POST /customers
{
  "type": "individualCustomer",
  "attributes": {
    "ssn": "...",
    "fullName": { "first": "...", "last": "..." },
    "dateOfBirth": "YYYY-MM-DD",
    "address": {...},
    "email": "...",
    "phone": {...}
  }
}

KYC document upload:
POST /applications/{id}/documents
```

### Stripe Issuing (Visa Card)
```
Base URL: https://api.stripe.com/v1
Auth: Authorization: Bearer [STRIPE_SECRET_KEY]

Create cardholder:
POST /v1/issuing/cardholders
{ "type": "individual", "name": "...", "email": "...", "billing": {...} }

Create virtual card:
POST /v1/issuing/cards
{ "cardholder": "ich_xxx", "currency": "usd", "type": "virtual" }

Freeze card:
POST /v1/issuing/cards/{id}
{ "status": "inactive" }
```

---

## BUSINESS LOGIC

### Fee Structure
```dart
double calculateFee(double amount, String method) {
  switch (method) {
    case 'card':    return amount * 0.025;  // 2.5%
    case 'ach':     return 0.0;             // Free
    case 'cashout': return amount * 0.01;   // 1%
    case 'merchant': return amount * 0.015; // 1.5%
    case 'topup':   return amount * 0.01;   // 1%
    case 'p2p':     return 0.0;             // Free
    default:        return amount * 0.025;
  }
}
```

### Exchange Rate
```dart
// HTG rate is dynamic — fetch from API or store in Firestore
// For now: 1 USDC = ~130.50 HTG
// Update daily via Firebase Function that fetches from exchange rate API

double usdcToHTG(double usdc) => usdc * htgRate;
double htgToUSDC(double htg) => htg / htgRate;
```

### Daily Limits
```dart
// Default limits per KYC tier
Map<String, double> dailyLimits = {
  'not_verified': 0,       // Can't transact until KYC approved
  'pending':      0,       // Can't transact until KYC approved
  'approved':     500.00,  // $500/day default
  'premium':      5000.00, // $5,000/day premium tier
};
```

### Referral Logic
```dart
// When new user signs up with referral code:
// 1. Verify referral code exists in users collection
// 2. Store referredBy in new user document
// 3. When new user completes first transfer:
//    - Credit referrer $10 USDC
//    - Credit new user $10 USDC
//    - Create transaction records for both
//    - Send push notifications to both
```

---

## SECURITY REQUIREMENTS

1. **Never store API keys in Flutter app** — all keys in Firebase Functions environment variables
2. **PIN encryption** — store PIN as SHA-256 hash, never plain text
3. **Biometric auth** — use local_auth package, authenticate before showing card CVV or confirming transfers
4. **Certificate pinning** — implement for production builds
5. **Jailbreak/root detection** — use flutter_jailbreak_detection package
6. **Session timeout** — auto-logout after 15 minutes of inactivity
7. **KYC gating** — block all financial actions if kycStatus != 'approved'
8. **Amount validation** — always validate amounts server-side in Firebase Functions, never trust client
9. **Firestore rules** — users can only read/write their own documents
10. **HTTPS only** — all API calls over HTTPS

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /transactions/{txId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         resource.data.recipientId == request.auth.uid);
      allow write: if false; // Only Firebase Functions can write transactions
    }
    match /cards/{cardId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow write: if false; // Only Firebase Functions
    }
  }
}
```

---

## ACCEPTANCE CRITERIA

The app is considered complete and ready for submission when:

- [ ] User can sign up, verify phone, and complete KYC
- [ ] User can deposit funds via debit card (Stripe)
- [ ] User can deposit funds via bank transfer (Plaid)
- [ ] User can send USDC to another user by phone, username, or QR
- [ ] Recipient receives USDC and sees updated balance
- [ ] User can top up a Haiti phone number (Digicel/Natcom)
- [ ] User can pay a bill (EDH electricity)
- [ ] User has a virtual Visa Debit card they can add to Apple/Google Pay
- [ ] User can freeze and unfreeze their card
- [ ] User can cash out to a Haitian bank (or agent)
- [ ] Push notifications work for all transaction types
- [ ] App works in English, Haitian Creole, and French
- [ ] All screens handle loading, error, and empty states
- [ ] App runs without crashes on iPhone 12+ and Android 10+
- [ ] App passes App Store and Google Play review

---

## DELIVERABLES FROM DEVELOPER

1. Full Flutter codebase pushed to GitHub repo
2. Firebase project configured and deployed
3. All Firebase Functions deployed and tested
4. TestFlight build (iOS) submitted and working
5. Google Play Internal Testing build submitted and working
6. README with setup instructions
7. Environment variables documented (.env.example)
8. API integration test results

---

## CONTACT & RESOURCES

- **Website:** tchotchopay.com
- **Email:** hello@tchotchopay.com
- **Design reference:** tchotchopay.com (all pages)
- **FlutterFlow project:** app.flutterflow.io/project/tchotchopay-9d3use
- **Color system:** See Design System section above
- **Screen specs:** See flutterflow-spec.md in this folder
- **App blueprint:** See app-blueprint.md in this folder

---

*Tchotcho Pay LLC · lajan an nan men nou 🇭🇹*
