# 💳 CardVault India

> India's most comprehensive credit card comparison platform — Full Stack Node.js + Express REST API

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express)](https://expressjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment (Vercel)](#-deployment-vercel)
- [Tech Stack](#-tech-stack)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

CardVault India is a full-stack platform for discovering, comparing and applying for the best credit cards in India. The backend provides a RESTful API covering:

- 50+ credit cards from HDFC, SBI, ICICI, Axis, Amex, Kotak, YES Bank and more
- Card comparison engine
- Real-time eligibility checking
- Application submission with pre-screening
- Rewards calculator
- Lounge access database
- JWT authentication

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **Smart Search** | Full-text search across cards, banks & categories |
| ⚖️ **Card Comparison** | Side-by-side compare up to 5 cards |
| ✅ **Eligibility Check** | Instant eligibility screening against income & CIBIL |
| 💰 **Rewards Calculator** | Estimate annual rewards based on your spend |
| ✈️ **Lounge Database** | Complete lounge access details for all cards |
| 📋 **Apply Online** | Submit applications with validation & status tracking |
| 🔐 **Auth System** | JWT-based register/login with refresh tokens |
| 🛡️ **Security** | Helmet, CORS, rate limiting, input sanitization |
| 📊 **Logging** | Winston structured logging with log rotation |

---

## 📡 API Reference

### Base URL
```
http://localhost:5000/api/v1
```

### Endpoints

#### Cards
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cards` | List all cards (with filters & pagination) |
| GET | `/cards/featured` | Editor's choice cards |
| GET | `/cards/top-rated` | Highest-rated cards |
| GET | `/cards/tiers` | Card tiers breakdown |
| GET | `/cards/:id` | Single card details |
| GET | `/cards/:id/similar` | Similar cards |

**Query Parameters for GET /cards:**
```
?page=1&limit=12&bank=hdfc&category=travel&tier=premium
&sort=rating&order=desc&featured=true&minFee=0&maxFee=5000
```

#### Banks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/banks` | All banks |
| GET | `/banks/:slug` | Bank detail + cards |
| GET | `/banks/:slug/cards` | Cards by bank |

#### Comparison
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/compare?ids=card1,card2,card3` | Compare 2–5 cards |

#### Eligibility
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/eligibility` | Check eligibility & get recommendations |

**POST /eligibility body:**
```json
{
  "monthlyIncome": 75000,
  "employmentType": "salaried",
  "cibilScore": 760,
  "preferredCategory": "travel",
  "monthlySpend": 40000
}
```

#### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/applications` | Submit card application |
| GET | `/applications/:id` | Track application status |

#### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login |
| GET | `/auth/profile` | Get user profile (protected) |
| POST | `/auth/logout` | Logout |

#### Rewards
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rewards` | Ranked rewards programs |
| POST | `/rewards/calculator` | Estimate annual rewards |

#### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/search?q=infinia` | Search cards & banks |
| GET | `/lounges` | Lounge access data |
| GET | `/lounges/networks` | Lounge network info |
| GET | `/categories` | All card categories |
| GET | `/categories/:id` | Category + cards |
| GET | `/health` | Health check |

---

## 🗂 Project Structure

```
cardvault-india/
├── server.js                   # App entry point
├── package.json
├── .env.example                # Environment template
├── .gitignore
├── vercel.json                 # Vercel deployment config
├── README.md
│
├── backend/
│   ├── controllers/
│   │   ├── cardsController.js
│   │   ├── applicationsController.js
│   │   ├── comparisonController.js
│   │   ├── searchController.js
│   │   ├── eligibilityController.js
│   │   └── authController.js
│   │
│   ├── routes/
│   │   ├── cards.js
│   │   ├── banks.js
│   │   ├── categories.js
│   │   ├── comparison.js
│   │   ├── applications.js
│   │   ├── auth.js
│   │   ├── lounges.js
│   │   ├── search.js
│   │   ├── rewards.js
│   │   └── eligibility.js
│   │
│   ├── middleware/
│   │   ├── logger.js           # Winston logger
│   │   ├── errorHandler.js     # Global error handler
│   │   ├── rateLimiter.js      # Express rate limit
│   │   ├── auth.js             # JWT middleware
│   │   └── notFound.js         # 404 handler
│   │
│   └── data/
│       ├── cards.js            # Master cards data
│       └── banks.js            # Banks data
│
└── frontend/
    └── public/
        └── index.html          # React/HTML frontend
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/cardvault-india.git
cd cardvault-india

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your values

# 4. Start development server
npm run dev

# 5. Start production server
npm start
```

The API will be available at `http://localhost:5000/api/v1`

### Test the API
```bash
# Health check
curl http://localhost:5000/health

# Get all cards
curl http://localhost:5000/api/v1/cards

# Search
curl "http://localhost:5000/api/v1/search?q=infinia"

# Compare cards
curl "http://localhost:5000/api/v1/compare?ids=hdfc-infinia-metal,axis-atlas"

# Check eligibility
curl -X POST http://localhost:5000/api/v1/eligibility \
  -H "Content-Type: application/json" \
  -d '{"monthlyIncome":75000,"employmentType":"salaried","cibilScore":760}'
```

---

## 🔧 Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `JWT_SECRET` | JWT signing secret | *required* |
| `JWT_EXPIRES_IN` | Access token expiry | `7d` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000` |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |
| `LOG_LEVEL` | Winston log level | `info` |

---

## 🚢 Deployment (Vercel)

This project is configured for Vercel deployment.

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deploy
vercel --prod
```

The `vercel.json` configuration routes all API requests through the Express server.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express.js 4.18 |
| Auth | JSON Web Tokens (JWT) + bcryptjs |
| Security | Helmet, CORS, express-rate-limit |
| Validation | express-validator |
| Logging | Winston |
| Testing | Jest + Supertest |
| Deployment | Vercel |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## ⚠️ Disclaimer

CardVault India is an independent comparison platform. Fees, benefits, and eligibility criteria are subject to change. Always verify on the bank's official website before applying. This platform is not affiliated with any bank or financial institution.

---

<div align="center">
  Made with ❤️ for India's credit card enthusiasts
  <br>
  <strong>CardVault India © 2024</strong>
</div>
