# 🎯 CampusConnect

**Automated Campus Ambassador Management Platform**

> Revolutionize your Campus Ambassador program with automated task management, gamification, and real-time analytics.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://choosealicense.com/licenses/mit/)

---

## 🚀 Problem Statement

Managing Campus Ambassador programs is fragmented and unscalable. Organizations struggle with:

- **Manual task tracking** across hundreds of ambassadors
- **Low engagement** due to lack of motivation and feedback
- **No visibility** into program performance and ROI
- **Time-consuming** approval processes for task submissions

**CampusConnect solves this** by providing an all-in-one automated platform that combines task management, gamification, and analytics to create a scalable, engaging ambassador program.

---

## ✨ Features

### For Organizations

🎯 **Smart Dashboard**
- Real-time KPI cards (Total Ambassadors, Tasks Completed, Points Awarded)
- Program Health Score with completion and engagement metrics
- Visual analytics with charts and trends

👥 **Ambassador Management**
- Search, filter, and sort ambassadors by college, status, tier
- Detailed ambassador profiles with task history
- Flag or remove ambassadors with confirmation dialogs
- Export ambassador data to CSV

📋 **Task Management**
- Create tasks with multiple types: Referral, Social Post, Event, Content Creation
- Set points, deadlines, proof requirements (Image/URL/Screenshot)
- Auto-approve or manual review options
- Track task completion rates and submissions

✅ **Submission Review Queue**
- Visual cards showing pending submissions with proof
- One-click approve with customizable points
- Reject with reason and allow resubmission
- Bulk approval for efficiency

📊 **Analytics Dashboard**
- Task completion trends over time
- Ambassador sign-up growth charts
- Task type distribution
- Top performers and colleges leaderboard

🏆 **Leaderboard**
- Real-time rankings with podium-style top 3
- Rank change indicators
- Filter and search functionality

### For Ambassadors

👤 **Personalized Profile**
- Avatar with initials, points, badges, and streak
- Tier badges (Bronze → Silver → Gold → Platinum → Diamond)
- Current rank and percentile display
- Join date and activity stats

📝 **My Tasks Interface**
- Tabs: Available, Completed, Expired
- Countdown timers for deadlines
- Task cards with points, type, and requirements
- Visual status indicators

📤 **Easy Task Submission**
- Drag-and-drop file upload with preview
- URL submission with live validation
- Instant feedback for auto-approved tasks
- Pending review status for manual tasks

🎮 **Gamification System**
- **Points**: Base points + streak multiplier (3+ day streak = 1.2x) + early submission bonus (10%)
- **Badges**: 12 unique badges (First Step, On Fire, Week Warrior, Centurion, Diamond Ambassador, etc.)
- **Streaks**: Daily activity tracking with 🔥 flame icon
- **Tiers**: Progress from Bronze to Diamond based on points
- **Animations**: Confetti bursts on tier-up, badge unlock celebrations

🏅 **Points & Badges**
- Points history timeline with all transactions
- Badge showcase grid with unlock dates
- Locked badges shown as silhouettes with unlock conditions

📊 **Leaderboard View**
- See your rank highlighted
- Percentile indicator (Top X%)
- Compare with peers across colleges

---

## 🛠️ Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.12-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF?style=flat&logo=vite&logoColor=white)

### State & Routing
![Zustand](https://img.shields.io/badge/Zustand-5.0.12-orange?style=flat)
![React Router](https://img.shields.io/badge/React_Router-7.14-CA4245?style=flat&logo=reactrouter&logoColor=white)

### UI & Interactions
- **Motion** (Framer Motion successor) - Animations
- **Recharts** - Analytics charts
- **Sonner** - Toast notifications
- **React Dropzone** - File uploads
- **Lucide React** - Icons
- **Canvas Confetti** - Celebration effects

### Utilities
- **date-fns** - Date calculations (streaks, deadlines)

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ and pnpm installed

### Installation

```bash
# Clone the repository
git clone https://github.com/vishalreddy20/Campusconnectmanagementplatform.git
cd Campusconnectmanagementplatform

# Install dependencies
pnpm install

# Start the development server
pnpm run dev
```

The application will be available at the preview URL shown in your environment.

---

## 🔐 Demo Credentials

### Organization Admin
- **Email**: `admin@techlaunch.in`
- **Password**: `Admin@123`

### Ambassador (Demo User)
- **Email**: `ambassador@demo.com`
- **Password**: `Demo@123`

**Or use the "Demo Login" buttons on the landing page for instant access!**

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Landing Page  │ ◄─── Demo Login Buttons
└────────┬────────┘
         │
         ├─────────────────────┬─────────────────────┐
         │                     │                     │
         ▼                     ▼                     ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ Organization    │   │  Ambassador     │   │  Route Guards   │
│   Dashboard     │   │   Dashboard     │   │   (Protected)   │
└────────┬────────┘   └────────┬────────┘   └─────────────────┘
         │                     │
         ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                     Zustand Stores                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │  Auth   │  │Ambassador│  │  Task   │  │Gamifica-│       │
│  │  Store  │  │  Store   │  │  Store  │  │tion     │       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    localStorage (Persist)
```

---



## 🎮 Gamification System

| Feature | Description | Impact |
|---------|-------------|--------|
| **Base Points** | Each task has a base point value (10-200) | Foundation of scoring |
| **Streak Multiplier** | 3+ day streak = 1.2x points | Encourages daily engagement |
| **Early Bird Bonus** | Submit before 50% of deadline = +10% points | Rewards promptness |
| **First Submission** | First to complete a new task = +15 flat points | Drives competition |
| **Badges** | 12 unique achievements | Milestone recognition |
| **Tiers** | Bronze → Silver → Gold → Platinum → Diamond | Progression system |

### Badge List
- 🎯 **First Step** - Complete first task
- 🔥 **On Fire** - 3-day streak
- ⚔️ **Week Warrior** - 7-day streak
- 👑 **Referral King** - 5 referrals
- 🎨 **Content Creator** - 3 content tasks
- 🏆 **Event Champion** - 2 events attended
- 💯 **Centurion** - 100 points
- ⭐ **Point Lord** - 500 points
- 💎 **Diamond Ambassador** - 1000 points
- 🦋 **Social Butterfly** - 5 social tasks
- 🌅 **Early Bird** - Submit before 9 AM
- ✨ **Perfect Week** - Complete all tasks in a week

---

## 🔮 Future Scope

- **Mobile App** - React Native version for iOS/Android
- **AI Insights** - Predictive analytics for ambassador performance
- **Real-time Chat** - Direct messaging between org and ambassadors
- **Blockchain Badges** - NFT-based achievement system
- **Integration APIs** - Connect with CRMs, Slack, Discord
- **Advanced Analytics** - Cohort analysis, retention metrics
- **Automated Campaigns** - Schedule tasks, reminders, broadcasts

---

## 📝 Known Limitations

- Mock data is preloaded; no real backend (easily replaceable with Supabase/Firebase)
- File uploads are simulated (base64 storage in localStorage)
- No email notifications (can be added with SendGrid/Resend)
- Single organization support (multi-tenant coming soon)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

Built with ❤️ for **UnsaidTalks AICore Connect Hackathon** by Vishal Reddy

---

## 🙏 Acknowledgments

- **TechLaunch India** - Mock organization data
- **Tailwind CSS** - Beautiful utility-first CSS
- **Lucide Icons** - Crisp icon library

---

<div align="center">
  <strong>⭐ Star this repo if you found it helpful!</strong><br>
  <a href="https://github.com/vishalreddy20/Campusconnectmanagementplatform/issues">Report Bug</a> •
  <a href="https://github.com/vishalreddy20/Campusconnectmanagementplatform/issues">Request Feature</a>
</div>
