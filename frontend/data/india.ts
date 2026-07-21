export type City = {
  name: string;
  slug: string;
};

export type IndiaState = {
  name: string;
  slug: string;
  type: "State" | "Union territory";
  summary: string;
  cities: readonly City[];
};

const city = (name: string, slug?: string): City => ({
  name,
  slug:
    slug ??
    name
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
});

export const indiaStates: readonly IndiaState[] = [
  {
    name: "Andhra Pradesh",
    slug: "andhra-pradesh",
    type: "State",
    summary:
      "Coastal cities, technology centres and temple destinations across southeastern India.",
    cities: [city("Visakhapatnam"), city("Vijayawada"), city("Tirupati"), city("Guntur")],
  },
  {
    name: "Arunachal Pradesh",
    slug: "arunachal-pradesh",
    type: "State",
    summary: "Quiet Himalayan destinations and growing urban communities in India's northeast.",
    cities: [city("Itanagar"), city("Tawang")],
  },
  {
    name: "Assam",
    slug: "assam",
    type: "State",
    summary:
      "A gateway to northeast India with riverfront cities and a distinct cultural identity.",
    cities: [city("Guwahati"), city("Dibrugarh"), city("Silchar")],
  },
  {
    name: "Bihar",
    slug: "bihar",
    type: "State",
    summary: "Historic cities and expanding commercial centres along the Gangetic plain.",
    cities: [city("Patna"), city("Gaya"), city("Muzaffarpur"), city("Bhagalpur")],
  },
  {
    name: "Chhattisgarh",
    slug: "chhattisgarh",
    type: "State",
    summary:
      "Central Indian business hubs surrounded by forests, heritage and industrial districts.",
    cities: [city("Raipur"), city("Bilaspur"), city("Bhilai")],
  },
  {
    name: "Goa",
    slug: "goa",
    type: "State",
    summary:
      "India's celebrated coastal destination for nightlife, hospitality and relaxed getaways.",
    cities: [city("Panaji"), city("North Goa"), city("South Goa")],
  },
  {
    name: "Gujarat",
    slug: "gujarat",
    type: "State",
    summary:
      "Commercial, cultural and coastal centres shaped by enterprise and modern infrastructure.",
    cities: [
      city("Ahmedabad"),
      city("Surat"),
      city("Vadodara"),
      city("Rajkot"),
      city("Gandhinagar"),
    ],
  },
  {
    name: "Haryana",
    slug: "haryana",
    type: "State",
    summary: "Fast-growing NCR business districts alongside established north Indian cities.",
    cities: [city("Gurugram"), city("Faridabad"), city("Panipat"), city("Ambala")],
  },
  {
    name: "Himachal Pradesh",
    slug: "himachal-pradesh",
    type: "State",
    summary: "Mountain retreats, resort towns and year-round Himalayan travel destinations.",
    cities: [city("Shimla"), city("Manali"), city("Dharamshala")],
  },
  {
    name: "Jharkhand",
    slug: "jharkhand",
    type: "State",
    summary: "Industrial and administrative centres set across India's mineral-rich east.",
    cities: [city("Ranchi"), city("Jamshedpur"), city("Dhanbad")],
  },
  {
    name: "Karnataka",
    slug: "karnataka",
    type: "State",
    summary: "Technology, culture, coastal travel and heritage come together across the state.",
    cities: [
      city("Bengaluru"),
      city("Mysuru"),
      city("Mangaluru"),
      city("Hubballi"),
      city("Belagavi"),
    ],
  },
  {
    name: "Kerala",
    slug: "kerala",
    type: "State",
    summary: "Cosmopolitan coastal cities, wellness travel and lush southern landscapes.",
    cities: [city("Kochi"), city("Thiruvananthapuram"), city("Kozhikode"), city("Thrissur")],
  },
  {
    name: "Madhya Pradesh",
    slug: "madhya-pradesh",
    type: "State",
    summary: "Central Indian capitals, commercial hubs and historic destinations.",
    cities: [city("Bhopal"), city("Indore"), city("Gwalior"), city("Jabalpur")],
  },
  {
    name: "Maharashtra",
    slug: "maharashtra",
    type: "State",
    summary: "India's financial capital, major technology districts and vibrant cultural centres.",
    cities: [
      city("Mumbai"),
      city("Pune"),
      city("Nagpur"),
      city("Nashik"),
      city("Thane"),
      city("Navi Mumbai"),
    ],
  },
  {
    name: "Manipur",
    slug: "manipur",
    type: "State",
    summary: "A culturally rich northeastern state centred on the Imphal valley.",
    cities: [city("Imphal")],
  },
  {
    name: "Meghalaya",
    slug: "meghalaya",
    type: "State",
    summary: "A highland destination known for music, rain-rich landscapes and Shillong life.",
    cities: [city("Shillong")],
  },
  {
    name: "Mizoram",
    slug: "mizoram",
    type: "State",
    summary: "Hillside communities and a distinctive contemporary culture around Aizawl.",
    cities: [city("Aizawl")],
  },
  {
    name: "Nagaland",
    slug: "nagaland",
    type: "State",
    summary: "Northeastern city life shaped by craft, music and strong local traditions.",
    cities: [city("Kohima"), city("Dimapur")],
  },
  {
    name: "Odisha",
    slug: "odisha",
    type: "State",
    summary: "Temple heritage, coastal escapes and rapidly developing eastern cities.",
    cities: [city("Bhubaneswar"), city("Cuttack"), city("Puri"), city("Rourkela")],
  },
  {
    name: "Punjab",
    slug: "punjab",
    type: "State",
    summary: "Energetic cities, celebrated hospitality and thriving commercial districts.",
    cities: [city("Ludhiana"), city("Amritsar"), city("Jalandhar"), city("Mohali")],
  },
  {
    name: "Rajasthan",
    slug: "rajasthan",
    type: "State",
    summary: "Palace cities, desert culture and some of India's best-known luxury destinations.",
    cities: [city("Jaipur"), city("Udaipur"), city("Jodhpur"), city("Kota"), city("Ajmer")],
  },
  {
    name: "Sikkim",
    slug: "sikkim",
    type: "State",
    summary: "A compact Himalayan state with Gangtok at the centre of travel and hospitality.",
    cities: [city("Gangtok")],
  },
  {
    name: "Tamil Nadu",
    slug: "tamil-nadu",
    type: "State",
    summary: "Major metropolitan, manufacturing and cultural centres across southern India.",
    cities: [
      city("Chennai"),
      city("Coimbatore"),
      city("Madurai"),
      city("Tiruchirappalli"),
      city("Salem"),
    ],
  },
  {
    name: "Telangana",
    slug: "telangana",
    type: "State",
    summary: "A technology-led state centred on Hyderabad's global business and dining scene.",
    cities: [city("Hyderabad"), city("Secunderabad"), city("Warangal")],
  },
  {
    name: "Tripura",
    slug: "tripura",
    type: "State",
    summary: "A green northeastern state with Agartala as its cultural and commercial centre.",
    cities: [city("Agartala")],
  },
  {
    name: "Uttar Pradesh",
    slug: "uttar-pradesh",
    type: "State",
    summary: "NCR districts, historic cities and large commercial centres across north India.",
    cities: [
      city("Lucknow"),
      city("Noida"),
      city("Greater Noida"),
      city("Ghaziabad"),
      city("Varanasi"),
      city("Kanpur"),
      city("Agra"),
      city("Prayagraj"),
    ],
  },
  {
    name: "Uttarakhand",
    slug: "uttarakhand",
    type: "State",
    summary: "Foothill cities, wellness destinations and popular Himalayan escapes.",
    cities: [city("Dehradun"), city("Haridwar"), city("Rishikesh"), city("Nainital")],
  },
  {
    name: "West Bengal",
    slug: "west-bengal",
    type: "State",
    summary: "Kolkata's metropolitan culture with industrial and Himalayan gateway cities.",
    cities: [city("Kolkata"), city("Siliguri"), city("Durgapur"), city("Howrah")],
  },
  {
    name: "Andaman and Nicobar Islands",
    slug: "andaman-and-nicobar-islands",
    type: "Union territory",
    summary: "Remote island hospitality and coastal travel centred on Port Blair.",
    cities: [city("Port Blair")],
  },
  {
    name: "Chandigarh",
    slug: "chandigarh",
    type: "Union territory",
    summary: "A carefully planned northern city serving as a major regional hub.",
    cities: [city("Chandigarh")],
  },
  {
    name: "Dadra and Nagar Haveli and Daman and Diu",
    slug: "dadra-nagar-haveli-daman-diu",
    type: "Union territory",
    summary: "Compact western districts linking industry, beaches and weekend travel.",
    cities: [city("Silvassa"), city("Daman"), city("Diu")],
  },
  {
    name: "Delhi",
    slug: "delhi",
    type: "Union territory",
    summary:
      "India's capital region with distinct business, hospitality and residential districts.",
    cities: [city("New Delhi"), city("South Delhi"), city("Dwarka"), city("Rohini"), city("Saket")],
  },
  {
    name: "Jammu and Kashmir",
    slug: "jammu-and-kashmir",
    type: "Union territory",
    summary: "Valley and foothill cities known for hospitality, scenery and seasonal travel.",
    cities: [city("Srinagar"), city("Jammu")],
  },
  {
    name: "Ladakh",
    slug: "ladakh",
    type: "Union territory",
    summary: "High-altitude travel and small urban centres across a dramatic Himalayan landscape.",
    cities: [city("Leh"), city("Kargil")],
  },
  {
    name: "Lakshadweep",
    slug: "lakshadweep",
    type: "Union territory",
    summary: "A protected island group with limited, carefully managed visitor infrastructure.",
    cities: [city("Kavaratti")],
  },
  {
    name: "Puducherry",
    slug: "puducherry",
    type: "Union territory",
    summary: "Coastal heritage, cafes and relaxed hospitality in a compact southern territory.",
    cities: [city("Puducherry"), city("Karaikal")],
  },
] as const;

export const categories = ["Independent", "Model", "VIP", "College", "Massage"] as const;

const profileNames = [
  "Aarohi",
  "Riya",
  "Ishani",
  "Naina",
  "Meera",
  "Tara",
  "Kiara",
  "Anaya",
] as const;

const profileImages = [
  "/images/profile-mumbai.png",
  "/images/profile-bengaluru.png",
  "/images/hero-lounge.png",
] as const;

export type DemoProfile = {
  id: string;
  name: string;
  slug: string;
  age: number;
  state: string;
  stateSlug: string;
  city: string;
  citySlug: string;
  category: (typeof categories)[number];
  languages: readonly string[];
  image: string;
  imageAlt: string;
  shortBio: string;
  fullBio: string;
  availability: string;
  verifiedAdult: true;
  demo: true;
};

export const demoProfiles: readonly DemoProfile[] = indiaStates.flatMap((state, stateIndex) =>
  state.cities.map((profileCity, cityIndex) => {
    const index = stateIndex + cityIndex;
    const name = profileNames[index % profileNames.length] ?? "Aarohi";
    const category = categories[index % categories.length] ?? "Independent";
    const image = profileImages[index % profileImages.length] ?? profileImages[0];
    const age = 26 + (index % 6);

    return {
      id: `${state.slug}-${profileCity.slug}`,
      name,
      slug: `${name.toLowerCase()}-${profileCity.slug}`,
      age,
      state: state.name,
      stateSlug: state.slug,
      city: profileCity.name,
      citySlug: profileCity.slug,
      category,
      languages: index % 2 === 0 ? ["Hindi", "English"] : ["English", "Regional language"],
      image,
      imageAlt: `Fictional adult demo profile for ${profileCity.name}, ${state.name}`,
      shortBio: `A fictional ${category.toLowerCase()} demo profile created for the ${profileCity.name} directory preview.`,
      fullBio: `${name} is fictional demo content used to demonstrate a consent-first profile layout for ${profileCity.name}. No real service, identity or contact information is represented. Production records must be created only for verified adults who have consented to publication.`,
      availability: "Schedule shared after direct contact",
      verifiedAdult: true,
      demo: true,
    } satisfies DemoProfile;
  }),
);

const stateBySlug = new Map(indiaStates.map((state) => [state.slug, state]));
const profileBySlug = new Map(demoProfiles.map((profile) => [profile.slug, profile]));

export const getState = (slug: string) => stateBySlug.get(slug);
export const getCity = (stateSlug: string, citySlug: string) =>
  getState(stateSlug)?.cities.find((item) => item.slug === citySlug);
export const getProfilesByState = (stateSlug: string) =>
  demoProfiles.filter((profile) => profile.stateSlug === stateSlug);
export const getProfilesByCity = (stateSlug: string, citySlug: string) =>
  demoProfiles.filter(
    (profile) => profile.stateSlug === stateSlug && profile.citySlug === citySlug,
  );
export const getProfile = (slug: string) => profileBySlug.get(slug);
