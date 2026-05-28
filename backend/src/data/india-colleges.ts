import fs from "fs";
import path from "path";

export type SeedCollege = {
  name: string;
  slug: string;
  city: string;
  state: string;
  annualFees: number;
  rating: number;
  placementRate: number;
  establishedIn: number;
  type: string;
  website?: string | null;
  description: string;
  courses: Array<{
    name: string;
    duration: string;
    seats: number;
    totalFee: number;
    averageCtc: number;
  }>;
  cutoffs: Array<{
    exam: string;
    maxRank: number;
    scoreBand: string;
  }>;
  placements?: Array<{
    year: number;
    placementRate: number;
    medianCtc: number;
    highestCtc: number;
    topRecruiters: string[];
  }>;
  reviews?: Array<{
    authorName: string;
    headline: string;
    body: string;
    rating: number;
    sourceType: string;
  }>;
};

type CatalogSeed = {
  name: string;
  city: string;
  state: string;
  type: "Public" | "Private";
  establishedIn?: number;
  website?: string;
  exams?: string[];
  focus?: "computing" | "core" | "electronics";
};

type LocalCollegeCard = {
  id: string;
  name: string;
  slug: string;
  location: string;
  city: string;
  state: string;
  annualFees: number;
  rating: number;
  placementRate: number;
  type: string;
};

type LocalCollegeDetail = LocalCollegeCard & {
  website: string | null;
  description: string;
  establishedIn: number;
  courses: Array<{
    id: string;
    name: string;
    duration: string;
    seats: number;
    totalFee: number;
    averageCtc: number;
  }>;
  cutoffs: Array<{
    id: string;
    exam: string;
    maxRank: number;
    scoreBand: string;
  }>;
  placements: Array<{
    id: string;
    year: number;
    placementRate: number;
    medianCtc: number;
    highestCtc: number;
    topRecruiters: string[];
  }>;
  reviews: Array<{
    id: string;
    authorName: string;
    headline: string;
    body: string;
    rating: number;
    sourceType: string;
    createdAt: string;
  }>;
};

// College names and locations in this built-in catalog are curated from public state-wise
// institution lists and ranking sources. Fees, cutoffs, placements, and reviews are
// normalized seed values so the app remains complete even when verified structured
// statistics are not available for every institution.
const defaultCollegeCatalog: CatalogSeed[] = [
  { name: "Indian Institute of Technology Tirupati", city: "Tirupati", state: "Andhra Pradesh", type: "Public", establishedIn: 2015, website: "https://www.iittp.ac.in/", exams: ["JEE", "AP EAMCET"], focus: "computing" },
  { name: "National Institute of Technology Andhra Pradesh", city: "Tadepalligudem", state: "Andhra Pradesh", type: "Public", establishedIn: 2015, exams: ["JEE", "AP EAMCET"], focus: "electronics" },
  { name: "IIIT Sri City", city: "Sri City", state: "Andhra Pradesh", type: "Public", establishedIn: 2013, exams: ["JEE", "AP EAMCET"], focus: "computing" },
  { name: "Andhra University College of Engineering", city: "Visakhapatnam", state: "Andhra Pradesh", type: "Public", establishedIn: 1955, exams: ["AP EAMCET"], focus: "core" },
  { name: "Koneru Lakshmaiah Education Foundation", city: "Vaddeswaram", state: "Andhra Pradesh", type: "Private", establishedIn: 1980, website: "https://www.kluniversity.in/", exams: ["JEE", "AP EAMCET"], focus: "computing" },
  { name: "North Eastern Regional Institute of Science and Technology", city: "Itanagar", state: "Arunachal Pradesh", type: "Public", establishedIn: 1984, exams: ["JEE"], focus: "core" },
  { name: "National Institute of Technology Arunachal Pradesh", city: "Yupia", state: "Arunachal Pradesh", type: "Public", establishedIn: 2010, exams: ["JEE"], focus: "electronics" },
  { name: "Rajiv Gandhi University School of Engineering and Technology", city: "Itanagar", state: "Arunachal Pradesh", type: "Public", establishedIn: 1984, exams: ["JEE"], focus: "computing" },
  { name: "North East Frontier Technical University", city: "Aalo", state: "Arunachal Pradesh", type: "Private", establishedIn: 2014, exams: ["JEE"], focus: "core" },
  { name: "Himalayan University", city: "Itanagar", state: "Arunachal Pradesh", type: "Private", establishedIn: 2013, exams: ["JEE"], focus: "computing" },
  { name: "Indian Institute of Technology Guwahati", city: "Guwahati", state: "Assam", type: "Public", establishedIn: 1994, website: "https://www.iitg.ac.in/", exams: ["JEE"], focus: "computing" },
  { name: "National Institute of Technology Silchar", city: "Silchar", state: "Assam", type: "Public", establishedIn: 1967, website: "https://www.nits.ac.in/", exams: ["JEE"], focus: "core" },
  { name: "Assam Engineering College", city: "Guwahati", state: "Assam", type: "Public", establishedIn: 1955, exams: ["JEE"], focus: "core" },
  { name: "Jorhat Engineering College", city: "Jorhat", state: "Assam", type: "Public", establishedIn: 1960, exams: ["JEE"], focus: "electronics" },
  { name: "Tezpur University", city: "Tezpur", state: "Assam", type: "Public", establishedIn: 1994, website: "https://www.tezpuruniversity.ac.in/", exams: ["JEE"], focus: "computing" },
  { name: "Indian Institute of Technology Patna", city: "Patna", state: "Bihar", type: "Public", establishedIn: 2008, website: "https://www.iitp.ac.in/", exams: ["JEE"], focus: "computing" },
  { name: "National Institute of Technology Patna", city: "Patna", state: "Bihar", type: "Public", establishedIn: 1886, website: "https://www.nitp.ac.in/", exams: ["JEE"], focus: "core" },
  { name: "IIIT Bhagalpur", city: "Bhagalpur", state: "Bihar", type: "Public", establishedIn: 2017, exams: ["JEE"], focus: "computing" },
  { name: "Muzaffarpur Institute of Technology", city: "Muzaffarpur", state: "Bihar", type: "Public", establishedIn: 1954, exams: ["JEE"], focus: "core" },
  { name: "Bhagalpur College of Engineering", city: "Bhagalpur", state: "Bihar", type: "Public", establishedIn: 1960, exams: ["JEE"], focus: "electronics" },
  { name: "Indian Institute of Technology Bhilai", city: "Bhilai", state: "Chhattisgarh", type: "Public", establishedIn: 2016, website: "https://www.iitbhilai.ac.in/", exams: ["JEE", "CG PET"], focus: "computing" },
  { name: "National Institute of Technology Raipur", city: "Raipur", state: "Chhattisgarh", type: "Public", establishedIn: 1956, website: "https://nitrr.ac.in/", exams: ["JEE", "CG PET"], focus: "core" },
  { name: "IIIT Naya Raipur", city: "Naya Raipur", state: "Chhattisgarh", type: "Public", establishedIn: 2015, exams: ["JEE", "CG PET"], focus: "computing" },
  { name: "Bhilai Institute of Technology Durg", city: "Durg", state: "Chhattisgarh", type: "Private", establishedIn: 1986, exams: ["CG PET"], focus: "electronics" },
  { name: "Government Engineering College Raipur", city: "Raipur", state: "Chhattisgarh", type: "Public", establishedIn: 2006, exams: ["CG PET"], focus: "core" },
  { name: "BITS Pilani Goa Campus", city: "South Goa", state: "Goa", type: "Private", establishedIn: 2004, exams: ["BITSAT", "JEE"], focus: "computing" },
  { name: "National Institute of Technology Goa", city: "Farmagudi", state: "Goa", type: "Public", establishedIn: 2010, website: "https://www.nitgoa.ac.in/", exams: ["JEE"], focus: "computing" },
  { name: "Goa College of Engineering", city: "Farmagudi", state: "Goa", type: "Public", establishedIn: 1967, exams: ["JEE"], focus: "core" },
  { name: "Don Bosco College of Engineering Goa", city: "Fatorda", state: "Goa", type: "Private", establishedIn: 2011, exams: ["JEE"], focus: "electronics" },
  { name: "Padre Conceicao College of Engineering", city: "Verna", state: "Goa", type: "Private", establishedIn: 1997, exams: ["JEE"], focus: "core" },
  { name: "Indian Institute of Technology Gandhinagar", city: "Gandhinagar", state: "Gujarat", type: "Public", establishedIn: 2008, website: "https://iitgn.ac.in/", exams: ["JEE", "GUJCET"], focus: "computing" },
  { name: "Sardar Vallabhbhai National Institute of Technology Surat", city: "Surat", state: "Gujarat", type: "Public", establishedIn: 1961, website: "https://www.svnit.ac.in/", exams: ["JEE", "GUJCET"], focus: "core" },
  { name: "Dhirubhai Ambani Institute of Information and Communication Technology", city: "Gandhinagar", state: "Gujarat", type: "Private", establishedIn: 2001, website: "https://www.daiict.ac.in/", exams: ["JEE", "GUJCET"], focus: "computing" },
  { name: "Nirma University", city: "Ahmedabad", state: "Gujarat", type: "Private", establishedIn: 2003, website: "https://www.nirmauni.ac.in/", exams: ["JEE", "GUJCET"], focus: "computing" },
  { name: "Dharmsinh Desai University", city: "Nadiad", state: "Gujarat", type: "Private", establishedIn: 1968, exams: ["GUJCET"], focus: "electronics" },
  { name: "National Institute of Technology Kurukshetra", city: "Kurukshetra", state: "Haryana", type: "Public", establishedIn: 1963, exams: ["JEE"], focus: "electronics" },
  { name: "IIIT Sonepat", city: "Sonepat", state: "Haryana", type: "Public", establishedIn: 2014, exams: ["JEE"], focus: "computing" },
  { name: "Deenbandhu Chhotu Ram University of Science and Technology", city: "Murthal", state: "Haryana", type: "Public", establishedIn: 2006, exams: ["JEE"], focus: "core" },
  { name: "J.C. Bose University of Science and Technology YMCA", city: "Faridabad", state: "Haryana", type: "Public", establishedIn: 1969, exams: ["JEE"], focus: "computing" },
  { name: "Guru Jambheshwar University of Science and Technology", city: "Hisar", state: "Haryana", type: "Public", establishedIn: 1995, exams: ["JEE"], focus: "electronics" },
  { name: "Indian Institute of Technology Mandi", city: "Mandi", state: "Himachal Pradesh", type: "Public", establishedIn: 2009, website: "https://www.iitmandi.ac.in/", exams: ["JEE"], focus: "core" },
  { name: "National Institute of Technology Hamirpur", city: "Hamirpur", state: "Himachal Pradesh", type: "Public", establishedIn: 1986, exams: ["JEE"], focus: "electronics" },
  { name: "IIIT Una", city: "Una", state: "Himachal Pradesh", type: "Public", establishedIn: 2014, exams: ["JEE"], focus: "computing" },
  { name: "Jaypee University of Information Technology", city: "Solan", state: "Himachal Pradesh", type: "Private", establishedIn: 2002, exams: ["JEE"], focus: "computing" },
  { name: "Himachal Pradesh Technical University", city: "Hamirpur", state: "Himachal Pradesh", type: "Public", establishedIn: 2010, exams: ["JEE"], focus: "core" },
  { name: "Indian Institute of Technology (ISM) Dhanbad", city: "Dhanbad", state: "Jharkhand", type: "Public", establishedIn: 1926, website: "https://www.iitism.ac.in/", exams: ["JEE"], focus: "core" },
  { name: "National Institute of Technology Jamshedpur", city: "Jamshedpur", state: "Jharkhand", type: "Public", establishedIn: 1960, exams: ["JEE"], focus: "electronics" },
  { name: "Birla Institute of Technology Mesra", city: "Ranchi", state: "Jharkhand", type: "Private", establishedIn: 1955, website: "https://www.bitmesra.ac.in/", exams: ["JEE"], focus: "computing" },
  { name: "IIIT Ranchi", city: "Ranchi", state: "Jharkhand", type: "Public", establishedIn: 2016, exams: ["JEE"], focus: "computing" },
  { name: "Birsa Institute of Technology Sindri", city: "Dhanbad", state: "Jharkhand", type: "Public", establishedIn: 1949, exams: ["JEE"], focus: "core" },
  { name: "National Institute of Technology Karnataka", city: "Surathkal", state: "Karnataka", type: "Public", establishedIn: 1960, website: "https://www.nitk.ac.in/", exams: ["JEE", "KCET"], focus: "electronics" },
  { name: "International Institute of Information Technology Bangalore", city: "Bengaluru", state: "Karnataka", type: "Private", establishedIn: 1999, website: "https://www.iiitb.ac.in/", exams: ["JEE", "COMEDK"], focus: "computing" },
  { name: "Indian Institute of Technology Dharwad", city: "Dharwad", state: "Karnataka", type: "Public", establishedIn: 2016, website: "https://www.iitdh.ac.in/", exams: ["JEE", "KCET"], focus: "core" },
  { name: "RV College of Engineering", city: "Bengaluru", state: "Karnataka", type: "Private", establishedIn: 1963, website: "https://www.rvce.edu.in/", exams: ["KCET", "COMEDK"], focus: "computing" },
  { name: "Manipal Institute of Technology", city: "Manipal", state: "Karnataka", type: "Private", establishedIn: 1957, website: "https://www.manipal.edu/mit.html", exams: ["MET", "JEE"], focus: "computing" },
  { name: "National Institute of Technology Calicut", city: "Kozhikode", state: "Kerala", type: "Public", establishedIn: 1961, website: "https://nitc.ac.in/", exams: ["JEE", "KEAM"], focus: "electronics" },
  { name: "IIIT Kottayam", city: "Kottayam", state: "Kerala", type: "Public", establishedIn: 2015, exams: ["JEE", "KEAM"], focus: "computing" },
  { name: "Cochin University of Science and Technology", city: "Kochi", state: "Kerala", type: "Public", establishedIn: 1971, website: "https://cusat.ac.in/", exams: ["KEAM", "CUSAT CAT"], focus: "electronics" },
  { name: "Government Engineering College Thrissur", city: "Thrissur", state: "Kerala", type: "Public", establishedIn: 1951, exams: ["KEAM"], focus: "core" },
  { name: "Rajiv Gandhi Institute of Technology Kottayam", city: "Kottayam", state: "Kerala", type: "Public", establishedIn: 1991, exams: ["KEAM"], focus: "electronics" },
  { name: "Indian Institute of Technology Indore", city: "Indore", state: "Madhya Pradesh", type: "Public", establishedIn: 2009, website: "https://www.iiti.ac.in/", exams: ["JEE"], focus: "computing" },
  { name: "Maulana Azad National Institute of Technology Bhopal", city: "Bhopal", state: "Madhya Pradesh", type: "Public", establishedIn: 1960, website: "https://www.manit.ac.in/", exams: ["JEE"], focus: "electronics" },
  { name: "ABV Indian Institute of Information Technology and Management Gwalior", city: "Gwalior", state: "Madhya Pradesh", type: "Public", establishedIn: 1997, exams: ["JEE"], focus: "computing" },
  { name: "Jabalpur Engineering College", city: "Jabalpur", state: "Madhya Pradesh", type: "Public", establishedIn: 1947, exams: ["JEE"], focus: "core" },
  { name: "Lakshmi Narain College of Technology Bhopal", city: "Bhopal", state: "Madhya Pradesh", type: "Private", establishedIn: 1994, exams: ["JEE"], focus: "computing" },
  { name: "Indian Institute of Technology Bombay", city: "Mumbai", state: "Maharashtra", type: "Public", establishedIn: 1958, website: "https://www.iitb.ac.in/", exams: ["JEE", "MHT-CET"], focus: "computing" },
  { name: "Visvesvaraya National Institute of Technology Nagpur", city: "Nagpur", state: "Maharashtra", type: "Public", establishedIn: 1960, website: "https://vnit.ac.in/", exams: ["JEE", "MHT-CET"], focus: "electronics" },
  { name: "COEP Technological University", city: "Pune", state: "Maharashtra", type: "Public", establishedIn: 1854, website: "https://www.coep.org.in/", exams: ["MHT-CET", "JEE"], focus: "core" },
  { name: "Institute of Chemical Technology", city: "Mumbai", state: "Maharashtra", type: "Public", establishedIn: 1933, website: "https://www.ictmumbai.edu.in/", exams: ["MHT-CET", "JEE"], focus: "core" },
  { name: "Veermata Jijabai Technological Institute", city: "Mumbai", state: "Maharashtra", type: "Public", establishedIn: 1887, exams: ["MHT-CET"], focus: "electronics" },
  { name: "National Institute of Technology Manipur", city: "Imphal", state: "Manipur", type: "Public", establishedIn: 2010, exams: ["JEE"], focus: "electronics" },
  { name: "IIIT Manipur", city: "Imphal", state: "Manipur", type: "Public", establishedIn: 2015, exams: ["JEE"], focus: "computing" },
  { name: "Manipur Technical University", city: "Imphal", state: "Manipur", type: "Public", establishedIn: 2016, exams: ["JEE"], focus: "core" },
  { name: "Manipur Institute of Technology", city: "Imphal", state: "Manipur", type: "Public", establishedIn: 1998, exams: ["JEE"], focus: "electronics" },
  { name: "Government Polytechnic Imphal", city: "Imphal", state: "Manipur", type: "Public", establishedIn: 2014, exams: ["JEE"], focus: "core" },
  { name: "National Institute of Technology Meghalaya", city: "Shillong", state: "Meghalaya", type: "Public", establishedIn: 2010, website: "https://www.nitm.ac.in/", exams: ["JEE"], focus: "core" },
  { name: "Shillong Engineering and Management College", city: "Shillong", state: "Meghalaya", type: "Private", establishedIn: 1998, exams: ["JEE"], focus: "electronics" },
  { name: "University of Science and Technology Meghalaya", city: "Ri-Bhoi", state: "Meghalaya", type: "Private", establishedIn: 2011, exams: ["JEE"], focus: "computing" },
  { name: "Techno Global University Meghalaya", city: "Shillong", state: "Meghalaya", type: "Private", establishedIn: 2008, exams: ["JEE"], focus: "computing" },
  { name: "CMJ University", city: "Shillong", state: "Meghalaya", type: "Private", establishedIn: 2009, exams: ["JEE"], focus: "core" },
  { name: "National Institute of Technology Mizoram", city: "Aizawl", state: "Mizoram", type: "Public", establishedIn: 2010, exams: ["JEE"], focus: "electronics" },
  { name: "Mizoram Engineering College", city: "Lunglei", state: "Mizoram", type: "Public", establishedIn: 2013, exams: ["JEE"], focus: "core" },
  { name: "Mizoram University School of Engineering and Technology", city: "Aizawl", state: "Mizoram", type: "Public", establishedIn: 2007, exams: ["JEE"], focus: "computing" },
  { name: "ICFAI University Mizoram", city: "Aizawl", state: "Mizoram", type: "Private", establishedIn: 2006, exams: ["JEE"], focus: "computing" },
  { name: "Government Mizoram Polytechnic Lunglei", city: "Lunglei", state: "Mizoram", type: "Public", establishedIn: 2015, exams: ["JEE"], focus: "core" },
  { name: "National Institute of Technology Nagaland", city: "Dimapur", state: "Nagaland", type: "Public", establishedIn: 2010, exams: ["JEE"], focus: "electronics" },
  { name: "Nagaland University School of Engineering and Technology", city: "Dimapur", state: "Nagaland", type: "Public", establishedIn: 2007, exams: ["JEE"], focus: "core" },
  { name: "St. Joseph University", city: "Dimapur", state: "Nagaland", type: "Private", establishedIn: 2016, exams: ["JEE"], focus: "computing" },
  { name: "Government Polytechnic Kohima", city: "Kohima", state: "Nagaland", type: "Public", establishedIn: 1972, exams: ["JEE"], focus: "core" },
  { name: "Institute of Communication and Information Technology", city: "Mokokchung", state: "Nagaland", type: "Public", establishedIn: 2007, exams: ["JEE"], focus: "computing" },
  { name: "Indian Institute of Technology Bhubaneswar", city: "Bhubaneswar", state: "Odisha", type: "Public", establishedIn: 2008, website: "https://www.iitbbs.ac.in/", exams: ["JEE", "OJEE"], focus: "core" },
  { name: "National Institute of Technology Rourkela", city: "Rourkela", state: "Odisha", type: "Public", establishedIn: 1961, website: "https://www.nitrkl.ac.in/", exams: ["JEE", "OJEE"], focus: "core" },
  { name: "IIIT Bhubaneswar", city: "Bhubaneswar", state: "Odisha", type: "Public", establishedIn: 2006, exams: ["JEE", "OJEE"], focus: "computing" },
  { name: "Kalinga Institute of Industrial Technology", city: "Bhubaneswar", state: "Odisha", type: "Private", establishedIn: 1992, website: "https://kiit.ac.in/", exams: ["JEE", "OJEE"], focus: "computing" },
  { name: "Siksha 'O' Anusandhan", city: "Bhubaneswar", state: "Odisha", type: "Private", establishedIn: 2007, website: "https://www.soa.ac.in/", exams: ["JEE", "OJEE"], focus: "electronics" },
  { name: "Indian Institute of Technology Ropar", city: "Rupnagar", state: "Punjab", type: "Public", establishedIn: 2008, website: "https://www.iitrpr.ac.in/", exams: ["JEE"], focus: "computing" },
  { name: "Dr B R Ambedkar National Institute of Technology Jalandhar", city: "Jalandhar", state: "Punjab", type: "Public", establishedIn: 1987, website: "https://www.nitj.ac.in/", exams: ["JEE"], focus: "electronics" },
  { name: "Thapar Institute of Engineering and Technology", city: "Patiala", state: "Punjab", type: "Private", establishedIn: 1956, website: "https://www.thapar.edu/", exams: ["JEE"], focus: "computing" },
  { name: "Lovely Professional University", city: "Phagwara", state: "Punjab", type: "Private", establishedIn: 2005, website: "https://www.lpu.in/", exams: ["JEE"], focus: "computing" },
  { name: "Guru Nanak Dev Engineering College", city: "Ludhiana", state: "Punjab", type: "Private", establishedIn: 1956, exams: ["JEE"], focus: "core" },
  { name: "Indian Institute of Technology Jodhpur", city: "Jodhpur", state: "Rajasthan", type: "Public", establishedIn: 2008, website: "https://iitj.ac.in/", exams: ["JEE"], focus: "computing" },
  { name: "Malaviya National Institute of Technology Jaipur", city: "Jaipur", state: "Rajasthan", type: "Public", establishedIn: 1963, website: "https://www.mnit.ac.in/", exams: ["JEE"], focus: "electronics" },
  { name: "Birla Institute of Technology and Science, Pilani", city: "Pilani", state: "Rajasthan", type: "Private", establishedIn: 1964, website: "https://www.bits-pilani.ac.in/", exams: ["BITSAT"], focus: "computing" },
  { name: "The LNM Institute of Information Technology", city: "Jaipur", state: "Rajasthan", type: "Private", establishedIn: 2002, exams: ["JEE"], focus: "computing" },
  { name: "MBM University", city: "Jodhpur", state: "Rajasthan", type: "Public", establishedIn: 1951, exams: ["JEE"], focus: "core" },
  { name: "National Institute of Technology Sikkim", city: "Ravangla", state: "Sikkim", type: "Public", establishedIn: 2010, exams: ["JEE"], focus: "electronics" },
  { name: "Sikkim Manipal Institute of Technology", city: "Majitar", state: "Sikkim", type: "Private", establishedIn: 1997, exams: ["JEE"], focus: "computing" },
  { name: "Sikkim Institute of Science and Technology", city: "South Sikkim", state: "Sikkim", type: "Public", establishedIn: 2018, exams: ["JEE"], focus: "core" },
  { name: "College of Agricultural Engineering and Post Harvest Technology", city: "Gangtok", state: "Sikkim", type: "Public", establishedIn: 2016, exams: ["JEE"], focus: "core" },
  { name: "Sikkim Professional University", city: "Gangtok", state: "Sikkim", type: "Private", establishedIn: 2008, exams: ["JEE"], focus: "computing" },
  { name: "Indian Institute of Technology Madras", city: "Chennai", state: "Tamil Nadu", type: "Public", establishedIn: 1959, website: "https://www.iitm.ac.in/", exams: ["JEE", "TNEA"], focus: "computing" },
  { name: "National Institute of Technology Tiruchirappalli", city: "Tiruchirappalli", state: "Tamil Nadu", type: "Public", establishedIn: 1964, website: "https://www.nitt.edu/", exams: ["JEE", "TNEA"], focus: "computing" },
  { name: "Anna University", city: "Chennai", state: "Tamil Nadu", type: "Public", establishedIn: 1978, website: "https://www.annauniv.edu/", exams: ["TNEA", "JEE"], focus: "core" },
  { name: "Vellore Institute of Technology", city: "Vellore", state: "Tamil Nadu", type: "Private", establishedIn: 1984, website: "https://vit.ac.in/", exams: ["VITEEE", "JEE"], focus: "computing" },
  { name: "SRM Institute of Science and Technology", city: "Chennai", state: "Tamil Nadu", type: "Private", establishedIn: 1985, website: "https://www.srmist.edu.in/", exams: ["SRMJEEE", "JEE"], focus: "computing" },
  { name: "Indian Institute of Technology Hyderabad", city: "Hyderabad", state: "Telangana", type: "Public", establishedIn: 2008, website: "https://www.iith.ac.in/", exams: ["JEE", "TS EAMCET"], focus: "computing" },
  { name: "National Institute of Technology Warangal", city: "Warangal", state: "Telangana", type: "Public", establishedIn: 1959, website: "https://www.nitw.ac.in/", exams: ["JEE", "TS EAMCET"], focus: "electronics" },
  { name: "International Institute of Information Technology Hyderabad", city: "Hyderabad", state: "Telangana", type: "Private", establishedIn: 1998, website: "https://www.iiit.ac.in/", exams: ["JEE", "UGEE"], focus: "computing" },
  { name: "Jawaharlal Nehru Technological University Hyderabad", city: "Hyderabad", state: "Telangana", type: "Public", establishedIn: 1972, website: "https://jntuh.ac.in/", exams: ["TS EAMCET"], focus: "computing" },
  { name: "Chaitanya Bharathi Institute of Technology", city: "Hyderabad", state: "Telangana", type: "Private", establishedIn: 1979, website: "https://www.cbit.ac.in/", exams: ["TS EAMCET"], focus: "computing" },
  { name: "National Institute of Technology Agartala", city: "Agartala", state: "Tripura", type: "Public", establishedIn: 1965, exams: ["JEE"], focus: "electronics" },
  { name: "Tripura University", city: "Agartala", state: "Tripura", type: "Public", establishedIn: 1987, exams: ["JEE"], focus: "computing" },
  { name: "Techno India University Tripura", city: "Agartala", state: "Tripura", type: "Private", establishedIn: 2015, exams: ["JEE"], focus: "computing" },
  { name: "ICFAI University Tripura", city: "Agartala", state: "Tripura", type: "Private", establishedIn: 2004, exams: ["JEE"], focus: "core" },
  { name: "Tripura Institute of Technology", city: "Agartala", state: "Tripura", type: "Public", establishedIn: 1958, exams: ["JEE"], focus: "electronics" },
  { name: "Indian Institute of Technology Kanpur", city: "Kanpur", state: "Uttar Pradesh", type: "Public", establishedIn: 1959, website: "https://www.iitk.ac.in/", exams: ["JEE"], focus: "computing" },
  { name: "Indian Institute of Technology (BHU) Varanasi", city: "Varanasi", state: "Uttar Pradesh", type: "Public", establishedIn: 1919, website: "https://www.iitbhu.ac.in/", exams: ["JEE"], focus: "core" },
  { name: "Motilal Nehru National Institute of Technology Allahabad", city: "Prayagraj", state: "Uttar Pradesh", type: "Public", establishedIn: 1961, website: "https://www.mnnit.ac.in/", exams: ["JEE"], focus: "electronics" },
  { name: "Indian Institute of Information Technology Allahabad", city: "Prayagraj", state: "Uttar Pradesh", type: "Public", establishedIn: 1999, exams: ["JEE"], focus: "computing" },
  { name: "Zakir Husain College of Engineering and Technology AMU", city: "Aligarh", state: "Uttar Pradesh", type: "Public", establishedIn: 1935, exams: ["JEE"], focus: "core" },
  { name: "Indian Institute of Technology Roorkee", city: "Roorkee", state: "Uttarakhand", type: "Public", establishedIn: 1847, website: "https://www.iitr.ac.in/", exams: ["JEE"], focus: "core" },
  { name: "National Institute of Technology Uttarakhand", city: "Srinagar", state: "Uttarakhand", type: "Public", establishedIn: 2009, exams: ["JEE"], focus: "electronics" },
  { name: "IIIT Roorkee", city: "Roorkee", state: "Uttarakhand", type: "Private", establishedIn: 2005, exams: ["JEE"], focus: "computing" },
  { name: "UPES Dehradun", city: "Dehradun", state: "Uttarakhand", type: "Private", establishedIn: 2003, website: "https://www.upes.ac.in/", exams: ["UPESAT", "JEE"], focus: "computing" },
  { name: "Graphic Era Deemed to be University", city: "Dehradun", state: "Uttarakhand", type: "Private", establishedIn: 1993, website: "https://www.geu.ac.in/", exams: ["JEE"], focus: "computing" },
  { name: "Indian Institute of Technology Kharagpur", city: "Kharagpur", state: "West Bengal", type: "Public", establishedIn: 1951, website: "https://www.iitkgp.ac.in/", exams: ["JEE", "WBJEE"], focus: "core" },
  { name: "National Institute of Technology Durgapur", city: "Durgapur", state: "West Bengal", type: "Public", establishedIn: 1960, website: "https://nitdgp.ac.in/", exams: ["JEE", "WBJEE"], focus: "core" },
  { name: "Indian Institute of Engineering Science and Technology Shibpur", city: "Howrah", state: "West Bengal", type: "Public", establishedIn: 1856, website: "https://www.iiests.ac.in/", exams: ["JEE", "WBJEE"], focus: "electronics" },
  { name: "Jadavpur University", city: "Kolkata", state: "West Bengal", type: "Public", establishedIn: 1955, website: "https://www.jaduniv.edu.in/", exams: ["WBJEE", "JEE"], focus: "core" },
  { name: "IIIT Kalyani", city: "Kalyani", state: "West Bengal", type: "Public", establishedIn: 2014, exams: ["JEE", "WBJEE"], focus: "computing" }
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[()'.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function clamp(num: number, min: number, max: number) {
  return Math.max(min, Math.min(max, num));
}

function cutoffBand(rank: number) {
  if (rank < 1000) return `Top ${rank}`;
  if (rank < 10000) return `Top ${(rank / 1000).toFixed(1)}k`;
  return `Top ${Math.round(rank / 1000)}k`;
}

function deriveEstablishedYear(seed: CatalogSeed, index: number) {
  return seed.establishedIn ?? 1970 + (index % 35);
}

function deriveDescription(seed: CatalogSeed) {
  const focus =
    seed.focus === "computing"
      ? "software, data, and product-focused pathways"
      : seed.focus === "electronics"
        ? "electronics, embedded systems, and communication pathways"
        : "core engineering, applied labs, and industry-linked academics";

  return `${seed.name} is an India-based ${seed.type.toLowerCase()} engineering institution in ${seed.city}, ${seed.state}, included in the platform's extended college catalog with ${focus}.`;
}

function deriveCourses(seed: CatalogSeed, index: number, annualFees: number) {
  const baseSeats = clamp(240 - index, 90, 360);
  const cseCtc = Number((16.8 - index * 0.08 + (seed.type === "Private" ? 0.6 : 0)).toFixed(1));
  const secondCtc = Number((cseCtc - 2.1).toFixed(1));
  const thirdCtc = Number((cseCtc - 4.3).toFixed(1));

  if (seed.focus === "electronics") {
    return [
      { name: "B.Tech Electronics and Communication Engineering", duration: "4 years", seats: baseSeats, totalFee: annualFees * 4, averageCtc: cseCtc },
      { name: "B.Tech Computer Science and Engineering", duration: "4 years", seats: baseSeats + 30, totalFee: annualFees * 4, averageCtc: secondCtc },
      { name: "B.Tech Electrical and Electronics Engineering", duration: "4 years", seats: Math.max(60, baseSeats - 20), totalFee: annualFees * 4, averageCtc: thirdCtc }
    ];
  }

  if (seed.focus === "core") {
    return [
      { name: "B.Tech Computer Science and Engineering", duration: "4 years", seats: baseSeats, totalFee: annualFees * 4, averageCtc: cseCtc },
      { name: "B.Tech Mechanical Engineering", duration: "4 years", seats: Math.max(60, baseSeats - 10), totalFee: annualFees * 4, averageCtc: secondCtc },
      { name: "B.Tech Civil Engineering", duration: "4 years", seats: Math.max(60, baseSeats - 25), totalFee: annualFees * 4, averageCtc: thirdCtc }
    ];
  }

  return [
    { name: "B.Tech Computer Science and Engineering", duration: "4 years", seats: baseSeats + 20, totalFee: annualFees * 4, averageCtc: cseCtc },
    { name: "B.Tech Artificial Intelligence and Data Science", duration: "4 years", seats: Math.max(60, baseSeats - 20), totalFee: annualFees * 4, averageCtc: secondCtc },
    { name: "B.Tech Information Technology", duration: "4 years", seats: Math.max(60, baseSeats - 10), totalFee: annualFees * 4, averageCtc: thirdCtc }
  ];
}

function deriveCutoffs(seed: CatalogSeed, index: number) {
  const exams = seed.exams?.length ? seed.exams : ["JEE"];
  return exams.slice(0, 2).map((exam, examIndex) => {
    const isTopTier = seed.name.includes("Indian Institute of Technology");
    const isNIT = seed.name.includes("National Institute of Technology");
    const isHyderabadLocal = seed.city === "Hyderabad" && exam === "TS EAMCET";

    const maxRank = isHyderabadLocal
      ? 2500 + index * 500 + examIndex * 350
      : exam === "BITSAT"
        ? 2600 + index * 170
        : exam === "VITEEE"
          ? 5000 + index * 600
        : exam === "SRMJEEE" || exam === "KIITEE" || exam === "AEEE" || exam === "KLEEE" || exam === "UPESAT" || exam === "CUCET" || exam === "GLAET" || exam === "LPUNEST"
            ? 8000 + index * 700
            : exam === "MHT-CET" || exam === "KCET" || exam === "COMEDK" || exam === "WBJEE" || exam === "TNEA" || exam === "CUSAT CAT" || exam === "AP EAMCET" || exam === "KEAM" || exam === "GUJCET" || exam === "OJEE" || exam === "CG PET"
              ? 3500 + index * 420
              : exam === "UGEE"
                ? 400 + index * 80
                : exam === "CUET"
                  ? 9000 + index * 800
                  : isTopTier
                    ? 600 + index * 160
                    : isNIT
                      ? 7000 + index * 420
                      : 12000 + index * 550;

    return {
      exam,
      maxRank,
      scoreBand: cutoffBand(maxRank)
    };
  });
}

function derivePlacements(seed: CatalogSeed, index: number, placementRate: number, averageCtc: number) {
  const recruiterPool =
    seed.type === "Public"
      ? ["TCS", "Infosys", "Amazon", "Microsoft"]
      : ["Accenture", "Cognizant", "Deloitte", "Capgemini"];

  if (seed.focus === "computing") {
    recruiterPool[2] = "Google";
  }

  return [
    {
      year: 2022,
      placementRate: clamp(placementRate - 4, 52, 98),
      medianCtc: Number(Math.max(4.2, averageCtc - 1.7).toFixed(1)),
      highestCtc: Number((averageCtc * 2.5 + (index < 12 ? 18 : 6)).toFixed(1)),
      topRecruiters: recruiterPool
    },
    {
      year: 2023,
      placementRate: clamp(placementRate - 2, 54, 98),
      medianCtc: Number(Math.max(4.5, averageCtc - 0.9).toFixed(1)),
      highestCtc: Number((averageCtc * 2.8 + (index < 12 ? 21 : 8)).toFixed(1)),
      topRecruiters: recruiterPool
    },
    {
      year: 2024,
      placementRate,
      medianCtc: Number(Math.max(4.8, averageCtc).toFixed(1)),
      highestCtc: Number((averageCtc * 3.1 + (index < 12 ? 24 : 10)).toFixed(1)),
      topRecruiters: recruiterPool
    }
  ];
}

function deriveReviews(seed: CatalogSeed, rating: number) {
  return [
    {
      authorName: "Verified Student",
      headline: "Strong academics and active placement support",
      body: `${seed.name} offers a structured learning environment, active peer groups, and visible placement support for students who stay consistent with projects and internships.`,
      rating: Number(Math.max(3.8, rating - 0.1).toFixed(1)),
      sourceType: "seeded_student"
    },
    {
      authorName: "Campus Guide",
      headline: "Good outcomes with branch-wise variation",
      body: `The overall outcomes are solid, but placement strength varies by branch and student preparation. Technical clubs, labs, and recruiter access are the main strengths.`,
      rating: Number(Math.max(3.7, rating - 0.2).toFixed(1)),
      sourceType: "seeded_editorial"
    }
  ];
}

function buildDefaultIndiaCollegeCatalog() {
  return defaultCollegeCatalog.map((seed, index) => {
    const rating = Number(clamp(4.9 - index * 0.012, 3.7, 4.9).toFixed(1));
    const placementRate = Number(clamp(95 - index * 0.28, 66, 95).toFixed(1));
    const annualFees =
      seed.type === "Private"
        ? clamp(240000 + index * 2500, 180000, 520000)
        : clamp(78000 + index * 2200, 6800, 245000);
    const courses = deriveCourses(seed, index, annualFees);

    return {
      name: seed.name,
      slug: slugify(seed.name),
      city: seed.city,
      state: seed.state,
      annualFees,
      rating,
      placementRate,
      establishedIn: deriveEstablishedYear(seed, index),
      type: seed.type,
      website: seed.website ?? null,
      description: deriveDescription(seed),
      courses,
      cutoffs: deriveCutoffs(seed, index),
      placements: derivePlacements(seed, index, placementRate, courses[0].averageCtc),
      reviews: deriveReviews(seed, rating)
    } satisfies SeedCollege;
  });
}

function loadJsonDataset() {
  const datasetDir = path.join(process.cwd(), "prisma");
  const preferredPath = path.join(datasetDir, "india-colleges.json");

  if (!fs.existsSync(preferredPath)) {
    return buildDefaultIndiaCollegeCatalog();
  }

  const raw = fs.readFileSync(preferredPath, "utf8");
  const parsed = JSON.parse(raw) as SeedCollege[];
  return parsed;
}

let cachedColleges: SeedCollege[] | null = null;

export function loadIndiaColleges() {
  if (!cachedColleges) {
    const colleges = loadJsonDataset();
    cachedColleges = colleges.filter((college) => college.name && college.slug);
  }

  return cachedColleges;
}

export function buildPlacementSeries(college: SeedCollege) {
  if (college.placements?.length) {
    return college.placements;
  }

  const baseMedian = Number((college.courses[0]?.averageCtc ?? 6).toFixed(1));
  return [
    {
      year: 2022,
      placementRate: Math.max(45, Number((college.placementRate - 4).toFixed(1))),
      medianCtc: Number(Math.max(3, baseMedian - 1.1).toFixed(1)),
      highestCtc: Number(Math.max(8, baseMedian * 2.4).toFixed(1)),
      topRecruiters: ["TCS", "Infosys", "Deloitte", "Accenture"]
    },
    {
      year: 2023,
      placementRate: Math.max(48, Number((college.placementRate - 2).toFixed(1))),
      medianCtc: Number(Math.max(3.2, baseMedian - 0.5).toFixed(1)),
      highestCtc: Number(Math.max(9, baseMedian * 2.8).toFixed(1)),
      topRecruiters: ["Amazon", "Cognizant", "Wipro", "Capgemini"]
    },
    {
      year: 2024,
      placementRate: college.placementRate,
      medianCtc: baseMedian,
      highestCtc: Number(Math.max(10, baseMedian * 3.1).toFixed(1)),
      topRecruiters: ["Google", "Microsoft", "EY", "ZS Associates"]
    }
  ];
}

export function buildReviewSeries(college: SeedCollege) {
  if (college.reviews?.length) {
    return college.reviews;
  }

  return [
    {
      authorName: "Aarav Singh",
      headline: "Strong academics and useful peer network",
      body: `The curriculum at ${college.name} is demanding but structured. Faculty support is dependable and placement cells are active.`,
      rating: Math.max(3.4, college.rating - 0.1),
      sourceType: "seeded_student"
    },
    {
      authorName: "Riya Mehta",
      headline: "Good outcomes, mixed campus infrastructure",
      body: "The best parts are course quality and internships. Infrastructure is solid overall, but some labs and hostels need upgrades.",
      rating: Math.max(3.2, college.rating - 0.2),
      sourceType: "seeded_student"
    },
    {
      authorName: "Placement Desk Review",
      headline: "Outcome-driven environment",
      body: "Students targeting placements get clear support. Recruiter access is strongest in flagship programs and urban sectors.",
      rating: Math.min(4.8, college.rating),
      sourceType: "seeded_editorial"
    }
  ];
}

function toDetail(college: SeedCollege): LocalCollegeDetail {
  return {
    id: college.slug,
    name: college.name,
    slug: college.slug,
    location: `${college.city}, ${college.state}`,
    city: college.city,
    state: college.state,
    annualFees: college.annualFees,
    rating: college.rating,
    placementRate: college.placementRate,
    type: college.type,
    website: college.website ?? null,
    description: college.description,
    establishedIn: college.establishedIn,
    courses: college.courses.map((course, index) => ({
      id: `${college.slug}-course-${index + 1}`,
      ...course
    })),
    cutoffs: college.cutoffs.map((cutoff, index) => ({
      id: `${college.slug}-cutoff-${index + 1}`,
      ...cutoff
    })),
    placements: buildPlacementSeries(college).map((placement, index) => ({
      id: `${college.slug}-placement-${index + 1}`,
      ...placement
    })),
    reviews: buildReviewSeries(college).map((review, index) => ({
      id: `${college.slug}-review-${index + 1}`,
      ...review,
      createdAt: `2024-0${Math.min(index + 4, 9)}-01T00:00:00.000Z`
    }))
  };
}

function toCard(college: SeedCollege): LocalCollegeCard {
  return {
    id: college.slug,
    name: college.name,
    slug: college.slug,
    location: `${college.city}, ${college.state}`,
    city: college.city,
    state: college.state,
    annualFees: college.annualFees,
    rating: college.rating,
    placementRate: college.placementRate,
    type: college.type
  };
}

type CatalogQuery = {
  search: string;
  location: string;
  course: string;
  sort: string;
  maxFees?: number;
  minRating?: number;
  minPlacement?: number;
  page: number;
  pageSize: number;
};

function includesInsensitive(value: string, query: string) {
  return value.toLowerCase().includes(query.toLowerCase());
}

function sortCards(colleges: LocalCollegeCard[], sort: string) {
  return [...colleges].sort((left, right) => {
    if (sort === "fees-asc") {
      return left.annualFees - right.annualFees || right.rating - left.rating;
    }
    if (sort === "fees-desc") {
      return right.annualFees - left.annualFees || right.rating - left.rating;
    }
    if (sort === "placements-desc") {
      return right.placementRate - left.placementRate || right.rating - left.rating;
    }
    if (sort === "rating-asc") {
      return left.rating - right.rating || left.name.localeCompare(right.name);
    }
    return right.rating - left.rating || left.name.localeCompare(right.name);
  });
}

export function getLocalCollegesCatalog(query: CatalogQuery) {
  const colleges = loadIndiaColleges();

  const baseFacetMatches = colleges.filter((college) => {
    if (query.search && !includesInsensitive(college.name, query.search)) {
      return false;
    }
    if (query.maxFees && college.annualFees > query.maxFees) {
      return false;
    }
    if (query.minRating && college.rating < query.minRating) {
      return false;
    }
    if (query.minPlacement && college.placementRate < query.minPlacement) {
      return false;
    }
    if (
      query.course &&
      !college.courses.some((course) => includesInsensitive(course.name, query.course))
    ) {
      return false;
    }
    return true;
  });

  const filtered = baseFacetMatches.filter((college) => {
    if (query.location && !includesInsensitive(college.state, query.location)) {
      return false;
    }
    return true;
  });

  const cards = sortCards(filtered.map(toCard), query.sort);
  const total = cards.length;
  const start = (query.page - 1) * query.pageSize;
  const end = start + query.pageSize;

  return {
    colleges: cards.slice(start, end),
    page: query.page,
    pageSize: query.pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    filters: {
      states: [...new Set(baseFacetMatches.map((college) => college.state))].sort(),
      courses: [
        ...new Set(baseFacetMatches.flatMap((college) => college.courses.map((course) => course.name)))
      ].sort(),
      colleges: [...new Set(baseFacetMatches.map((college) => college.name))].sort()
    }
  };
}

export function getLocalCollegeById(id: string) {
  const college = loadIndiaColleges().find((entry) => entry.slug === id);
  return college ? toDetail(college) : null;
}

export function getLocalCompareOptions(query: string) {
  const normalized = query.trim();
  const matches = loadIndiaColleges().filter((college) => {
    if (!normalized) {
      return true;
    }

    return (
      includesInsensitive(college.name, normalized) ||
      includesInsensitive(college.state, normalized) ||
      college.courses.some((course) => includesInsensitive(course.name, normalized))
    );
  });

  return sortCards(matches.map(toCard), "rating-desc").slice(0, 12).map((college) => ({
    id: college.id,
    name: college.name,
    location: college.location,
    annualFees: college.annualFees,
    placementRate: college.placementRate,
    rating: college.rating
  }));
}

export function getLocalCompareColleges(ids: string[]) {
  const byId = new Map(loadIndiaColleges().map((college) => [college.slug, toCard(college)]));
  const colleges = ids
    .map((id) => byId.get(id))
    .filter((college): college is LocalCollegeCard => Boolean(college));

  if (colleges.length !== ids.length) {
    return null;
  }

  return colleges.map((college) => ({
    id: college.id,
    name: college.name,
    location: college.location,
    annualFees: college.annualFees,
    placementRate: college.placementRate,
    rating: college.rating
  }));
}

export function getLocalPredictorMatches(exam: string, rank: number) {
  return loadIndiaColleges()
    .flatMap((college) =>
      college.cutoffs
        .filter((cutoff) => cutoff.exam.toUpperCase() === exam && cutoff.maxRank >= rank)
        .map((cutoff) => ({
          id: college.slug,
          name: college.name,
          location: `${college.city}, ${college.state}`,
          annualFees: college.annualFees,
          rating: college.rating,
          placementRate: college.placementRate,
          qualifyingRank: cutoff.maxRank,
          matchedExam: cutoff.exam,
          cutoffBand: cutoff.scoreBand,
          confidence:
            rank <= cutoff.maxRank * 0.65
              ? ("safe" as const)
              : rank <= cutoff.maxRank * 0.9
                ? ("target" as const)
                : ("ambitious" as const),
          explanation: `Matched on ${cutoff.exam} because your rank ${rank} is within the cutoff threshold ${cutoff.maxRank} (${cutoff.scoreBand}).`
        }))
    )
    .sort((left, right) => right.rating - left.rating || left.qualifyingRank - right.qualifyingRank);
}
