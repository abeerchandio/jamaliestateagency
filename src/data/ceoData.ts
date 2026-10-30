export interface CeoProfileData {
  name: string;
  title: string;
  organization: string;
  location: string;
  experienceYears: number;
  phone: string;
  whatsapp: string;
  email: string;
  photoUrl: string;
  shortBio: string;
  fullMessage: string;
  credentials: string[];
  achievements: {
    number: string;
    label: string;
    description: string;
  }[];
  commitments: string[];
}

export const defaultCeoProfile: CeoProfileData = {
  name: "Mukhtiar Hussain Jamali",
  title: "Founder & Chief Officer",
  organization: "Nawabshah Estate Agency",
  location: "Main VIP Road, Nawabshah (Shaheed Benazirabad), Sindh",
  experienceYears: 18,
  phone: "+923128983678",
  whatsapp: "923128983678",
  email: "abeerachandio@gmail.com",
  photoUrl: "/assets/aistudio/jamali_41864176.jpg",
  shortBio: "With over 18 years of pioneering leadership in Sindh's property sector, Mukhtiar Hussain Jamali has established Nawabshah Estate Agency as the gold standard for transparent, dispute-free land transactions and high-yield real estate investments in Shaheed Benazirabad.",
  fullMessage: "Real estate in Nawabshah is more than a commercial transaction—it represents a family's lifetime savings, an agriculturalist's livelihood, and an overseas investor's trusted heritage. When I established Nawabshah Estate Agency, I made a solemn pledge: zero compromised titles, zero concealed middleman margins, and 100% legal revenue verification before a single rupee is exchanged. Today, we proudly stand as the most trusted advisory for residential plots, commercial plazas, and fertile agricultural estates across Sindh.",
  credentials: [
    "18+ Years Real Estate Market Authority in Shaheed Benazirabad",
    "Certified Land Revenue & Sub-Registrar Title Consultant",
    "Senior Property Investment Strategist for Overseas Pakistanis (UAE, UK, USA)",
    "Member, Shaheed Benazirabad Real Estate & Business Council"
  ],
  achievements: [
    {
      number: "18+",
      label: "Years Experience",
      description: "Guiding clients across Nawabshah and interior Sindh since 2008."
    },
    {
      number: "PKR 2.5B+",
      label: "Transactions Vetted",
      description: "Successfully secured transparent residential, commercial & farmland deals."
    },
    {
      number: "1,500+",
      label: "Satisfied Clients",
      description: "Families, overseas investors, and landowners with 100% dispute-free titles."
    },
    {
      number: "100%",
      label: "Legal Compliance",
      description: "Exhaustive revenue Deh Form VII & Sub-Registrar record vetting."
    }
  ],
  commitments: [
    "Personal executive oversight on all high-value acquisitions and deeds",
    "Direct face-to-face buyer and seller negotiations with open books",
    "Specialized priority support and live video inspection for Overseas Pakistanis",
    "Prompt Sub-Registrar biometric registration & mutation assistance"
  ]
};
