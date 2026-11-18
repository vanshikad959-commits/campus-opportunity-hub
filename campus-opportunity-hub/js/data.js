/* ==========================================================
   Campus Opportunity Hub — Seed data & constants
   Dates are generated relative to "today" so the demo always
   shows live, upcoming and closing-soon opportunities.
   ========================================================== */

const BRANCHES = ["CSE", "IT", "AI&DS", "ECE", "EEE", "MECH", "CIVIL"];
const YEARS = [1, 2, 3, 4];
const CATEGORIES = ["Hackathon", "Internship", "Workshop", "Competition", "Event"];

const INTERESTS = [
  "AI / ML", "Web Development", "App Development", "Data Science",
  "Cybersecurity", "Cloud & DevOps", "IoT & Embedded", "Robotics",
  "UI / UX Design", "Competitive Programming", "Entrepreneurship",
  "Electronics", "Core Engineering", "Research", "Public Speaking"
];

/* Each interest expands into keywords the recommender can match */
const INTEREST_KEYWORDS = {
  "AI / ML": ["machine learning", "deep learning", "ai", "python", "tensorflow", "nlp", "computer vision"],
  "Web Development": ["web", "javascript", "react", "html", "css", "node.js", "full stack"],
  "App Development": ["android", "flutter", "kotlin", "mobile", "app"],
  "Data Science": ["data", "python", "sql", "pandas", "statistics", "analytics", "power bi"],
  "Cybersecurity": ["security", "ctf", "networking", "linux", "ethical hacking"],
  "Cloud & DevOps": ["cloud", "aws", "docker", "devops", "kubernetes", "linux"],
  "IoT & Embedded": ["iot", "arduino", "embedded", "sensors", "raspberry pi", "c"],
  "Robotics": ["robotics", "ros", "arduino", "automation", "sensors"],
  "UI / UX Design": ["figma", "design", "ui", "ux", "prototyping"],
  "Competitive Programming": ["dsa", "c++", "java", "algorithms", "coding"],
  "Entrepreneurship": ["startup", "business", "pitch", "innovation", "product"],
  "Electronics": ["vlsi", "circuits", "pcb", "electronics", "matlab"],
  "Core Engineering": ["cad", "solidworks", "autocad", "mechanical", "civil", "design"],
  "Research": ["research", "paper", "matlab", "innovation"],
  "Public Speaking": ["communication", "debate", "presentation", "pitch"]
};

const SKILL_SUGGESTIONS = [
  "Python", "Java", "C", "C++", "JavaScript", "React", "Node.js", "HTML", "CSS", "SQL",
  "Machine Learning", "Deep Learning", "TensorFlow", "NLP", "Computer Vision", "Pandas",
  "Power BI", "Android", "Flutter", "Kotlin", "Figma", "UI", "UX", "AWS", "Docker",
  "Linux", "Networking", "Arduino", "Raspberry Pi", "IoT", "Embedded", "ROS", "MATLAB",
  "VLSI", "PCB", "AutoCAD", "SolidWorks", "DSA", "Git", "Communication", "Pitch"
];

/* Synonyms so "ML" and "machine learning" are treated as the same skill */
const SYNONYMS = {
  "ml": "machine learning", "dl": "deep learning", "js": "javascript",
  "reactjs": "react", "react.js": "react", "node": "node.js", "nodejs": "node.js",
  "cpp": "c++", "dsa": "dsa", "data structures": "dsa", "py": "python",
  "cv": "computer vision", "aiml": "machine learning", "ui/ux": "ui",
  "powerbi": "power bi", "rpi": "raspberry pi", "k8s": "kubernetes"
};

function daysFromNow(n, hour = 23, minute = 59) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function seedOpportunities() {
  return [
    {
      title: "Smart India Hackathon — Internal Round",
      org: "Institution Innovation Council",
      category: "Hackathon",
      description: "36-hour internal hackathon to select teams for Smart India Hackathon. Solve problem statements from ministries in software and hardware tracks. Teams of 6 with at least one female member.",
      skills: ["Python", "JavaScript", "React", "Machine Learning", "IoT"],
      tags: ["AI / ML", "Web Development", "IoT & Embedded", "Entrepreneurship"],
      branches: ["ALL"], minYear: 1, minCgpa: 0,
      mode: "Offline", location: "Main Auditorium, Campus",
      deadline: daysFromNow(2), eventDate: daysFromNow(9, 9, 0),
      reward: "Selection for national round", link: "https://www.sih.gov.in", postedDaysAgo: 6
    },
    {
      title: "Machine Learning Summer Internship",
      org: "DataNova Analytics Pvt. Ltd.",
      category: "Internship",
      description: "8-week paid internship building predictive models on real retail datasets. Interns work with Python, Pandas, scikit-learn and deploy models with Flask. Pre-placement offer for top performers.",
      skills: ["Python", "Machine Learning", "Pandas", "SQL"],
      tags: ["AI / ML", "Data Science"],
      branches: ["CSE", "IT", "AI&DS"], minYear: 3, minCgpa: 7.0,
      mode: "Hybrid", location: "Pune / Remote",
      deadline: daysFromNow(12), eventDate: daysFromNow(45, 10, 0),
      reward: "₹15,000 / month stipend", link: "https://example.com/datanova", postedDaysAgo: 3
    },
    {
      title: "Full Stack Web Development Bootcamp",
      org: "Coding Club & Google Developer Group",
      category: "Workshop",
      description: "Hands-on 3-day workshop covering HTML, CSS, JavaScript, React and Node.js. Build and deploy a complete project by the end of the bootcamp. Certificate provided.",
      skills: ["HTML", "CSS", "JavaScript", "React", "Node.js"],
      tags: ["Web Development"],
      branches: ["ALL"], minYear: 1, minCgpa: 0,
      mode: "Offline", location: "Lab 301, IT Block",
      deadline: daysFromNow(5), eventDate: daysFromNow(8, 10, 0),
      reward: "Certificate + swag", link: "https://gdg.community.dev", postedDaysAgo: 2
    },
    {
      title: "Capture The Flag — CyberStrike 2.0",
      org: "Cyber Security Cell",
      category: "Competition",
      description: "Jeopardy-style CTF with challenges in web exploitation, cryptography, forensics and reverse engineering. Solo or teams of two. Top teams receive cash prizes.",
      skills: ["Linux", "Networking", "Python"],
      tags: ["Cybersecurity"],
      branches: ["CSE", "IT", "AI&DS", "ECE"], minYear: 1, minCgpa: 0,
      mode: "Online", location: "Online (CTFd platform)",
      deadline: daysFromNow(7), eventDate: daysFromNow(10, 18, 0),
      reward: "₹25,000 prize pool", link: "https://ctftime.org", postedDaysAgo: 5
    },
    {
      title: "IoT & Embedded Systems Workshop",
      org: "Department of ECE",
      category: "Workshop",
      description: "Two-day workshop on Arduino, ESP32, sensors and cloud dashboards. Participants build a smart home prototype. Kits provided on campus.",
      skills: ["Arduino", "IoT", "Embedded", "C"],
      tags: ["IoT & Embedded", "Electronics", "Robotics"],
      branches: ["ECE", "EEE", "CSE", "IT"], minYear: 2, minCgpa: 0,
      mode: "Offline", location: "Embedded Lab, ECE Block",
      deadline: daysFromNow(4), eventDate: daysFromNow(6, 9, 30),
      reward: "Certificate + take-home kit", link: "https://example.com/iot", postedDaysAgo: 4
    },
    {
      title: "Android App Development Internship",
      org: "AppForge Technologies",
      category: "Internship",
      description: "Remote internship building Android apps in Kotlin and Flutter. Work on UI, REST API integration and Play Store release process.",
      skills: ["Android", "Kotlin", "Flutter", "Git"],
      tags: ["App Development"],
      branches: ["CSE", "IT", "AI&DS"], minYear: 2, minCgpa: 6.5,
      mode: "Online", location: "Remote",
      deadline: daysFromNow(18), eventDate: daysFromNow(30, 10, 0),
      reward: "₹8,000 / month stipend", link: "https://example.com/appforge", postedDaysAgo: 1
    },
    {
      title: "National Robotics Challenge",
      org: "Robotics Society of India",
      category: "Competition",
      description: "Design an autonomous line-following and obstacle-avoiding robot. Qualifier round by video submission, finals held at IIT campus.",
      skills: ["Arduino", "ROS", "Embedded", "C++"],
      tags: ["Robotics", "IoT & Embedded", "Core Engineering"],
      branches: ["MECH", "ECE", "EEE", "CSE"], minYear: 1, minCgpa: 0,
      mode: "Hybrid", location: "IIT Bombay (finals)",
      deadline: daysFromNow(21), eventDate: daysFromNow(40, 9, 0),
      reward: "₹1,00,000 prize pool", link: "https://example.com/robotics", postedDaysAgo: 8
    },
    {
      title: "UI/UX Design Sprint",
      org: "Design Club",
      category: "Competition",
      description: "Redesign the college mobile app in 48 hours using Figma. Judged on usability, visual design and research process. Open to all branches.",
      skills: ["Figma", "UI", "UX"],
      tags: ["UI / UX Design", "App Development"],
      branches: ["ALL"], minYear: 1, minCgpa: 0,
      mode: "Online", location: "Online",
      deadline: daysFromNow(9), eventDate: daysFromNow(14, 10, 0),
      reward: "Goodies + internship interview", link: "https://www.figma.com", postedDaysAgo: 2
    },
    {
      title: "AWS Cloud Practitioner Study Jam",
      org: "AWS Cloud Club",
      category: "Workshop",
      description: "Four-week guided study programme for the AWS Cloud Practitioner certification, with labs on EC2, S3, IAM and Docker basics. Free exam vouchers for top 20 learners.",
      skills: ["AWS", "Docker", "Linux"],
      tags: ["Cloud & DevOps"],
      branches: ["ALL"], minYear: 2, minCgpa: 0,
      mode: "Online", location: "Online",
      deadline: daysFromNow(15), eventDate: daysFromNow(20, 18, 0),
      reward: "Free certification voucher", link: "https://aws.amazon.com/training", postedDaysAgo: 7
    },
    {
      title: "Startup Pitch Fest",
      org: "E-Cell",
      category: "Event",
      description: "Pitch your startup idea to a panel of angel investors and incubators. Shortlisted teams receive mentorship and incubation support.",
      skills: ["Pitch", "Communication"],
      tags: ["Entrepreneurship", "Public Speaking"],
      branches: ["ALL"], minYear: 1, minCgpa: 0,
      mode: "Offline", location: "Seminar Hall 2",
      deadline: daysFromNow(11), eventDate: daysFromNow(16, 14, 0),
      reward: "₹50,000 seed grant", link: "https://example.com/ecell", postedDaysAgo: 3
    },
    {
      title: "Data Analytics with Power BI",
      org: "Training & Placement Cell",
      category: "Workshop",
      description: "Learn data cleaning, dashboards and DAX in Power BI. Includes a placement-oriented case study using SQL and Excel.",
      skills: ["Power BI", "SQL", "Pandas"],
      tags: ["Data Science"],
      branches: ["ALL"], minYear: 2, minCgpa: 0,
      mode: "Offline", location: "Computer Centre",
      deadline: daysFromNow(1), eventDate: daysFromNow(3, 10, 0),
      reward: "Certificate", link: "https://example.com/powerbi", postedDaysAgo: 9
    },
    {
      title: "VLSI Design Internship",
      org: "SiliconWave Semiconductors",
      category: "Internship",
      description: "Six-month internship in RTL design and verification using Verilog. Strong fundamentals in digital electronics required.",
      skills: ["VLSI", "MATLAB", "C"],
      tags: ["Electronics", "Core Engineering"],
      branches: ["ECE", "EEE"], minYear: 4, minCgpa: 7.5,
      mode: "Offline", location: "Bengaluru",
      deadline: daysFromNow(25), eventDate: daysFromNow(60, 9, 0),
      reward: "₹25,000 / month stipend", link: "https://example.com/siliconwave", postedDaysAgo: 2
    },
    {
      title: "CodeSprint — Competitive Programming Contest",
      org: "Coding Club",
      category: "Competition",
      description: "3-hour algorithmic contest on Codeforces-style problems. Languages: C++, Java, Python. Top 10 get recognition and goodies.",
      skills: ["DSA", "C++", "Java", "Python"],
      tags: ["Competitive Programming"],
      branches: ["ALL"], minYear: 1, minCgpa: 0,
      mode: "Online", location: "Online",
      deadline: daysFromNow(3), eventDate: daysFromNow(5, 20, 0),
      reward: "Goodies + certificates", link: "https://codeforces.com", postedDaysAgo: 1
    },
    {
      title: "CAD Modelling Championship",
      org: "Department of Mechanical Engineering",
      category: "Competition",
      description: "Model a given mechanical assembly in SolidWorks or AutoCAD within the time limit. Evaluated on accuracy and design intent.",
      skills: ["SolidWorks", "AutoCAD"],
      tags: ["Core Engineering"],
      branches: ["MECH", "CIVIL"], minYear: 2, minCgpa: 0,
      mode: "Offline", location: "CAD Lab",
      deadline: daysFromNow(6), eventDate: daysFromNow(8, 10, 0),
      reward: "Trophy + certificate", link: "https://example.com/cad", postedDaysAgo: 4
    },
    {
      title: "Generative AI & NLP Hackathon",
      org: "AI Research Lab",
      category: "Hackathon",
      description: "24-hour hackathon on building applications with large language models, NLP and computer vision. Mentors from industry. Teams of up to 4.",
      skills: ["Python", "Deep Learning", "NLP", "Machine Learning"],
      tags: ["AI / ML", "Research"],
      branches: ["CSE", "IT", "AI&DS", "ECE"], minYear: 2, minCgpa: 6.0,
      mode: "Offline", location: "Innovation Centre",
      deadline: daysFromNow(10), eventDate: daysFromNow(17, 9, 0),
      reward: "₹60,000 prize pool", link: "https://example.com/genai", postedDaysAgo: 2
    },
    {
      title: "Annual Technical Symposium — TechVista",
      org: "Student Council",
      category: "Event",
      description: "Inter-college technical fest with paper presentations, project expo, quiz and technical debate. Register for individual events on the portal.",
      skills: ["Communication", "Research"],
      tags: ["Research", "Public Speaking"],
      branches: ["ALL"], minYear: 1, minCgpa: 0,
      mode: "Offline", location: "Whole Campus",
      deadline: daysFromNow(14), eventDate: daysFromNow(22, 9, 0),
      reward: "Prizes worth ₹2,00,000", link: "https://example.com/techvista", postedDaysAgo: 10
    },
    {
      title: "Web3 Builders Hackathon",
      org: "Blockchain Club",
      category: "Hackathon",
      description: "Build decentralised apps using JavaScript and smart contracts. Registration closed — kept for reference.",
      skills: ["JavaScript", "React", "Node.js"],
      tags: ["Web Development", "Entrepreneurship"],
      branches: ["ALL"], minYear: 1, minCgpa: 0,
      mode: "Online", location: "Online",
      deadline: daysFromNow(-3), eventDate: daysFromNow(-1, 9, 0),
      reward: "₹40,000 prize pool", link: "https://example.com/web3", postedDaysAgo: 20
    }
  ].map((o, i) => ({
    id: "opp_" + (1001 + i),
    ...o,
    postedAt: daysFromNow(-o.postedDaysAgo, 10, 0),
    createdBy: "admin@campus.edu"
  }));
}

function seedUsers() {
  return [
    {
      id: "usr_admin", role: "admin", name: "Placement Officer",
      email: "admin@campus.edu", passwordHash: simpleHash("admin123")
    },
    {
      id: "usr_demo", role: "student", name: "Aarav Sharma",
      email: "student@campus.edu", passwordHash: simpleHash("student123"),
      branch: "CSE", year: 3, cgpa: 8.2,
      skills: ["Python", "Machine Learning", "React", "SQL", "Git"],
      interests: ["AI / ML", "Web Development", "Data Science"],
      saved: ["opp_1001", "opp_1015"], applied: ["opp_1011"],
      reminderDays: 3, createdAt: daysFromNow(-30, 10, 0)
    }
  ];
}

/* Non-cryptographic hash (FNV-1a) used only for the client-side demo.
   A production deployment would hash passwords on the server with bcrypt. */
function simpleHash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return ("0000000" + (h >>> 0).toString(16)).slice(-8);
}
