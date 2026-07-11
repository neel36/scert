# 🚀 Vercel पर Deploy करने की पूरी Guide

ये गाइड आपको "BOOKS AND NOTES CG BOARD" ऐप को **Vercel + Turso** (free) पर step-by-step deploy करने में मदद करेगी।

---

## 📋 क्या-क्या चाहिए (सब free)

1. **GitHub account** — code host करने के लिए
2. **Vercel account** — https://vercel.com (GitHub से sign in करें)
3. **Turso account** — https://turso.tech (GitHub से sign in करें) — database के लिए

---

## Step 1: Turso Database बनाएं (5 मिनट)

### 1.1 Turso CLI install करें (local machine पर)

**Mac/Linux:**
```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

**Windows (PowerShell):**
```powershell
irm https://get.tur.so/install.ps1 | iex
```

### 1.2 Login + Database बनाएं

```bash
# Turso पर login (browser खुलेगा)
turso auth login

# नया database बनाएं
turso db create cg-board

# Database URL निकालें (इसे नोट कर लें)
turso db show cg-board --url
# उदा: libsql://cg-board-yourname.turso.io

# Auth token बनाएं (इसे भी नोट कर लें, सुरक्षित रखें)
turso db tokens create cg-board
# उदा: eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
```

### 1.3 Schema database में push करें

अपने project folder में जाएं और Turso env vars set करके schema push करें:

```bash
cd /path/to/cg-board-books

# Turso के environment variables set करें
export DATABASE_URL="libsql://cg-board-yourname.turso.io"
export DATABASE_AUTH_TOKEN="eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9..."

# Schema push करें
bun run db:push

# Sample data seed करें (360 किताबें, माध्यम, कक्षाएं, आदि)
bun run db:seed
```

✅ Verify करें:
```bash
turso db shell cg-board "SELECT COUNT(*) FROM Book;"
# उम्मीद है: 360
```

🎉 Database तैयार है!

---

## Step 2: Code को GitHub पर push करें

### 2.1 Git repo initialize करें (अगर पहले नहीं किया)

```bash
cd /path/to/cg-board-books

# .gitignore check करें (node_modules, .env, dev.log, build artifacts excluded होने चाहिए)
cat .gitignore

# Repo initialize + commit
git init
git add .
git commit -m "BOOKS AND NOTES CG BOARD - initial commit"
```

### 2.2 GitHub पर push करें

1. https://github.com/new पर जाएं
2. Repository name: `cg-board-books` (या जो आप चाहें)
3. **Private** चुनें (recommended)
4. "Create repository" क्लिक करें
5. ऊपर दिए commands copy करके चलाएं:

```bash
git remote add origin https://github.com/YOURUSERNAME/cg-board-books.git
git branch -M main
git push -u origin main
```

---

## Step 3: Vercel पर Deploy करें (3 मिनट)

### 3.1 Vercel में project import करें

1. https://vercel.com/new पर जाएं
2. अपना GitHub account connect करें (अगर पहले नहीं किया)
3. "Import Git Repository" में अपनी `cg-board-books` repo ढूंढें → **Import** क्लिक करें

### 3.2 Environment Variables set करें (बहुत ज़रूरी!)

"Configure Project" page पर, **Environment Variables** section में ये 2 variables add करें:

| Name | Value | Environments |
|------|-------|--------------|
| `DATABASE_URL` | `libsql://cg-board-yourname.turso.io` | Production, Preview, Development |
| `DATABASE_AUTH_TOKEN` | `eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...` | Production, Preview, Development |

> ⚠️ इन्हें गलती से भी public मत करें! Token सुरक्षित रखें।

### 3.3 Build settings (अधिकतर auto-detect होंगे, फिर भी verify करें)

- **Framework Preset:** Next.js (auto-detected)
- **Build Command:** `bun run build` (अगर bun नहीं तो `npm run build`)
- **Install Command:** `bun install` (अगर bun नहीं तो `npm install`)
- **Output Directory:** (खाली छोड़ें — Next.js auto-handle करता है)

### 3.4 Deploy!

**"Deploy"** button क्लिक करें। 2-3 मिनट में build complete हो जाएगा।

✅ Deploy होने के बाद आपको URL मिलेगा:
```
https://cg-board-books.vercel.app
```
(या आपके repo name के अनुसार)

---

## Step 4: Verify करें कि सब काम कर रहा है

### 4.1 User App test
- Deploy की गई URL खोलें
- Splash screen दिखना चाहिए → "आगे बढ़ें" → home screen
- माध्यम → कक्षा → विषय → किताब तक navigate करें
- एक किताब download करके read करें — PDF reader खुलना चाहिए

### 4.2 Admin Panel test
- URL के अंत में `#admin` लगाएं: `https://cg-board-books.vercel.app/#admin`
- Password: `admin123` (बदलने का तरीका नीचे)
- Dashboard, Books manager आदि check करें

### 4.3 Vercel logs देखें (अगर कोई error)
- Vercel dashboard → अपना project → **Logs** tab
- या CLI से: `vercel logs <deployment-url>`

---

## Step 5: अपना Domain जोड़ें (optional)

1. Vercel dashboard → project → **Settings** → **Domains**
2. अपना domain type करें (जैसे `cgboardbooks.in`)
3. DNS instructions follow करें (अपने domain provider पर CNAME/A record add करें)
4. Vercel अपने आप free SSL certificate देगा ✅

---

## 🔧 रोज़मर्रा के काम (Maintenance)

### नया code deploy करना
बस `git push` करें — Vercel अपने आप detect करके deploy कर देगा:
```bash
git add .
git commit -m "कोई बदलाव"
git push
```

### Admin password बदलना
Admin panel में login करें → **एप सेटिंग्स** → **Change Admin Password** section।

### Database में नया data add करना
- Admin panel (`/#admin`) से सब कुछ manage होता है — mediums, classes, subjects, books, sidebar, splash, ads, etc.
- Direct database query चलाना हो तो:
  ```bash
  turso db shell cg-board
  ```

### Database backup
```bash
turso db dump cg-board > backup-$(date +%Y%m%d).sql
```

---

## 🆘 Common Problems और Solutions

### Problem 1: Build failed — "Prisma can't reach database"
**Solution:** Environment variables सही से set हैं check करें (Vercel → Settings → Environment Variables)। `DATABASE_URL` `libsql://` से शुरू होनी चाहिए।

### Problem 2: "PrismaClientInitializationError"
**Solution:** `postinstall` script (जो हमने set किया) automatically `prisma generate` चलाता है। फिर भी समस्या हो तो Vercel में "Redeploy" करें।

### Problem 3: PDFs load नहीं हो रही
**Solution:** हमारा `/api/pdf` proxy route Vercel पर 60s timeout के साथ configured है। बहुत बड़ी PDFs (50MB+) के लिए Vercel Pro plan लेना पड़ सकता है।

### Problem 4: "Function Timeout" error
**Solution:** Free tier में API routes का limit 10s है (Hobby plan)। `vercel.json` में `maxDuration: 60` Pro plan में काम करेगा। Free में छोटी PDFs ही use करें।

### Problem 5: Admin panel कैसे खोलें public से छिपाना
पहले से ही hidden है! `#admin` URL सिर्फ आपको पता है। और password भी लगा हुआ है।

---

## 💰 Cost Estimate

| Service | Free Tier | आपका Use |
|---------|-----------|-----------|
| **Vercel Hobby** | 100GB bandwidth, 100GB-hrs build |足够 for thousands of users |
| **Turso Free** | 500 databases, 9GB total, 1B row reads/day | 360 books के लिए बहुत है |

**लगभग ₹0/महीना** for the first few thousand users! 🎉

जब traffic बहुत ज़्यादा हो जाए तब Vercel Pro ($20/mo) और Turso Pro ($29/mo) सोचें।

---

## ✅ Pre-deploy Checklist

deploy से पहले confirm करें:

- [ ] Code GitHub पर push हो गया
- [ ] Turso database बन गई + schema push हो गया
- [ ] Sample data seed हो गया (360 books)
- [ ] Vercel project import हो गया
- [ ] `DATABASE_URL` और `DATABASE_AUTH_TOKEN` env vars set हो गए
- [ ] Build successful
- [ ] User app खुल रहा है
- [ ] Admin panel `/#admin` से खुल रहा है
- [ ] Admin password बदल दिया (default `admin123` से)

---

**कोई समस्या आए तो Vercel के logs check करें — ज़्यादातर errors वहीं दिखते हैं।** 🚀
