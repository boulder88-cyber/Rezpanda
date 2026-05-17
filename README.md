# RezPanda 🏠

> Your Homes. Organized.

The personal command center for multi-property owners. Track expenses, bills, maintenance, contractors, and documents — all in one place.

---

## 🚀 Running on Replit

This project runs automatically on Replit. Just hit **Run** and both the frontend and PocketBase backend will start.

- **Frontend:** http://localhost:3000
- **PocketBase Admin:** http://localhost:8090/_/

### First-Time Setup

1. Click **Run** in Replit
2. Wait for dependencies to install (~60 seconds)
3. The app opens at port 3000
4. Visit port 8090 to set up your PocketBase admin account

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | PocketBase (self-hosted) |
| Auth | PocketBase Auth |
| Animations | Framer Motion |

---

## 📁 Project Structure

```
rezpanda/
├── apps/
│   ├── web/              # React frontend
│   │   ├── src/
│   │   │   ├── pages/    # Route pages
│   │   │   ├── components/
│   │   │   ├── contexts/
│   │   │   └── hooks/
│   └── pocketbase/       # Backend + database
│       ├── pb_migrations/ # DB schema
│       └── pb_hooks/      # Server-side logic
├── .replit               # Replit config
└── package.json
```

---

## 💰 Business Model

- **Homeowners:** Free (1 property) → $12/property/month
- **Contractors:** $49/month for verified listing + leads

---

## 📧 Contact

support@rezpanda.com
