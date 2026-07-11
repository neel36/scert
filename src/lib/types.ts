// Shared TypeScript types for the app.

export type BookType = "book" | "notes" | "other";

export interface Medium {
  id: string;
  name: string;
  code: string;
  icon: string | null;
  color: string | null;
  order: number;
  active: boolean;
}

export interface ClassLevel {
  id: string;
  name: string;
  code: string;
  icon: string | null;
  order: number;
  active: boolean;
  mediumId: string;
}

export interface Subject {
  id: string;
  name: string;
  icon: string | null;
  order: number;
  active: boolean;
  classId: string;
}

export interface Book {
  id: string;
  title: string;
  description: string | null;
  type: BookType;
  coverUrl: string | null;
  pdfUrl: string;
  fileSize: number | null;
  pages: number | null;
  author: string | null;
  icon: string | null;
  order: number;
  active: boolean;
  subjectId: string;
  downloads: number;
}

export interface BookWithPath extends Book {
  mediumId: string;
  mediumName: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  mediumIcon?: string | null;
  subjectIcon?: string | null;
}

export interface ContentTree {
  mediums: (Medium & {
    classes: (ClassLevel & {
      subjects: (Subject & {
        books: Book[];
      })[];
    })[];
  })[];
}

export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  linkType: "screen" | "external";
  linkValue: string;
  order: number;
  active: boolean;
}

export interface BottomNavItem {
  id: string;
  label: string;
  icon: string;
  screen: string;
  order: number;
  active: boolean;
}

export interface SplashSlide {
  id: string;
  imageUrl: string;
  title: string | null;
  subtitle: string | null;
  order: number;
  duration: number;
  active: boolean;
}

export interface AdConfig {
  id: string;
  network: "admob" | "facebook";
  enabled: boolean;
  appId: string | null;
  bannerAdUnitId: string | null;
  interstitialAdUnitId: string | null;
  nativeAdUnitId: string | null;
  rewardedAdUnitId: string | null;
  appOpenAdUnitId: string | null;
  bannerEnabled: boolean;
  interstitialEnabled: boolean;
  nativeEnabled: boolean;
  rewardedEnabled: boolean;
  appOpenEnabled: boolean;
  interstitialInterval: number;
  testMode: boolean;
}

export interface NotificationConfig {
  id: string;
  enabled: boolean;
  onesignalAppId: string | null;
}

export interface AppConfig {
  settings: Record<string, string>;
  splashSlides: SplashSlide[];
  sidebar: SidebarItem[];
  bottomNav: BottomNavItem[];
  adConfig: AdConfig | null;
  notificationConfig: NotificationConfig | null;
}

export interface DownloadedBook {
  id: string;
  title: string;
  type: BookType;
  coverUrl: string | null;
  pdfUrl: string;
  fileSize: number | null;
  pages: number | null;
  icon: string | null;
  // path info
  mediumId: string;
  mediumName: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  downloadedAt: number;
}

export interface Bookmark {
  id: string;
  bookId: string;
  page: number;
  label: string;
  createdAt: number;
}

export interface Note {
  id: string;
  bookId: string;
  page: number;
  text: string;
  color: string;
  createdAt: number;
}

export interface ReadingProgress {
  bookId: string;
  page: number;
  scrollPercent: number;
  updatedAt: number;
}
