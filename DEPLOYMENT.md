# 🚀 دليل النشر المجاني - Vercel + Neon

## المنصات المستخدمة
| الجزء | المنصة | الرابط |
|-------|--------|--------|
| قاعدة البيانات | Neon (PostgreSQL) | https://neon.tech |
| Frontend + Backend | Vercel | https://vercel.com |

---

## الخطوة 1: ارفع التعديلات على GitHub

```bash
git add .
git commit -m "feat: prepare for Vercel deployment"
git push origin main
```

---

## الخطوة 2: ربط المشروع بـ Vercel

1. اذهب إلى vercel.com → "Add New Project"
2. اختر مستودع video-fact-checker-mvp
3. في إعدادات المشروع:
   - Framework Preset: Other
   - Root Directory: . (الجذر)
4. في قسم Environment Variables أضف:

| Key | Value |
|-----|-------|
| DATABASE_URL | (Connection String من Neon) |
| JWT_SECRET | (أي نص عشوائي طويل) |
| NODE_ENV | production |

5. اضغط Deploy

---

## الخطوة 3: تشغيل migrations

بعد نجاح أول deploy:
1. على جهازك نفّذ:
   DATABASE_URL="..." pnpm db:push

---

## ✅ النتيجة

رابط واحد يخدم كل شيء:
- https://your-app.vercel.app  ← الواجهة
- https://your-app.vercel.app/api/trpc  ← الـ API
