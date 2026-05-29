import { SiteData } from './types';

export const INITIAL_DATA: SiteData = {
  hero: {
    name: "Shaibal Bhattacharjee",
    title: "Coastal & Marine Science Researcher",
    subtitle: "PhD Candidate • Research Assistant",
    affiliationLine1: "Institute of Marine Sciences",
    affiliationLine2: "University of Chittagong",
    summary: "",
    imageUrl: "",
    galleryImages: [],
    videoUrl: "",
    videoUrls: [],
    cvUrl: ""
  },
  about: {
    title: "About Me",
    content: [],
    aboutImage: "",
    education: [],
    experience: [],
    interests: [],
    methods: []
  },
  publicationsConfig: {
    title: "Publications",
    description: "Selected representative works. For a complete list, please visit my Academic Profiles."
  },
  publications: [],
  methodologyConfig: {
    title: "Skills & Key Competencies",
    description: "Combining rigorous fieldwork, advanced geospatial mapping, and computational statistical analysis to understand complex coastal ecosystems."
  },
  skills: [],
  activities: {
    sectionTitle: "Professional Development",
    sectionDescription: "Commitment to academic service, teaching excellence, and community engagement.",
    mentorship: [],
    development: [],
    recentActivities: []
  },
  peopleConfig: {
    title: "Research Group & Collaborators",
    description: "Working alongside esteemed colleagues and dedicated researchers to advance oceanographic science."
  },
  people: [],
  blogsConfig: {
    title: "Blogs",
    description: "Explorations, observations, and research updates from the field of coastal oceanography."
  },
  blogs: [],
  contact: {
    email: "shawonimsfcubd@gmail.com",
    location: [
      "University of Chittagong",
      "Chittagong 4331, Bangladesh"
    ],
    futureWorkText: "Please email me if you have PhD opportunities in similar fields or interest for collaborative research.",
    profiles: [
      { id: "1", name: "ResearchGate", url: "#", shortLabel: "RG", iconType: "researchgate" },
      { id: "2", name: "Google Scholar", url: "#", shortLabel: "GS", iconType: "google" },
      { id: "3", name: "ORCID", url: "#", shortLabel: "ID", iconType: "orcid" },
      { id: "4", name: "Scopus", url: "#", shortLabel: "SC", iconType: "scopus" },
      { id: "5", name: "Clarivate", url: "#", shortLabel: "CL", iconType: "clarivate" },
      { id: "6", name: "LinkedIn", url: "#", shortLabel: "LI", iconType: "linkedin" },
      { id: "7", name: "Facebook", url: "#", shortLabel: "FB", iconType: "facebook" },
      { id: "8", name: "X", url: "#", shortLabel: "X", iconType: "x" }
    ]
  },
  archive: {
    title: "Archive & Field Records",
    description: "An extensive repository of field logs, expedition photos, and laboratory reference material captured during active coastal surveys.",
    items: []
  }
};
