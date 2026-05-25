export interface HeroData {
  name: string;
  title: string;
  subtitle: string;
  affiliationLine1: string;
  affiliationLine2: string;
  summary: string;
  imageUrl: string;
  galleryImages: string[];
  videoUrl: string;
  videoUrls: string[];
  cvUrl: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  year: string;
  description?: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  institution: string;
  period: string;
  description?: string;
}

export interface AboutData {
  title: string;
  content: string[];
  aboutImage: string;
  education: EducationItem[];
  experience: ExperienceItem[];
  interests: string[];
  methods: string[];
}

export interface PublicationsConfig {
  title: string;
  description: string;
}

export interface PublicationItem {
  id: string;
  year: number;
  title: string;
  authors: string[];
  journal: string;
  volume?: string;
  issue?: string;
  pages?: string;
  status: 'Published' | 'Under Review' | 'In Preparation';
  doi?: string;
  type: 'article' | 'conference' | 'workshop';
  publishedDate?: string;
}

export interface MethodologyConfig {
  title: string;
  description: string;
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface DevelopmentActivity {
  title: string;
  subtitle: string;
  desc: string;
}

export interface RecentActivityItem {
  id: string;
  name: string;
  description: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
}

export interface ActivitiesData {
  sectionTitle: string;
  sectionDescription: string;
  mentorship: any[]; // Kept for legacy compatibility
  development: DevelopmentActivity[];
  recentActivities: RecentActivityItem[];
}

export interface PersonItem {
  id: string;
  name: string;
  role: string;
  institution: string;
  bio: string;
  imageUrl: string;
}

export interface PeopleConfig {
  title: string;
  description: string;
}

export interface BlogItem {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  author: string;
  readTime: string;
  imageUrl: string;
  galleryImages: string[];
}

export interface BlogsConfig {
  title: string;
  description: string;
}

export interface ProfileItem {
  id: string;
  name: string;
  url: string;
  shortLabel: string;
  iconType: 'default' | 'linkedin' | 'google' | 'researchgate' | 'orcid' | 'scopus' | 'clarivate' | 'facebook' | 'x';
}

export interface ContactData {
  email: string;
  location: string[];
  futureWorkText: string;
  profiles: ProfileItem[];
}

export interface ArchiveItem {
  id: string;
  name: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  fileSize?: number;
}

export interface ArchiveData {
  title: string;
  description: string;
  items: ArchiveItem[];
}

export interface SiteData {
  hero: HeroData;
  about: AboutData;
  publicationsConfig: PublicationsConfig;
  publications: PublicationItem[];
  methodologyConfig: MethodologyConfig;
  skills: SkillCategory[];
  activities: ActivitiesData;
  peopleConfig: PeopleConfig;
  people: PersonItem[];
  blogsConfig: BlogsConfig;
  blogs: BlogItem[];
  contact: ContactData;
  archive?: ArchiveData;
}

