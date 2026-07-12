import { db } from "../src/lib/db";

// Stable public sample PDFs used for the demo library (all verified working)
const SAMPLE_PDFS = [
  "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
  "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  "https://www.orimi.com/pdf-test.pdf",
  "https://pdfobject.com/pdf/sample.pdf",
];

const COVERS = [
  "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80",
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80",
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&q=80",
  "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&q=80",
];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

async function main() {
  console.log("Seeding...");
  console.log("seed.ts DATABASE_URL:", process.env.DATABASE_URL);
  console.log("seed.ts DATABASE_AUTH_TOKEN length:", process.env.DATABASE_AUTH_TOKEN?.length);

  // ---------- App settings ----------
  const settings = [
    { key: "admin_password", value: "admin123" },
    { key: "app_name", value: "BOOKS AND NOTES CG BOARD" },
    { key: "app_tagline", value: "Chhattisgarh Board • Hindi & English Medium" },
    { key: "primary_color", value: "#059669" },
    { key: "require_internet", value: "true" },
    { key: "version", value: "1.0.0" },
    { key: "contact_email", value: "support@cgboardbooks.in" },
    { key: "privacy_url", value: "https://cgboardbooks.in/privacy" },
    { key: "about_text", value: "BOOKS AND NOTES CG BOARD — CG Board की सभी कक्षाओं की किताबें, नोट्स और अध्ययन सामग्री एक ही ऐप में, हिंदी व अंग्रेजी दोनों माध्यम में, ऑफलाइन पढ़ने की सुविधा के साथ।" },
  ];
  for (const s of settings) {
    await db.appSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }

  // ---------- Splash slides ----------
  await db.splashSlide.deleteMany({});
  const splashData = [
    { imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80", title: "स्वागत है", subtitle: "CG Board की सभी किताबें एक जगह", order: 0, duration: 2600 },
    { imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80", title: "हिंदी व अंग्रेजी माध्यम", subtitle: "दोनों माध्यमों की पूरी सामग्री", order: 1, duration: 2600 },
    { imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80", title: "ऑफलाइन पढ़ें", subtitle: "एक बार डाउनलोड, बार-बार पढ़ें", order: 2, duration: 2600 },
    { imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80", title: "बुक्स • नोट्स • अन्य", subtitle: "किताबें, नोट्स और अतिरिक्त सामग्री", order: 3, duration: 2600 },
  ];
  for (const s of splashData) {
    await db.splashSlide.create({ data: s });
  }

  // ---------- Sidebar items ----------
  await db.sidebarItem.deleteMany({});
  const sidebarData = [
    { label: "होम", icon: "Home", linkType: "screen", linkValue: "home", order: 0 },
    { label: "माई लाइब्रेरी", icon: "Library", linkType: "screen", linkValue: "library", order: 1 },
    { label: "बुकमार्क्स", icon: "Bookmark", linkType: "screen", linkValue: "bookmarks", order: 2 },
    { label: "डाउनलोड्स", icon: "Download", linkType: "screen", linkValue: "downloads", order: 3 },
    { label: "सेटिंग्स", icon: "Settings", linkType: "screen", linkValue: "settings", order: 4 },
    { label: "शेयर करें", icon: "Share2", linkType: "external", linkValue: "https://cgboardbooks.in/share", order: 5 },
    { label: "रेट करें", icon: "Star", linkType: "external", linkValue: "https://cgboardbooks.in/rate", order: 6 },
    { label: "संपर्क करें", icon: "Mail", linkType: "external", linkValue: "https://cgboardbooks.in/contact", order: 7 },
    { label: "प्राइवेसी पॉलिसी", icon: "Shield", linkType: "external", linkValue: "https://cgboardbooks.in/privacy", order: 8 },
  ];
  for (const s of sidebarData) {
    await db.sidebarItem.create({ data: s });
  }

  // ---------- Bottom nav ----------
  await db.bottomNavItem.deleteMany({});
  const bottomNavData = [
    { label: "होम", icon: "Home", screen: "home", order: 0 },
    { label: "लाइब्रेरी", icon: "Library", screen: "library", order: 1 },
    { label: "बुकमार्क", icon: "Bookmark", screen: "bookmarks", order: 2 },
    { label: "सेटिंग्स", icon: "Settings", screen: "settings", order: 3 },
    { label: "एक्जिट", icon: "LogOut", screen: "exit", order: 4 },
  ];
  for (const s of bottomNavData) {
    await db.bottomNavItem.create({ data: s });
  }

  // ---------- Ad config ----------
  await db.adConfig.deleteMany({});
  await db.adConfig.create({
    data: {
      network: "admob",
      enabled: true,
      appId: "ca-app-pub-3940256099942544~3347511713",
      bannerAdUnitId: "ca-app-pub-3940256099942544/6300978111",
      interstitialAdUnitId: "ca-app-pub-3940256099942544/1033173712",
      nativeAdUnitId: "ca-app-pub-3940256099942544/2247696110",
      rewardedAdUnitId: "ca-app-pub-3940256099942544/5224354917",
      appOpenAdUnitId: "ca-app-pub-3940256099942544/9257395921",
      bannerEnabled: true,
      interstitialEnabled: true,
      nativeEnabled: false,
      rewardedEnabled: false,
      appOpenEnabled: true,
      interstitialInterval: 3,
      testMode: true,
    },
  });

  // ---------- Notification config ----------
  await db.notificationConfig.deleteMany({});
  await db.notificationConfig.create({
    data: {
      enabled: true,
      onesignalAppId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    },
  });

  // ---------- Content: Mediums -> Classes -> Subjects -> Books ----------
  await db.book.deleteMany({});
  await db.subject.deleteMany({});
  await db.class.deleteMany({});
  await db.medium.deleteMany({});

  const mediums = [
    { name: "हिंदी माध्यम", code: "hi", icon: "📜", color: "#059669", order: 0 },
    { name: "English Medium", code: "en", icon: "📖", color: "#d97706", order: 1 },
  ];
  const mediumRecs = [];
  for (const m of mediums) {
    mediumRecs.push(await db.medium.create({ data: m }));
  }

  const classNames = ["कक्षा 1", "कक्षा 2", "कक्षा 3", "कक्षा 4", "कक्षा 5", "कक्षा 6", "कक्षा 7", "कक्षा 8", "कक्षा 9", "कक्षा 10"];
  const classNamesEn = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"];

  const subjectsHi = ["हिंदी", "अंग्रेजी", "गणित", "विज्ञान", "सामाजिक विज्ञान", "संस्कृत"];
  const subjectsEn = ["Hindi", "English", "Mathematics", "Science", "Social Science", "Sanskrit"];

  const subjectIcons = ["📖", "🔤", "➗", "🔬", "🌐", "🕉️"];
  const bookTypes = ["book", "notes", "other"];

  let bookCounter = 0;
  for (let mi = 0; mi < mediumRecs.length; mi++) {
    const medium = mediumRecs[mi];
    const names = mi === 0 ? classNames : classNamesEn;
    const subjNames = mi === 0 ? subjectsHi : subjectsEn;

    for (let ci = 0; ci < names.length; ci++) {
      const cls = await db.class.create({
        data: {
          name: names[ci],
          code: `${medium.code}-c${ci + 1}`,
          icon: "🏫",
          order: ci,
          mediumId: medium.id,
        },
      });

      for (let si = 0; si < subjNames.length; si++) {
        const subj = await db.subject.create({
          data: {
            name: subjNames[si],
            icon: subjectIcons[si % subjectIcons.length],
            order: si,
            classId: cls.id,
          },
        });

        // 3 books per subject: one of each type
        for (let ti = 0; ti < bookTypes.length; ti++) {
          const t = bookTypes[ti];
          const labelMap = mi === 0
            ? { book: "पाठ्यपुस्तक", notes: "नोट्स", other: "अन्य सामग्री" }
            : { book: "Textbook", notes: "Notes", other: "Other Material" };
          bookCounter++;
          await db.book.create({
            data: {
              title: `${subjNames[si]} ${labelMap[t]} — ${names[ci]}`,
              description: mi === 0
                ? `${names[ci]} ${subjNames[si]} के लिए ${labelMap[t].toLowerCase()}, CG बोर्ड के अनुसार तैयार।`
                : `${labelMap[t]} for ${subjNames[si]}, ${names[ci]} — aligned with CG Board syllabus.`,
              type: t,
              coverUrl: pick(COVERS, bookCounter),
              pdfUrl: pick(SAMPLE_PDFS, bookCounter),
              fileSize: 1200000 + (bookCounter % 9) * 240000,
              pages: 60 + (bookCounter % 7) * 22,
              author: "CG Board",
              icon: t === "book" ? "📕" : t === "notes" ? "📝" : "📂",
              order: ti,
              subjectId: subj.id,
              downloads: Math.floor(Math.random() * 5000),
            },
          });
        }
      }
    }
  }

  console.log(`Seed complete. Books: ${bookCounter}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
