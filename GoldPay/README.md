# GoldPay

**GoldPay** is a personal banking demo app built with **native Android (Kotlin)**. It is intended **solely for educational and portfolio purposes**. No real money is moved; all balances and transactions are simulated.

## Legal Disclaimer

This app is **not affiliated with OPay, Paystack, Termii, or any financial institution**. All monetary transactions are simulated. The app uses external APIs (Termii for SMS, Paystack for bank name resolution, JSON Bin for data storage) **only if the user provides their own API keys** in the app’s Settings screen. The user is fully responsible for their API usage and must comply with each provider’s terms of service.

## Features

- Phone + OTP login (using Termii SMS — optional)
- Dashboard with virtual balance and quick actions
- Send money (app-to-app and bank transfer simulation)
- Airtime and data purchase simulation
- Bills payment simulation
- Transaction history
- Dark/Light mode toggle
- Settings to enter your own API keys (Termii, JSON Bin, Paystack)

## Setup

1. Clone the repo.
2. Open in Android Studio (Ladybug | Giraffe | Hedgehog recommended).
3. Build and run on an emulator or device (API 21+).

## API Keys

All API keys are **optional**. If left blank, the app runs in **local demo mode** with simulated data and no external network calls.

- **Termii**: OTP and SMS alerts
- **JSON Bin**: Cloud storage for user data
- **Paystack**: Bank account name resolution (read-only)

Enter your keys in **Settings** or provide them as GitHub Secrets for the CI workflow.

## GitHub Actions

The workflow builds the APK on push to `main` or manual trigger, using JDK 17 and retrying up to 3 times on failure.

## Screenshots

*(Add screenshots here)*

## License

MIT — for personal/portfolio use only.
