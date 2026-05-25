import { SiteData } from './types';

export const INITIAL_DATA: SiteData = {
  hero: {
    name: "Shaibal Bhattacharjee",
    title: "Coastal & Marine Science Researcher",
    subtitle: "PhD Candidate • Research Assistant",
    affiliationLine1: "Institute of Marine Sciences",
    affiliationLine2: "University of Chittagong",
    summary: "A research-focused scholar investigating sediment–water interactions and coastal ecosystem sustainability using quantitative, geospatial, and statistical approaches in subtropical riverine systems.",
    imageUrl: "https://picsum.photos/400/400?grayscale",
    galleryImages: [
      "https://picsum.photos/400/400?grayscale&random=1",
      "https://picsum.photos/400/400?grayscale&random=2",
      "https://picsum.photos/400/400?grayscale&random=3",
      "https://picsum.photos/400/400?grayscale&random=4",
      "https://picsum.photos/400/400?grayscale&random=5"
    ],
    videoUrl: "https://videos.pexels.com/video-files/3576686/3576686-hd_1920_1080_30fps.mp4",
    videoUrls: [
      "https://videos.pexels.com/video-files/3576686/3576686-hd_1920_1080_30fps.mp4",
      "https://videos.pexels.com/video-files/2103099/2103099-hd_1920_1080_30fps.mp4",
      "https://videos.pexels.com/video-files/5532766/5532766-hd_1920_1080_24fps.mp4",
      "https://videos.pexels.com/video-files/854118/854118-hd_1920_1080_25fps.mp4",
      "https://videos.pexels.com/video-files/5730763/5730763-hd_1920_1080_25fps.mp4"
    ],
    cvUrl: ""
  },
  about: {
    title: "About Me",
    content: [
      "My research is centered on understanding the complex dynamics of coastal and estuarine systems, with a specific focus on the interplay between hydrodynamic processes and sedimentological characteristics. I employ a multidisciplinary approach that integrates field sampling, laboratory analysis, and advanced computational modeling to assess environmental health and sustainability in subtropical riverine environments.",
      "A core component of my work involves analyzing sediment grain size–physicochemical interactions and their role in regulating nutrient cycling and contaminant distribution. I am deeply engaged in water quality modeling and heavy metal assessment in aquatic biota, aiming to quantify the ecological risks posed by anthropogenic stressors.",
      "Furthermore, I utilize geospatial technologies to monitor Landscape and Land Use/Land Cover (LULC) changes, investigating how these shifts influence climate–ecosystem interactions. By applying robust statistical and geospatial tools, my research seeks to provide evidence-based strategies for environmental management and the conservation of vulnerable coastal habitats in Bangladesh and beyond."
    ],
    aboutImage: "https://images.pexels.com/photos/3771074/pexels-photo-3771074.jpeg?auto=compress&cs=tinysrgb&w=800",
    education: [
      {
        id: "1",
        degree: "Ph.D. Candidate in Marine Sciences",
        institution: "University of Chittagong",
        year: "Ongoing",
        description: "Focusing on Coastal Oceanography and Sediment Dynamics."
      },
      {
        id: "2",
        degree: "M.S. in Oceanography",
        institution: "University of Chittagong",
        year: "2018",
        description: "Thesis on estuarine water quality and sediment transport."
      },
      {
        id: "3",
        degree: "B.Sc. in Marine Science",
        institution: "University of Chittagong",
        year: "2016",
        description: "Graduated with distinction."
      }
    ],
    experience: [
      {
        id: "1",
        role: "Research Fellow",
        institution: "Institute of Marine Sciences",
        period: "2019 - Present",
        description: "Conducting extensive field surveys and data analysis for coastal monitoring projects."
      },
      {
        id: "2",
        role: "Research Assistant",
        institution: "Coastal & Estuarine Research Group",
        period: "2017 - 2018",
        description: "Assisted in sample collection and laboratory analysis of sediment cores."
      }
    ],
    interests: [
      "Coastal Hydrology & Sedimentology",
      "Geospatial Analysis (GIS/Remote Sensing)",
      "Ecosystem Dynamics & Sustainability"
    ],
    methods: [
      "Environmental Modeling",
      "Heavy Metal Assessment",
      "Statistical Ecology"
    ]
  },
  publicationsConfig: {
    title: "Publications",
    description: "Selected representative works. For a complete list, please visit my Academic Profiles."
  },
  publications: [
    {
      id: "1",
      year: 2024,
      title: "Spatiotemporal dynamics of heavy metal pollution in sediment and water of the Karnaphuli River Estuary",
      authors: ["Bhattacharjee, S.", "Ahmed, M.", "Islam, R."],
      journal: "Marine Pollution Bulletin",
      status: "Published",
      doi: "10.1016/j.marpolbul.2024.116xxx",
      type: "article"
    },
    {
      id: "2",
      year: 2023,
      title: "Assessment of microplastic contamination in commercial fish species of the Bay of Bengal",
      authors: ["Hossain, K.", "Bhattacharjee, S.", "Chowdhury, A."],
      journal: "Environmental Science and Pollution Research",
      volume: "30",
      pages: "14520-14535",
      status: "Published",
      type: "article"
    },
    {
      id: "3",
      year: 2023,
      title: "Application of Remote Sensing and GIS in monitoring LULC changes in coastal Bangladesh",
      authors: ["Bhattacharjee, S.", "Rahman, S."],
      journal: "International Conference on Advanced Spatial Data Science (ICASDS)",
      status: "Published",
      type: "conference"
    },
    {
      id: "4",
      year: 2022,
      title: "Sediment grain size analysis and its influence on organic carbon distribution in tidal flats",
      authors: ["Bhattacharjee, S.", "et al."],
      journal: "Journal of Sedimentary Environments",
      status: "In Preparation",
      type: "article"
    },
    {
      id: "5",
      year: 2023,
      title: "Advanced Multivariate Statistics for Ecological Data",
      authors: ["Bhattacharjee, S."],
      journal: "National Institute of Oceanography Training Workshop",
      status: "Published",
      type: "workshop"
    }
  ],
  methodologyConfig: {
    title: "Skills & Key Competencies",
    description: "Combining rigorous fieldwork, advanced geospatial mapping, and computational statistical analysis to understand complex coastal ecosystems."
  },
  skills: [
    {
      category: "Statistical Analysis",
      skills: ["SPSS", "R Language", "Minitab", "Python (Pandas/NumPy)"]
    },
    {
      category: "Remote Sensing & GIS",
      skills: ["ArcGIS", "QGIS", "Google Earth Engine", "SAGA GIS", "Satellite Imagery Analysis"]
    },
    {
      category: "Environmental Modeling",
      skills: ["PAST", "Biodiversity Pro", "PRIMER", "Water Quality Indices", "Ecological Risk Assessment"]
    },
    {
      category: "Field & Laboratory",
      skills: ["Sampling Design", "Sediment Analysis", "Heavy Metal Extraction", "In-situ Water Profiling"]
    },
    {
      category: "Professional Competencies",
      skills: ["Driving", "Plumbing & Pipe Fittings", "Swimming"]
    },
    {
      category: "Interpersonal Skills",
      skills: ["Leadership", "Teamwork", "Effective Communication"]
    }
  ],
  activities: {
    sectionTitle: "Professional Development",
    sectionDescription: "Commitment to academic service, teaching excellence, and community engagement.",
    mentorship: [],
    development: [
      {
        title: "Community Involvement",
        subtitle: "Volunteering & Outreach",
        desc: "Active participation in local environmental conservation initiatives and science communication workshops."
      },
      {
        title: "STEM Instruction",
        subtitle: "Academic Teaching",
        desc: "Delivering comprehensive instruction in science and mathematics to undergraduate and high school students."
      },
      {
        title: "Student Research Mentorship",
        subtitle: "Academic Supervision",
        desc: "Guiding junior researchers and undergraduates in experimental design, field sampling, and data analysis."
      },
      {
        title: "Peer Reviewer",
        subtitle: "Scientific Contribution",
        desc: "Serving as a reviewer for reputable journals in marine science, ensuring the quality and integrity of published research."
      }
    ],
    recentActivities: [
      {
        id: "1",
        name: "Monsoon Sediment Monitoring Update",
        description: "Field measurements from the estuary showed stable turbidity bands during spring tide conditions.",
        mediaUrl: "https://images.pexels.com/photos/162568/ocean-wave-sea-water-162568.jpeg?auto=compress&cs=tinysrgb&w=900",
        mediaType: "image"
      },
      {
        id: "2",
        name: "Mangrove Community Workshop",
        description: "Student volunteers completed a coastal awareness program with local schools.",
        mediaUrl: "https://videos.pexels.com/video-files/1550088/1550088-hd_1920_1080_30fps.mp4",
        mediaType: "video"
      },
      {
        id: "3",
        name: "Water Quality Data Review",
        description: "A new dissolved oxygen dataset was finalized and shared with collaborators.",
        mediaUrl: "https://images.pexels.com/photos/844297/pexels-photo-844297.jpeg?auto=compress&cs=tinysrgb&w=900",
        mediaType: "image"
      }
    ]
  },
  peopleConfig: {
    title: "Research Group & Collaborators",
    description: "Working alongside esteemed colleagues and dedicated researchers to advance oceanographic science."
  },
  people: [
    {
      id: "1",
      name: "Dr. Arshad Chowdhury",
      role: "Professor & Supervisor",
      institution: "Institute of Marine Sciences",
      bio: "An academic leader in coastal dynamics with over 25 years of experience in sediment transport modeling.",
      imageUrl: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200"
    },
    {
      id: "2",
      name: "Dr. Farhana Islam",
      role: "Associate Professor",
      institution: "Dept. of Oceanography",
      bio: "Specializes in marine biogeochemistry and nutrient cycling in tropical deltas.",
      imageUrl: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200"
    },
    {
      id: "3",
      name: "Sarah Ahmed",
      role: "Research Associate",
      institution: "Coastal Research Group",
      bio: "Focuses on microplastic pollution in aquatic biota and field surveys.",
      imageUrl: "https://images.pexels.com/photos/3796217/pexels-photo-3796217.jpeg?auto=compress&cs=tinysrgb&w=200"
    },
    {
      id: "4",
      name: "Rafiqul Hasan",
      role: "PhD Candidate",
      institution: "Institute of Marine Sciences",
      bio: "Investigating the impact of climate change on mangrove ecosystems.",
      imageUrl: "https://images.pexels.com/photos/532220/pexels-photo-532220.jpeg?auto=compress&cs=tinysrgb&w=200"
    },
    {
      id: "5",
      name: "Michael Chen",
      role: "Visiting Fellow",
      institution: "NIO",
      bio: "Expert in statistical ecology and multivariate analysis.",
      imageUrl: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=200"
    }
  ],
  blogsConfig: {
    title: "Blogs",
    description: "Explorations, observations, and research updates from the field of coastal oceanography."
  },
  blogs: [
    {
      id: "1",
      title: "Microplastics in the Bay of Bengal: An Invisible Threat",
      date: "March 15, 2024",
      excerpt: "Recent trawling expeditions reveal a disturbing concentration of microplastics in commercial fish species, raising concerns for both marine biodiversity and human health.",
      content: "Full article content goes here...",
      author: "Shaibal Bhattacharjee",
      readTime: "5 min read",
      imageUrl: "https://images.pexels.com/photos/3182811/pexels-photo-3182811.jpeg?auto=compress&cs=tinysrgb&w=600",
      galleryImages: [
        "https://images.pexels.com/photos/3182811/pexels-photo-3182811.jpeg?auto=compress&cs=tinysrgb&w=900",
        "https://images.pexels.com/photos/753626/pexels-photo-753626.jpeg?auto=compress&cs=tinysrgb&w=900",
        "https://images.pexels.com/photos/33129/popcorn-macro-water-plant.jpg?auto=compress&cs=tinysrgb&w=900"
      ]
    },
    {
      id: "2",
      title: "Sediment Transport Dynamics in the Karnaphuli Estuary",
      date: "February 28, 2024",
      excerpt: "Investigating how seasonal monsoons alter sediment flux and the subsequent implications for dredging and port navigability.",
      content: "Full article content goes here...",
      author: "Shaibal Bhattacharjee",
      readTime: "8 min read",
      imageUrl: "https://images.pexels.com/photos/2132003/pexels-photo-2132003.jpeg?auto=compress&cs=tinysrgb&w=600",
      galleryImages: [
        "https://images.pexels.com/photos/2132003/pexels-photo-2132003.jpeg?auto=compress&cs=tinysrgb&w=900",
        "https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=900",
        "https://images.pexels.com/photos/8110294/pexels-photo-8110294.jpeg?auto=compress&cs=tinysrgb&w=900"
      ]
    },
    {
      id: "3",
      title: "Mangrove Resilience in the Face of Climate Change",
      date: "January 10, 2024",
      excerpt: "A look at the Sundarbans and how rising sea levels are impacting the zonation of mangrove species, based on recent satellite imagery analysis.",
      content: "Full article content goes here...",
      author: "Shaibal Bhattacharjee",
      readTime: "6 min read",
      imageUrl: "https://images.pexels.com/photos/4577407/pexels-photo-4577407.jpeg?auto=compress&cs=tinysrgb&w=600",
      galleryImages: [
        "https://images.pexels.com/photos/4577407/pexels-photo-4577407.jpeg?auto=compress&cs=tinysrgb&w=900",
        "https://images.pexels.com/photos/21614969/pexels-photo-21614969.jpeg?auto=compress&cs=tinysrgb&w=900",
        "https://images.pexels.com/photos/4254176/pexels-photo-4254176.jpeg?auto=compress&cs=tinysrgb&w=900"
      ]
    }
  ],
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
    items: [
      {
        id: "arch-1",
        name: "River Estuary Core Sampling",
        mediaUrl: "https://images.pexels.com/photos/1001752/pexels-photo-1001752.jpeg?auto=compress&cs=tinysrgb&w=900",
        mediaType: "image",
        fileSize: 2100000
      },
      {
        id: "arch-2",
        name: "Estuarine Flow Recording",
        mediaUrl: "https://videos.pexels.com/video-files/3576686/3576686-hd_1920_1080_30fps.mp4",
        mediaType: "video",
        fileSize: 4500000
      },
      {
        id: "arch-3",
        name: "Sediment Profile Identification",
        mediaUrl: "https://images.pexels.com/photos/162568/ocean-wave-sea-water-162568.jpeg?auto=compress&cs=tinysrgb&w=900",
        mediaType: "image",
        fileSize: 1850000
      }
    ]
  }
};
