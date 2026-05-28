import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  buildPlacementSeries,
  buildReviewSeries,
  loadIndiaColleges,
  type SeedCollege
} from "../src/data/india-colleges.js";

const prisma = new PrismaClient();

const seededColleges: SeedCollege[] = [
  {
    name: "National Institute of Technology Trident",
    slug: "nit-trident",
    city: "Jaipur",
    state: "Rajasthan",
    annualFees: 225000,
    rating: 4.5,
    placementRate: 88,
    establishedIn: 1986,
    type: "Public",
    website: "https://nit-trident.example.edu",
    description: "High-rigor engineering institute with strong computer science and analytics outcomes.",
    courses: [
      { name: "B.Tech CSE", duration: "4 years", seats: 240, totalFee: 900000, averageCtc: 17.8 },
      { name: "B.Tech Mechanical", duration: "4 years", seats: 180, totalFee: 850000, averageCtc: 10.2 },
      { name: "B.Tech ECE", duration: "4 years", seats: 180, totalFee: 880000, averageCtc: 13.4 }
    ],
    cutoffs: [
      { exam: "JEE", maxRank: 18000, scoreBand: "Top 18k" },
      { exam: "BITSAT", maxRank: 12000, scoreBand: "Top 12k" }
    ]
  },
  {
    name: "Coastal School of Technology",
    slug: "coastal-school-tech",
    city: "Mangalore",
    state: "Karnataka",
    annualFees: 195000,
    rating: 4.2,
    placementRate: 82,
    establishedIn: 1994,
    type: "Private",
    website: "https://coastal-tech.example.edu",
    description: "Application-focused engineering programs with strong internships and practical labs.",
    courses: [
      { name: "B.Tech IT", duration: "4 years", seats: 180, totalFee: 760000, averageCtc: 11.1 },
      { name: "B.Tech Data Science", duration: "4 years", seats: 120, totalFee: 790000, averageCtc: 12.6 },
      { name: "B.Tech Civil", duration: "4 years", seats: 120, totalFee: 710000, averageCtc: 8.1 }
    ],
    cutoffs: [
      { exam: "JEE", maxRank: 45000, scoreBand: "Top 45k" },
      { exam: "KCET", maxRank: 16000, scoreBand: "Top 16k" }
    ]
  },
  {
    name: "Metro University of Computing",
    slug: "metro-university-computing",
    city: "Pune",
    state: "Maharashtra",
    annualFees: 310000,
    rating: 4.6,
    placementRate: 91,
    establishedIn: 2002,
    type: "Private",
    website: "https://metro-computing.example.edu",
    description: "Tech-first university with strong startup pipelines and AI programs.",
    courses: [
      { name: "B.Tech AI & ML", duration: "4 years", seats: 200, totalFee: 1260000, averageCtc: 20.3 },
      { name: "B.Tech CSE", duration: "4 years", seats: 260, totalFee: 1240000, averageCtc: 18.9 },
      { name: "BBA Digital Business", duration: "3 years", seats: 150, totalFee: 690000, averageCtc: 7.4 }
    ],
    cutoffs: [
      { exam: "JEE", maxRank: 24000, scoreBand: "Top 24k" },
      { exam: "MHT-CET", maxRank: 9500, scoreBand: "Top 9.5k" }
    ]
  },
  {
    name: "Riverdale Institute of Management",
    slug: "riverdale-management",
    city: "Indore",
    state: "Madhya Pradesh",
    annualFees: 145000,
    rating: 4.1,
    placementRate: 76,
    establishedIn: 1991,
    type: "Private",
    website: "https://riverdale-mgmt.example.edu",
    description: "Management and commerce-focused institute with regional industry partnerships.",
    courses: [
      { name: "BBA", duration: "3 years", seats: 320, totalFee: 420000, averageCtc: 6.2 },
      { name: "B.Com (Hons)", duration: "3 years", seats: 240, totalFee: 330000, averageCtc: 5.1 },
      { name: "MBA", duration: "2 years", seats: 180, totalFee: 520000, averageCtc: 8.8 }
    ],
    cutoffs: [
      { exam: "CUET", maxRank: 55000, scoreBand: "Top 55k" },
      { exam: "CAT", maxRank: 28000, scoreBand: "Top 28k" }
    ]
  },
  {
    name: "Eastern Medical Sciences College",
    slug: "eastern-medical-sciences",
    city: "Bhubaneswar",
    state: "Odisha",
    annualFees: 680000,
    rating: 4.3,
    placementRate: 94,
    establishedIn: 1978,
    type: "Public",
    website: "https://eastern-medical.example.edu",
    description: "Comprehensive medical institution with a teaching hospital and research centers.",
    courses: [
      { name: "MBBS", duration: "5.5 years", seats: 200, totalFee: 3400000, averageCtc: 14.8 },
      { name: "B.Sc Nursing", duration: "4 years", seats: 120, totalFee: 580000, averageCtc: 6.2 },
      { name: "BPT", duration: "4.5 years", seats: 80, totalFee: 640000, averageCtc: 5.8 }
    ],
    cutoffs: [{ exam: "NEET", maxRank: 32000, scoreBand: "Top 32k" }]
  },
  {
    name: "North Valley Law University",
    slug: "north-valley-law-university",
    city: "Lucknow",
    state: "Uttar Pradesh",
    annualFees: 255000,
    rating: 4.4,
    placementRate: 79,
    establishedIn: 1988,
    type: "Public",
    website: "https://northvalley-law.example.edu",
    description: "Dedicated legal studies university with national moot and policy programs.",
    courses: [
      { name: "BA LLB", duration: "5 years", seats: 180, totalFee: 1080000, averageCtc: 9.3 },
      { name: "BBA LLB", duration: "5 years", seats: 120, totalFee: 1120000, averageCtc: 9.7 },
      { name: "LLM", duration: "2 years", seats: 60, totalFee: 460000, averageCtc: 7.1 }
    ],
    cutoffs: [{ exam: "CLAT", maxRank: 4200, scoreBand: "Top 4.2k" }]
  },
  {
    name: "Horizon Design and Arts Institute",
    slug: "horizon-design-arts",
    city: "Ahmedabad",
    state: "Gujarat",
    annualFees: 295000,
    rating: 4.0,
    placementRate: 68,
    establishedIn: 2001,
    type: "Private",
    website: "https://horizon-design.example.edu",
    description: "Design school with strong studio practice and portfolio-led curriculum.",
    courses: [
      { name: "B.Des Communication", duration: "4 years", seats: 100, totalFee: 1260000, averageCtc: 7.3 },
      { name: "B.Des Product", duration: "4 years", seats: 80, totalFee: 1220000, averageCtc: 7.1 },
      { name: "M.Des", duration: "2 years", seats: 40, totalFee: 730000, averageCtc: 8.4 }
    ],
    cutoffs: [
      { exam: "NID DAT", maxRank: 3400, scoreBand: "Top 3.4k" },
      { exam: "UCEED", maxRank: 6000, scoreBand: "Top 6k" }
    ]
  },
  {
    name: "Central Agriculture and Sustainability University",
    slug: "central-agri-sustainability",
    city: "Nagpur",
    state: "Maharashtra",
    annualFees: 115000,
    rating: 3.9,
    placementRate: 72,
    establishedIn: 1968,
    type: "Public",
    website: "https://central-agri.example.edu",
    description: "Agriculture and sustainability education focused on climate resilient systems.",
    courses: [
      { name: "B.Sc Agriculture", duration: "4 years", seats: 260, totalFee: 420000, averageCtc: 6.1 },
      { name: "B.Tech Food Tech", duration: "4 years", seats: 140, totalFee: 490000, averageCtc: 7.2 },
      { name: "M.Sc Agronomy", duration: "2 years", seats: 90, totalFee: 270000, averageCtc: 6.5 }
    ],
    cutoffs: [
      { exam: "ICAR", maxRank: 23000, scoreBand: "Top 23k" },
      { exam: "CUET", maxRank: 71000, scoreBand: "Top 71k" }
    ]
  },
  {
    name: "Summit College of Pharmacy",
    slug: "summit-pharmacy",
    city: "Hyderabad",
    state: "Telangana",
    annualFees: 210000,
    rating: 4.2,
    placementRate: 81,
    establishedIn: 1997,
    type: "Private",
    website: "https://summit-pharma.example.edu",
    description: "Pharmacy college with pharmaceutical industry placement links.",
    courses: [
      { name: "B.Pharm", duration: "4 years", seats: 220, totalFee: 760000, averageCtc: 8.5 },
      { name: "Pharm.D", duration: "6 years", seats: 90, totalFee: 1320000, averageCtc: 10.1 },
      { name: "M.Pharm", duration: "2 years", seats: 80, totalFee: 440000, averageCtc: 9.2 }
    ],
    cutoffs: [
      { exam: "TS EAMCET", maxRank: 19500, scoreBand: "Top 19.5k" },
      { exam: "NEET", maxRank: 90000, scoreBand: "Top 90k" }
    ]
  },
  {
    name: "Western Institute of Architecture",
    slug: "western-architecture",
    city: "Mumbai",
    state: "Maharashtra",
    annualFees: 355000,
    rating: 4.5,
    placementRate: 84,
    establishedIn: 1975,
    type: "Private",
    website: "https://western-arch.example.edu",
    description: "Architecture school with globally benchmarked studios and urban labs.",
    courses: [
      { name: "B.Arch", duration: "5 years", seats: 160, totalFee: 1820000, averageCtc: 10.6 },
      { name: "M.Arch", duration: "2 years", seats: 70, totalFee: 620000, averageCtc: 9.4 },
      { name: "Urban Planning PG", duration: "2 years", seats: 50, totalFee: 590000, averageCtc: 9.8 }
    ],
    cutoffs: [
      { exam: "NATA", maxRank: 15000, scoreBand: "Top 15k" },
      { exam: "JEE", maxRank: 52000, scoreBand: "Top 52k" }
    ]
  },
  {
    name: "Global Institute of Hospitality",
    slug: "global-hospitality",
    city: "Goa",
    state: "Goa",
    annualFees: 265000,
    rating: 4.1,
    placementRate: 86,
    establishedIn: 2004,
    type: "Private",
    website: "https://global-hospitality.example.edu",
    description: "Hospitality and tourism institute with international internship tie-ups.",
    courses: [
      { name: "BHM", duration: "4 years", seats: 210, totalFee: 980000, averageCtc: 7.8 },
      { name: "BBA Tourism", duration: "3 years", seats: 120, totalFee: 580000, averageCtc: 6.3 },
      { name: "MBA Hospitality", duration: "2 years", seats: 90, totalFee: 720000, averageCtc: 8.6 }
    ],
    cutoffs: [
      { exam: "NCHMCT JEE", maxRank: 7400, scoreBand: "Top 7.4k" },
      { exam: "CUET", maxRank: 81000, scoreBand: "Top 81k" }
    ]
  },
  {
    name: "Techspire University",
    slug: "techspire-university",
    city: "Chennai",
    state: "Tamil Nadu",
    annualFees: 185000,
    rating: 4.4,
    placementRate: 89,
    establishedIn: 1999,
    type: "Private",
    website: "https://techspire.example.edu",
    description: "Industry integrated engineering university with strong software placement records.",
    courses: [
      { name: "B.Tech CSE", duration: "4 years", seats: 300, totalFee: 760000, averageCtc: 14.2 },
      { name: "B.Tech EEE", duration: "4 years", seats: 180, totalFee: 700000, averageCtc: 10.8 },
      { name: "B.Tech Biotechnology", duration: "4 years", seats: 120, totalFee: 720000, averageCtc: 9.4 }
    ],
    cutoffs: [
      { exam: "JEE", maxRank: 36000, scoreBand: "Top 36k" },
      { exam: "TNEA", maxRank: 8800, scoreBand: "Top 8.8k" }
    ]
  },
  {
    name: "Aurora School of Public Policy",
    slug: "aurora-public-policy",
    city: "Delhi",
    state: "Delhi",
    annualFees: 275000,
    rating: 4.3,
    placementRate: 74,
    establishedIn: 2010,
    type: "Private",
    website: "https://aurora-policy.example.edu",
    description: "Interdisciplinary school focused on governance, economics, and policy analytics.",
    courses: [
      { name: "BA Economics", duration: "3 years", seats: 180, totalFee: 810000, averageCtc: 8.8 },
      { name: "BA Public Policy", duration: "3 years", seats: 140, totalFee: 840000, averageCtc: 8.2 },
      { name: "MA Public Administration", duration: "2 years", seats: 80, totalFee: 560000, averageCtc: 7.9 }
    ],
    cutoffs: [{ exam: "CUET", maxRank: 19000, scoreBand: "Top 19k" }]
  },
  {
    name: "Pioneer Institute of Marine Engineering",
    slug: "pioneer-marine-engineering",
    city: "Kochi",
    state: "Kerala",
    annualFees: 235000,
    rating: 4.0,
    placementRate: 83,
    establishedIn: 1983,
    type: "Public",
    website: "https://pioneer-marine.example.edu",
    description: "Marine engineering and logistics institute with port-industry alignment.",
    courses: [
      { name: "B.Tech Marine Engineering", duration: "4 years", seats: 120, totalFee: 960000, averageCtc: 12.5 },
      { name: "B.Sc Nautical Science", duration: "3 years", seats: 80, totalFee: 740000, averageCtc: 11.3 },
      { name: "MBA Logistics", duration: "2 years", seats: 70, totalFee: 420000, averageCtc: 8.7 }
    ],
    cutoffs: [
      { exam: "JEE", maxRank: 61000, scoreBand: "Top 61k" },
      { exam: "IMU CET", maxRank: 4500, scoreBand: "Top 4.5k" }
    ]
  },
  {
    name: "Snowline Institute of Renewable Energy",
    slug: "snowline-renewable-energy",
    city: "Dehradun",
    state: "Uttarakhand",
    annualFees: 165000,
    rating: 4.2,
    placementRate: 73,
    establishedIn: 2008,
    type: "Private",
    website: "https://snowline-energy.example.edu",
    description: "Focused energy programs with fieldwork in solar, hydro, and storage systems.",
    courses: [
      { name: "B.Tech Energy Engineering", duration: "4 years", seats: 140, totalFee: 640000, averageCtc: 8.4 },
      { name: "B.Tech Electrical", duration: "4 years", seats: 160, totalFee: 610000, averageCtc: 9.1 },
      { name: "M.Tech Renewable Systems", duration: "2 years", seats: 60, totalFee: 290000, averageCtc: 9.8 }
    ],
    cutoffs: [
      { exam: "JEE", maxRank: 70000, scoreBand: "Top 70k" },
      { exam: "CUET", maxRank: 89000, scoreBand: "Top 89k" }
    ]
  },
  {
    name: "Capital College of Journalism",
    slug: "capital-journalism-college",
    city: "Bhopal",
    state: "Madhya Pradesh",
    annualFees: 98000,
    rating: 3.8,
    placementRate: 61,
    establishedIn: 1996,
    type: "Private",
    website: "https://capital-journalism.example.edu",
    description: "Media, journalism, and production training with regional newsroom pipelines.",
    courses: [
      { name: "BA Journalism", duration: "3 years", seats: 180, totalFee: 270000, averageCtc: 4.9 },
      { name: "BA Mass Communication", duration: "3 years", seats: 140, totalFee: 260000, averageCtc: 5.2 },
      { name: "MA Broadcast Media", duration: "2 years", seats: 50, totalFee: 180000, averageCtc: 6.1 }
    ],
    cutoffs: [{ exam: "CUET", maxRank: 110000, scoreBand: "Top 110k" }]
  },
  {
    name: "Frontier Institute of Sports Science",
    slug: "frontier-sports-science",
    city: "Patiala",
    state: "Punjab",
    annualFees: 132000,
    rating: 3.7,
    placementRate: 58,
    establishedIn: 1989,
    type: "Public",
    website: "https://frontier-sports.example.edu",
    description: "Sports science, physiotherapy, and performance analytics programs.",
    courses: [
      { name: "B.Sc Sports Science", duration: "3 years", seats: 220, totalFee: 360000, averageCtc: 5.4 },
      { name: "BPT", duration: "4.5 years", seats: 120, totalFee: 420000, averageCtc: 5.9 },
      { name: "M.Sc Performance Analytics", duration: "2 years", seats: 45, totalFee: 240000, averageCtc: 6.8 }
    ],
    cutoffs: [
      { exam: "CUET", maxRank: 96000, scoreBand: "Top 96k" },
      { exam: "NEET", maxRank: 125000, scoreBand: "Top 125k" }
    ]
  },
  {
    name: "Zenith Institute of Aviation Management",
    slug: "zenith-aviation-management",
    city: "Noida",
    state: "Uttar Pradesh",
    annualFees: 325000,
    rating: 4.1,
    placementRate: 87,
    establishedIn: 2007,
    type: "Private",
    website: "https://zenith-aviation.example.edu",
    description: "Aviation management programs with airport operations and airline partnerships.",
    courses: [
      { name: "BBA Aviation Management", duration: "3 years", seats: 160, totalFee: 930000, averageCtc: 8.1 },
      { name: "B.Sc Aviation", duration: "3 years", seats: 100, totalFee: 980000, averageCtc: 7.6 },
      { name: "MBA Aviation", duration: "2 years", seats: 70, totalFee: 760000, averageCtc: 9.4 }
    ],
    cutoffs: [
      { exam: "CUET", maxRank: 52000, scoreBand: "Top 52k" },
      { exam: "AIMA UGAT", maxRank: 9800, scoreBand: "Top 9.8k" }
    ]
  },
  {
    name: "Lighthouse Institute of Social Work",
    slug: "lighthouse-social-work",
    city: "Ranchi",
    state: "Jharkhand",
    annualFees: 72000,
    rating: 3.9,
    placementRate: 64,
    establishedIn: 1972,
    type: "Public",
    website: "https://lighthouse-socialwork.example.edu",
    description: "Affordable social science and community development education with NGO partnerships.",
    courses: [
      { name: "BSW", duration: "3 years", seats: 200, totalFee: 180000, averageCtc: 4.6 },
      { name: "MSW", duration: "2 years", seats: 120, totalFee: 130000, averageCtc: 5.7 },
      { name: "MA Development Studies", duration: "2 years", seats: 60, totalFee: 140000, averageCtc: 5.5 }
    ],
    cutoffs: [{ exam: "CUET", maxRank: 125000, scoreBand: "Top 125k" }]
  }
];

const colleges: SeedCollege[] = loadIndiaColleges();

async function main() {
  await prisma.answer.deleteMany();
  await prisma.question.deleteMany();
  await prisma.answerRevision.deleteMany();
  await prisma.questionRevision.deleteMany();
  await prisma.savedCollege.deleteMany();
  await prisma.savedComparison.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.collegeReview.deleteMany();
  await prisma.collegePlacement.deleteMany();
  await prisma.collegeCutoff.deleteMany();
  await prisma.collegeCourse.deleteMany();
  await prisma.college.deleteMany();
  await prisma.user.deleteMany();

  const demoPasswordHash = await bcrypt.hash("Demo@12345", 10);
  const moderatorPasswordHash = await bcrypt.hash("Guide@12345", 10);

  const demoUser = await prisma.user.create({
    data: {
      email: "demo@student.com",
      name: "Demo Student",
      passwordHash: demoPasswordHash
    }
  });

  const communityUser = await prisma.user.create({
    data: {
      email: "guide@student.com",
      name: "Campus Guide",
      passwordHash: moderatorPasswordHash
    }
  });

  for (const college of colleges) {
    await prisma.college.create({
      data: {
        name: college.name,
        slug: college.slug,
        location: `${college.city}, ${college.state}`,
        city: college.city,
        state: college.state,
        annualFees: college.annualFees,
        rating: college.rating,
        placementRate: college.placementRate,
        establishedIn: college.establishedIn,
        type: college.type,
        website: college.website,
        description: college.description,
        courses: {
          createMany: {
            data: college.courses
          }
        },
        cutoffs: {
          createMany: {
            data: college.cutoffs
          }
        },
        placements: {
          createMany: {
            data: buildPlacementSeries(college)
          }
        },
        reviews: {
          create: buildReviewSeries(college).map((review, index) => ({
            ...review,
            userId: index === 0 ? demoUser.id : index === 1 ? communityUser.id : undefined
          }))
        }
      }
    });
  }

  const highestRated = await prisma.college.findFirst({
    orderBy: [{ rating: "desc" }, { placementRate: "desc" }]
  });

  if (highestRated) {
    await prisma.savedCollege.create({
      data: {
        userId: demoUser.id,
        collegeId: highestRated.id
      }
    });
  }

  const firstTwo = await prisma.college.findMany({
    take: 2,
    orderBy: [{ rating: "desc" }]
  });

  if (firstTwo.length === 2) {
    await prisma.savedComparison.create({
      data: {
        userId: demoUser.id,
        name: "Initial shortlist",
        collegeIds: firstTwo.map((college: { id: string }) => college.id)
      }
    });
  }

  const firstCollege = await prisma.college.findFirst();
  if (firstCollege) {
    const question = await prisma.question.create({
      data: {
        userId: demoUser.id,
        title: "How reliable are the placement stats for flagship programs?",
        body: "I want to compare placement numbers across colleges, but I am not sure whether to trust average CTC or placement rate more."
      }
    });

    await prisma.answer.createMany({
      data: [
        {
          questionId: question.id,
          userId: communityUser.id,
          body: "Use both. Placement rate tells you consistency, while median CTC is a better signal than average if the batch has a few extreme offers."
        },
        {
          questionId: question.id,
          userId: demoUser.id,
          body: "I also check recruiter names and how many offers come from non-core roles before comparing campuses."
        }
      ]
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
