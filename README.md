# 📚 BOOKS AND NOTES CG BOARD

CG Board (Chhattisgarh) की सभी कक्षाओं की किताबें, नोट्स और अध्ययन सामग्री — हिंदी व अंग्रेजी माध्यम में, ऑफलाइन पढ़ने की सुविधा के साथ।

## ✨ Features

### 📱 User App (मोबाइल-स्टाइल वेब ऐप)
- **एनिमेटेड मल्टी-स्लाइड स्प्लैश स्क्रीन** (admin-controlled)
- **नो-इंटरनेट पॉपअप** — ऐप खोलने के लिए इंटरनेट ज़रूरी, फिर ऑफलाइन चलता है
- **होम फ्लो**: माध्यम → कक्षाएं → टैब (बुक्स/नोट्स/अन्य) → विषय → किताबें
- **डाउनलोड + रीड** एक ही बटन में, प्रोग्रेस बार के साथ
- **माई लाइब्रेरी** — डाउनलोडेड किताबें माध्यम/कक्षा/विषय अनुसार organized
- **बुकमार्क्स, नोट्स, रीडिंग प्रोग्रेस** — सब offline saved
- **एडवांस PDF/eBook रीडर** — zoom, scroll modes, page-turn animation, night mode
- **साइडबार + बॉटम नेविगेशन** (दोनों admin-controlled)

### 🖥️ Admin Panel (CMS)
- **पासवर्ड-सुरक्षित** (hidden URL `/#admin` से accessible)
- **डैशबोर्ड** — stats + top books + analytics
- **पूरा CRUD**: माध्यम, कक्षाएं, विषय, बुक्स/नोट्स/अन्य
- **साइडबार मेन्यू, बॉटम नेव, स्प्लैश स्लाइड्स** management
- **विज्ञापन कॉन्फिग** — Google AdMob या Facebook Audience Network
- **OneSignal नोटिफिकेशन** setup
- **ऐप सेटिंग्स** + password change

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui (New York)
- **Database:** Turso (libSQL/SQLite) + Prisma ORM
- **State:** Zustand (client) + TanStack Query
- **Animation:** Framer Motion
- **PDF:** pdfjs-dist
- **Deploy:** Vercel

## 🚀 Quick Start (Local Dev)

```bash
# Install dependencies
bun install

# Setup database (local SQLite)
cp .env.example .env
bun run db:push
bun run db:seed     # 360 sample books

# Start dev server
bun run dev
```

Open http://localhost:3000

- **User App:** direct URL
- **Admin Panel:** `http://localhost:3000/#admin` (password: `admin123`)

## 📦 Deploy

**Vercel + Turso** पर deploy करने के लिए पूरी guide: [`DEPLOY.md`](./DEPLOY.md)

Quick summary:
1. Turso database बनाएं + schema push + seed
2. Code GitHub पर push करें
3. Vercel पर import करें + env vars set करें
4. Deploy! 🎉

## 📁 Project Structure

```
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Sample data (360 books)
├── src/
│   ├── app/
│   │   ├── api/             # API routes (app config, content, admin CRUD, pdf proxy)
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Main entry (User App + #admin)
│   ├── components/
│   │   ├── app/             # User App components (splash, sidebar, reader, etc.)
│   │   ├── admin/           # Admin Panel components
│   │   └── ui/              # shadcn/ui components
│   ├── lib/                 # Shared utilities (db, auth, api, icons, types)
│   ├── stores/              # Zustand stores (app, library)
│   └── hooks/               # Custom React hooks
├── public/                  # Static assets (app-icon.png, etc.)
├── DEPLOY.md                # Deploy guide
├── vercel.json              # Vercel config
└── .env.example             # Environment variables template
```

## 🔐 Default Credentials

- **Admin password:** `admin123` (बदलें: Admin Panel → एप सेटिंग्स → Change Password)

## 📝 License

Personal project — CG Board educational content distribution.
