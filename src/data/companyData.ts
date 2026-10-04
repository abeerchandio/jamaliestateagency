export interface CompanyInfo {
  name: string;
  tagline: string;
  shortDescription: string;
  phone: string;
  displayPhone: string;
  whatsappNumber: string;
  displayWhatsapp: string;
  email: string;
  address: string;
  city: string;
  country: string;
  workingHours: string;
  emergencyService: string;
}

export const defaultCompanyInfo: CompanyInfo = {
  name: "Nawabshah Estate Agency",
  tagline: "Premier Property Advisors & Real Estate Consultants in Shaheed Benazirabad",
  shortDescription: "Your most trusted real estate partner in Nawabshah. We specialize in verified residential plots, luxury family bungalows, prime commercial plazas, and fertile agricultural farmland with 100% legal title verification.",
  phone: "+923128983678",
  displayPhone: "0312-8983678",
  whatsappNumber: "923128983678",
  displayWhatsapp: "0312-8983678",
  email: "info@nawabshahestate.com",
  address: "Main VIP Road, Opposite Press Club & Civic Center",
  city: "Nawabshah (Shaheed Benazirabad), Sindh",
  country: "Pakistan",
  workingHours: "Monday – Saturday: 09:00 AM – 09:00 PM (Friday: 03:00 PM – 09:00 PM)",
  emergencyService: "Instant WhatsApp Property Consultation Available 7 Days a Week",
};

export interface ServiceItem {
  id: string;
  title: string;
  category: "residential" | "commercial" | "agricultural" | "legal";
  subtitle: string;
  description: string;
  iconName: string;
  features: string[];
  equipmentHandled: string[]; // Here representing areas / legal documents covered
  turnaround: string;
}

export const servicesData: ServiceItem[] = [
  {
    id: "residential-sale-purchase",
    title: "Residential Plots & Luxury Villas",
    category: "residential",
    subtitle: "Plots & Built Houses in Top Housing Societies",
    description: "Assisting families and overseas investors in acquiring and selling prime residential plots (120, 200, 400 & 600 Sq. Yards) and ready-to-move luxury houses in Nawabshah's most prestigious gated communities.",
    iconName: "Home",
    features: [
      "Direct owner-to-buyer transparent meetings with zero hidden commissions",
      "Prime inventory in Society Phase 1, Phase 2, Airport Road, and Taj Colony",
      "Corner plots, park facing, and wide boulevard luxury allocations",
      "Immediate possession and utility connection assistance (Electricity, Gas, Water)"
    ],
    equipmentHandled: ["Society Phase 1 & 2", "Airport Road", "Gulshan-e-Mustafa", "Officers Colony"],
    turnaround: "Immediate viewings & fast transaction processing"
  },
  {
    id: "commercial-property-leasing",
    title: "Commercial Plazas, Shops & Showrooms",
    category: "commercial",
    subtitle: "High-Footfall Retail & Corporate Offices",
    description: "Securing high-yield commercial properties, road-facing shops, multi-story plaza floors, and corporate leasing spaces for banks, retail brands, clinics, and franchise businesses.",
    iconName: "Building2",
    features: [
      "High rental yield commercial plots and running retail shops",
      "VIP Road, Court Road, Market Road, and Qazi Ahmed Road commercial hubs",
      "Corporate long-term lease agreements with verified national tenants",
      "Plaza floor pre-launch booking and installment plan consultancy"
    ],
    equipmentHandled: ["VIP Road Frontage", "Court Road", "Chakra Bazaar Market", "Main Bypass"],
    turnaround: "Commercial appraisal and tenant matching within 7 days"
  },
  {
    id: "agricultural-land-orchards",
    title: "Agricultural Land & Mango Orchards",
    category: "agricultural",
    subtitle: "Canal-Irrigated Fertile Acreage in Sindh",
    description: "Specialized brokerage for agricultural land, fertile sugarcane/wheat farms, and prize Sindhri mango orchards along the Rohri Canal and Indus irrigation network with clear canal water shares.",
    iconName: "Tractor",
    features: [
      "Perpetual canal water turn (Waara) and electric tube-well verified lands",
      "Large acreages available (5 Acres to 200+ Acres parcels)",
      "High productivity fertile soils suited for Cotton, Wheat, Sugarcane & Orchards",
      "Direct Zamindar (landowner) negotiations with verified revenue records"
    ],
    equipmentHandled: ["Rohri Canal Belt", "Sakrand Road", "Daur Road", "Jam Sahib Agricultural Zone"],
    turnaround: "On-site soil & water verification with revenue record extraction"
  },
  {
    id: "legal-verification-registry",
    title: "Legal Verification, Registry & Mutation",
    category: "legal",
    subtitle: "100% Secure & Fraud-Free Property Documentation",
    description: "Comprehensive legal vetting of property documents before you pay a single rupee. Our legal panel verifies revenue records, Mukhtiarkar records, City Survey sheets, and registers official deeds.",
    iconName: "ShieldCheck",
    features: [
      "Verification of Fard, Deh Form VII, Mutation (Inteqal), and Registry",
      "NOC clearance from local development authorities and municipal corporations",
      "Official stamp paper drafting and Sub-Registrar deed execution",
      "Protection for Overseas Pakistanis against encroachment and fake titles"
    ],
    equipmentHandled: ["Sub-Registrar Office", "Mukhtiarkar Revenue Branch", "City Survey Office", "Bank Legal Panels"],
    turnaround: "Complete legal verification report delivered in 48-72 hours"
  },
  {
    id: "property-valuation-advisory",
    title: "Property Valuation & Capital Growth Advisory",
    category: "commercial",
    subtitle: "Accurate Market Assessments & ROI Forecasting",
    description: "Independent market valuation for inheritance division, bank mortgage appraisals, and strategic portfolio diversification across developing sectors of Nawabshah.",
    iconName: "TrendingUp",
    features: [
      "Recent comparable sales data and price per square yard analysis",
      "Future appreciation forecasting based on upcoming infrastructure and bypasses",
      "Taxation and Capital Gains Tax (CGT) advice for property transactions",
      "Rental yield optimization for residential and commercial landlords"
    ],
    equipmentHandled: ["Residential Valuation", "Commercial Plaza Sizing", "Agricultural Parcel Pricing"],
    turnaround: "Written comparative valuation report in 24 hours"
  },
  {
    id: "turnkey-construction-management",
    title: "Architectural Design & Turnkey Construction",
    category: "residential",
    subtitle: "From Empty Plot to Luxury Dream Home",
    description: "Partnering with certified civil engineers and architects in Nawabshah to design modern floor plans, obtain municipal approvals, and build earthquake-resistant quality homes.",
    iconName: "Compass",
    features: [
      "Modern 2D/3D elevations and vastu/functional floor layouts",
      "A-grade material construction (Bricks, Steel, Cement, Electrical & Plumbing)",
      "Transparent grey structure and turnkey finishing contracts",
      "Timely milestone deliveries with regular photographic site progress updates"
    ],
    equipmentHandled: ["120 to 600 Sq. Yard Homes", "Commercial Shop Fronts", "Boundary Wall Fencing"],
    turnaround: "Design within 10 days; turnkey completion within 8-12 months"
  }
];

export interface PropertyItem {
  id: string;
  title: string;
  type: "residential_plot" | "house" | "commercial" | "agricultural";
  typeLabel: string;
  location: string;
  size: string;
  price: string;
  priceNumeric: number;
  featured: boolean;
  image: string;
  description: string;
  specs: {
    area: string;
    dimension?: string;
    facing?: string;
    status: string;
    utilities: string;
  };
  keyFeatures: string[];
}

export const propertiesData: PropertyItem[] = [
  {
    id: "prop-1",
    title: "400 Sq. Yards West-Open Luxury Bungalow",
    type: "house",
    typeLabel: "Luxury House",
    location: "Society Phase 1, Near Main Park, Nawabshah",
    size: "400 Sq. Yards (Double Story)",
    price: "PKR 4.25 Crore",
    priceNumeric: 42500000,
    featured: true,
    image: "/src/assets/images/hero_nawabshah_villas_1790974799226.jpg",
    description: "Brand new architect-designed 5-bedroom double-story luxury home. Features imported Spanish tiles, solid teak wood doors, Italian kitchen fittings, spacious car porch for 3 vehicles, and lush green lawn.",
    specs: {
      area: "400 Sq. Yards",
      dimension: "60 x 60 ft",
      facing: "West Open / Corner",
      status: "Ready for Possession",
      utilities: "Electricity, Sui Gas, Sweet Water, Sewerage"
    },
    keyFeatures: [
      "5 Master Bedrooms with En-suite Bathrooms",
      "Spacious Drawing & Dining Hall + 2 TV Lounges",
      "Separate Servant Quarter with Bath",
      "Commercial Grade Solar Inverter System Installed"
    ]
  },
  {
    id: "prop-2",
    title: "200 Sq. Yards Prime Residential Plot",
    type: "residential_plot",
    typeLabel: "Residential Plot",
    location: "Society Phase 2, Wide 50ft Boulevard, Nawabshah",
    size: "200 Sq. Yards",
    price: "PKR 95 Lacs",
    priceNumeric: 9500000,
    featured: true,
    image: "/src/assets/images/luxury_residential_house_1790974845060.jpg",
    description: "Super prime location residential plot on a 50-feet wide carpeted boulevard. 100% cleared title with immediate registry and possession. Walking distance to community mosque and main commercial markaz.",
    specs: {
      area: "200 Sq. Yards",
      dimension: "30 x 60 ft",
      facing: "North-Facing / Boulevard",
      status: "Immediate Registry & Possession",
      utilities: "Underground Electricity, Water, Gas Available"
    },
    keyFeatures: [
      "100% Leased & Verified by Revenue Department",
      "Ideal for immediate construction of a modern 4-bed house",
      "Close to reputable schools and healthcare facilities",
      "High capital appreciation potential"
    ]
  },
  {
    id: "prop-3",
    title: "Prime Commercial Plaza Ground Floor Shops",
    type: "commercial",
    typeLabel: "Commercial Plaza",
    location: "Main VIP Road, Civic Center Hub, Nawabshah",
    size: "Ground + 2 Floors (Shops & Offices)",
    price: "PKR 1.80 Crore (Floor) / Rental Available",
    priceNumeric: 18000000,
    featured: true,
    image: "/src/assets/images/commercial_plaza_center_1790974811884.jpg",
    description: "High-visibility commercial retail space right on Main VIP Road. Heavy footfall area ideal for pharmaceutical store, bank branch, clothing brand outlet, or telecom franchise.",
    specs: {
      area: "1,200 Sq. Feet Frontage",
      dimension: "30 x 40 ft",
      facing: "Main VIP Road Road-Facing",
      status: "Operational / Tenant In Place",
      utilities: "Dedicated 3-Phase Commercial Meter, Generator Backup"
    },
    keyFeatures: [
      "Guaranteed monthly rental yield of PKR 120,000+",
      "Wide customer parking area directly in front",
      "Modern glass elevation and automatic shutter systems",
      "Commercial conversion and map approval completed"
    ]
  },
  {
    id: "prop-4",
    title: "25 Acres High-Yield Mango Orchard & Agricultural Farm",
    type: "agricultural",
    typeLabel: "Agricultural Land",
    location: "Sakrand Road, Near Rohri Canal Distributary, Nawabshah",
    size: "25 Acres (100 Jareeb / 200 Ghunta)",
    price: "PKR 45 Lacs / Acre",
    priceNumeric: 4500000,
    featured: true,
    image: "/src/assets/images/agricultural_farmland_acres_1790974823879.jpg",
    description: "Exceptional fertile agricultural farm featuring mature Sindhri & Chaunsa mango trees yielding premium commercial fruit every season, alongside laser-leveled land for sugarcane and cotton crops.",
    specs: {
      area: "25 Acres",
      dimension: "Square Rectangular Parcel",
      facing: "Paved Road Frontage + Canal Water Path",
      status: "Clear Title / Form VII Verified",
      utilities: "Permanent Canal Waara, 20HP Tube-Well, Farmhouse"
    },
    keyFeatures: [
      "Over 1,200 commercial Sindhri mango trees in prime production",
      "Equipped with functional solar tube-well and tubewell room",
      "Includes a 3-room Zamindar farmhouse with boundary wall",
      "Direct access from 24-feet paved metaled link road"
    ]
  },
  {
    id: "prop-5",
    title: "120 Sq. Yards Ready Family House",
    type: "house",
    typeLabel: "Family House",
    location: "Airport Road, Taj Colony, Nawabshah",
    size: "120 Sq. Yards (Single Story + Roof)",
    price: "PKR 78 Lacs",
    priceNumeric: 7800000,
    featured: false,
    image: "/src/assets/images/luxury_residential_house_1790974845060.jpg",
    description: "Neatly maintained 3-bedroom single-story home with rooftop terrace. Highly peaceful residential neighborhood, equipped with separate drawing room, kitchen, and covered car parking.",
    specs: {
      area: "120 Sq. Yards",
      dimension: "24 x 45 ft",
      facing: "East Facing",
      status: "Ready to Move",
      utilities: "Sui Gas, K-Electric, Sweet Water"
    },
    keyFeatures: [
      "Tiled flooring throughout the house",
      "Solid RCC roof structure capable of second-floor expansion",
      "Peaceful street with family-oriented neighbors",
      "Priced for urgent sale with flexible payment terms"
    ]
  },
  {
    id: "prop-6",
    title: "10 Acres Fertile Agricultural Land Parcel",
    type: "agricultural",
    typeLabel: "Agricultural Land",
    location: "Jam Sahib Road, Canal Belt, Nawabshah",
    size: "10 Acres",
    price: "PKR 38 Lacs / Acre",
    priceNumeric: 3800000,
    featured: false,
    image: "/src/assets/images/agricultural_farmland_acres_1790974823879.jpg",
    description: "Laser-leveled fertile land with rich alluvial soil ideal for wheat, cotton, and sunflower farming. Regular perennial canal water supply with certified revenue registration.",
    specs: {
      area: "10 Acres",
      dimension: "Single Block",
      facing: "Watercourse Frontage",
      status: "Immediate Registry Transfer",
      utilities: "Perennial Canal Water Share, Electric Line Nearby"
    },
    keyFeatures: [
      "100% arable with zero saline patches",
      "Clean single-owner revenue record with no bank pledges",
      "Substantial annual leasing income if rented to local growers",
      "Easy approach for tractors and harvest trucks"
    ]
  }
];

export interface DealProjectItem {
  id: string;
  title: string;
  category: "residential" | "commercial" | "agricultural";
  categoryLabel: string;
  location: string;
  clientType: string;
  scale: string;
  impact: string;
  description: string;
  image: string;
  highlights: string[];
}

export const recentDealsData: DealProjectItem[] = [
  {
    id: "deal-1",
    title: "Commercial Plaza Sale & High-End Bank Lease",
    category: "commercial",
    categoryLabel: "Commercial Deal",
    location: "VIP Road, Civic Center, Nawabshah",
    clientType: "Commercial Investor & National Bank",
    scale: "Ground + Mezzanine Plaza (3,400 Sq. Ft)",
    impact: "PKR 350,000/Month Long-Term Corporate Rental Contract",
    description: "Represented the property owner in structuring a 10-year corporate lease with a leading commercial bank branch, managing full municipal NOCs, security deposit escrow, and revenue registration.",
    image: "/src/assets/images/commercial_plaza_center_1790974811884.jpg",
    highlights: ["10-year lease with guaranteed 10% annual escalation", "Zero dispute settlement with prompt possession", "Bank interior fit-out completed smoothly"]
  },
  {
    id: "deal-2",
    title: "50-Acre Mango Farm Acquisition for Overseas Investor",
    category: "agricultural",
    categoryLabel: "Agricultural Farm",
    location: "Rohri Canal Belt, Shaheed Benazirabad",
    clientType: "Overseas Pakistani (UK Based)",
    scale: "50 Acres with Canal Water & Tube-Wells",
    impact: "100% Clear Title Verification in Record 4 Days",
    description: "Conducted exhaustive title search going back 35 years in the District Revenue Record Room to verify unencumbered ownership for a UK-based investor, followed by formal biometric registry at Sub-Registrar Nawabshah.",
    image: "/src/assets/images/agricultural_farmland_acres_1790974823879.jpg",
    highlights: ["Revenue Form VII and Mutation verified before payment", "Assisted in appointing local farm manager and solar pump setup", "Transparent token and bayana agreement"]
  },
  {
    id: "deal-3",
    title: "Society Phase 1 & 2 Block Sales & Villa Transfers",
    category: "residential",
    categoryLabel: "Residential Plots",
    location: "Society Phase 1 & 2, Nawabshah",
    clientType: "Private Home Builders & Families",
    scale: "18 Prime 200 & 400 Sq. Yard Plots",
    impact: "Over PKR 15 Crore Successful Transactions in 2025-2026",
    description: "Facilitated smooth transfers, biometric verifications, and building NOC clearances for over 18 residential plots and luxury villas for families building their forever homes in Nawabshah.",
    image: "/src/assets/images/estate_agency_office_1790974834547.jpg",
    highlights: ["Strict zero-litigation policy adhered to", "Assisted clients with architect recommendations and utility meters", "Same-day society transfer coordination"]
  }
];

export const clientReviews = [
  {
    id: "rev-1",
    client: "Dr. Farhan Zardari",
    role: "Senior Consultant Surgeon",
    location: "Nawabshah",
    quote: "Nawabshah Estate Agency helped me find the perfect 400 Sq. Yard corner plot in Society Phase 1. They thoroughly checked all revenue records, handled the registry paperwork, and made the entire buying process transparent and stress-free.",
    rating: 5,
    dealType: "400 Sq. Yd Luxury Villa Plot"
  },
  {
    id: "rev-2",
    client: "Tariq Mehmood Jamali",
    role: "Agriculturalist & Landowner",
    location: "Sakrand / Nawabshah",
    quote: "Selling agricultural land is complex due to canal water shares and revenue documentation. Nawabshah Estate Agency brought genuine direct buyers, negotiated fair market rates, and finalized the deal with complete legal security.",
    rating: 5,
    dealType: "30 Acres Farmland Sale"
  },
  {
    id: "rev-3",
    client: "Shahid Ali Rind",
    role: "Overseas Investor",
    location: "Dubai / Nawabshah",
    quote: "Living in the UAE, finding trustworthy property agents in Nawabshah was tough until I met Nawabshah Estate Agency. They helped me purchase two commercial shops on VIP Road and found corporate tenants immediately. Highly recommended!",
    rating: 5,
    dealType: "VIP Road Commercial Investment"
  }
];

export const trustedGuarantees = [
  { label: "100% Verified Titles", desc: "No disputed or illegal land files ever" },
  { label: "Direct Buyer-Seller Meeting", desc: "Transparent price negotiation with zero hidden charges" },
  { label: "Sub-Registrar Legal Support", desc: "Complete revenue record search and registration assistance" },
  { label: "Local Sindh Market Authority", desc: "Over 15+ years of deep real estate leadership in Nawabshah" }
];
