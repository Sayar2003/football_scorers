# football_scorers

<div align="center">

# ⚽ FootballApp

### A Full-Stack Live Football Statistics Platform

[![React](https://img.shields.io/badge/React-18.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

**Live Demo → [football-scorers.vercel.app](https://football-scorers.vercel.app)**

</div>

---

## 📌 Overview

FootballApp is a full-stack web application delivering real-time football data, AI-powered analytics and content creation tools across the **Top 5 European Leagues** — Premier League, La Liga, Bundesliga, Serie A and Ligue 1.

Built from scratch with a modern glassmorphism UI, Firebase authentication, animated backgrounds and full dark/light mode support.

---

## ✨ Features

### 📊 Core Statistics
- **Live Standings** — League tables with form guide, goal difference and position indicators
- **Match Center** — Live scores, results and upcoming fixtures with auto-refresh every 60 seconds
- **Top Scorers** — Golden Boot race with goals, assists and penalty stats
- **Fixtures by Date** — Browse matches by specific date with quick navigation

### 👥 Profiles
- **Team Profiles** — Full squad, recent form and competition info
- **Player Profiles** — Season stats, radar performance charts and career info
- **Player Ratings** — Calculated match ratings based on goals, result and contributions

### 🤖 AI Features
- **AI Football Chatbot** — Ask anything about football with live data integration
- **Match Predictor** — Win probability, predicted score, key factors and stats comparison
- **Match Summarizer** — Auto-generated match reports with short social media version

### 🔧 Tools
- **Player Comparator** — Side by side comparison with dual radar chart overlay
- **Content Creator Cards** — Shareable match result, player stats and standings graphics
- **Young Talent Scout** — Players under 23 ranked by contribution with potential labels

### 📰 News & Transfers
- **Football News** — Latest news filtered by league and category
- **Transfer Updates** — Dedicated transfer news section

### 🎨 UI/UX
- **Glassmorphism Design** — Premium dark theme with blur effects and gradient accents
- **Animated Background** — Interactive football pitch line animation
- **Dark/Light Mode** — Toggle with saved preference
- **Mobile Responsive** — Optimized for all screen sizes
- **Sidebar Navigation** — SofaScore-style collapsible sidebar

### 🔐 Authentication
- **Firebase Auth** — Email/password and Google login
- **Favorites System** — Save teams, players and leagues
- **User Profile** — Personalized experience per account

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Frontend | React 18, React Router DOM |
| Styling | Custom CSS, Glassmorphism, CSS Animations |
| Charts | Recharts (Radar, Bar Charts) |
| Authentication | Firebase Auth |
| Backend | Node.js, Express |
| API | football-data.org, GNews API |
| HTTP Client | Axios |
| Deployment | Vercel (Frontend), Render (Backend) |

---

## 📁 Project Structure

football-scorers/
├── backend/
│   ├── server.js          # Express API proxy server
│   └── package.json
├── src/
│   ├── components/        # Reusable components
│   │   ├── Sidebar.jsx
│   │   ├── TopBar.jsx
│   │   ├── AnimatedBackground.jsx
│   │   ├── RatingBadge.jsx
│   │   ├── PitchMap.jsx
│   │   ├── MatchStatsChart.jsx
│   │   └── PlayerRadarChart.jsx
│   ├── pages/             # Page components
│   │   ├── Standings.jsx
│   │   ├── Matches.jsx
│   │   ├── MatchDetail.jsx
│   │   ├── TopScorers.jsx
│   │   ├── TeamDetails.jsx
│   │   ├── PlayerProfile.jsx
│   │   ├── Fixtures.jsx
│   │   ├── Search.jsx
│   │   ├── MatchPredictor.jsx
│   │   ├── News.jsx
│   │   ├── YoungTalent.jsx
│   │   ├── ContentCreator.jsx
│   │   ├── Chatbot.jsx
│   │   ├── Favorites.jsx
│   │   ├── Login.jsx
│   │   └── tools/
│   │       └── PlayerComparator.jsx
│   ├── context/           # React context
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── services/          # API services
│   │   ├── footballApi.js
│   │   └── aiService.js
│   ├── utils/             # Utility functions
│   │   ├── ratingCalculator.js
│   │   ├── matchSummarizer.js
│   │   ├── favorites.js
│   │   └── apiCache.js
│   ├── styles/
│   │   └── glass.js       # Glassmorphism theme
│   ├── firebase/
│   │   └── config.js
│   └── config/
│       └── apiConfig.js
├── .env
├── package.json
└── README.md

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- football-data.org API key (free)
- Firebase project
- GNews API key (free)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/Sayar2003/football_scorers.git
cd football_scorers
```

**2. Install frontend dependencies**
```bash
npm install
```

**3. Install backend dependencies**
```bash
cd backend
npm install
cd ..
```

**4. Create `.env` file in root**
```env
REACT_APP_FOOTBALL_API_KEY=your_football_api_key
REACT_APP_NEWS_API_KEY=your_news_api_key
REACT_APP_GNEWS_API_KEY=your_gnews_api_key
REACT_APP_HF_API_KEY=your_huggingface_key
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
REACT_APP_BACKEND_URL=http://localhost:5000/v4
```

**5. Start the backend server**
```bash
cd backend
node server.js
```

**6. Start the frontend**
```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deployment

### Frontend — Vercel
1. Import repo on [vercel.com](https://vercel.com)
2. Add all environment variables
3. Set `REACT_APP_BACKEND_URL` to your Render backend URL
4. Deploy

### Backend — Render
1. Create new Web Service on [render.com](https://render.com)
2. Set Root Directory to `backend`
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Add environment variables
6. Deploy

---

## 📡 API References

| API | Usage | Tier |
|---|---|---|
| [football-data.org](https://www.football-data.org/) | Standings, matches, players | Free |
| [GNews API](https://gnews.io/) | Football news | Free |
| [Firebase](https://firebase.google.com/) | Authentication | Free |
| [HuggingFace](https://huggingface.co/) | AI chatbot | Free |

---

## 🔮 Upcoming Features

- [ ] Claude AI integration for intelligent match analysis
- [ ] Club transfer history tool
- [ ] Season timeline visualization
- [ ] Transfer value estimator
- [ ] Player origin world map
- [ ] Push notifications for favorite teams
- [ ] Deep match stats with paid API tier

---

## 👨‍💻 Developer

**Sayar Seal**
- GitHub: [@Sayar2003](https://github.com/Sayar2003)
- University: DIT University, Dehradun

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**⭐ Star this repo if you found it helpful!**

Made by Sayar Seal

</div>