/**
 * Comprehensive India Geographical & Postal Dataset
 * Covering all 28 States & 8 Union Territories with major cities and PIN code validations.
 */

export interface StateGeoData {
  state: string;
  isUnionTerritory: boolean;
  pinPrefixes: string[]; // 2-digit prefixes used in India Post PIN codes
  cities: string[];
}

export const INDIA_GEO_DATA: Record<string, StateGeoData> = {
  "Andhra Pradesh": {
    state: "Andhra Pradesh",
    isUnionTerritory: false,
    pinPrefixes: ["51", "52", "53"],
    cities: [
      "Visakhapatnam",
      "Vijayawada",
      "Guntur",
      "Nellore",
      "Kurnool",
      "Kakinada",
      "Rajahmundry",
      "Tirupati",
      "Kadapa",
      "Anantapur",
      "Eluru",
      "Vizianagaram",
      "Ongole",
      "Nandyal",
      "Machilipatnam",
      "Adoni",
      "Tenali",
      "Chittoor",
      "Hindupur",
      "Bhimavaram",
      "Madanapalle",
      "Guntakal",
      "Srikakulam",
      "Dharmavaram",
      "Gudivada",
      "Narasaraopet",
      "Tadipatri",
      "Mangalagiri",
      "Amaravati",
    ],
  },
  "Arunachal Pradesh": {
    state: "Arunachal Pradesh",
    isUnionTerritory: false,
    pinPrefixes: ["79"],
    cities: [
      "Itanagar",
      "Naharlagun",
      "Pasighat",
      "Tawang",
      "Ziro",
      "Bomdila",
      "Tezu",
      "Roing",
      "Aalo",
      "Changlang",
      "Khonsa",
      "Namsai",
    ],
  },
  Assam: {
    state: "Assam",
    isUnionTerritory: false,
    pinPrefixes: ["78"],
    cities: [
      "Guwahati",
      "Silchar",
      "Dibrugarh",
      "Jorhat",
      "Nagaon",
      "Tinsukia",
      "Tezpur",
      "Bongaigaon",
      "Diphu",
      "North Lakhimpur",
      "Karimganj",
      "Sivasagar",
      "Goalpara",
      "Barpeta",
      "Dhubri",
      "Golaghat",
      "Hailakandi",
      "Mangaldai",
      "Hojai",
      "Kokrajhar",
    ],
  },
  Bihar: {
    state: "Bihar",
    isUnionTerritory: false,
    pinPrefixes: ["80", "81", "82", "83", "84", "85"],
    cities: [
      "Patna",
      "Gaya",
      "Bhagalpur",
      "Muzaffarpur",
      "Purnia",
      "Darbhanga",
      "Bihar Sharif",
      "Arrah",
      "Begusarai",
      "Katihar",
      "Munger",
      "Chhapra",
      "Danapur",
      "Saharsa",
      "Sasaram",
      "Hajipur",
      "Dehri",
      "Bettiah",
      "Motihari",
      "Bagaha",
      "Siwan",
      "Kishanganj",
      "Jamalpur",
      "Buxar",
      "Jehanabad",
      "Aurangabad",
      "Lakhisarai",
      "Nawada",
      "Madhubani",
      "Samastipur",
    ],
  },
  Chhattisgarh: {
    state: "Chhattisgarh",
    isUnionTerritory: false,
    pinPrefixes: ["49"],
    cities: [
      "Raipur",
      "Bhilai",
      "Bilaspur",
      "Korba",
      "Rajnandgaon",
      "Jagdalpur",
      "Raigarh",
      "Ambikapur",
      "Durg",
      "Dhamtari",
      "Mahasamund",
      "Kanker",
      "Chirmiri",
      "Bhatapara",
      "Dalli-Rajhara",
      "Kawardha",
    ],
  },
  Goa: {
    state: "Goa",
    isUnionTerritory: false,
    pinPrefixes: ["40"],
    cities: [
      "Panaji",
      "Margao",
      "Vasco da Gama",
      "Mapusa",
      "Ponda",
      "Bicholim",
      "Curchorem",
      "Canacona",
      "Cuncolim",
      "Quepem",
      "Sanquelim",
    ],
  },
  Gujarat: {
    state: "Gujarat",
    isUnionTerritory: false,
    pinPrefixes: ["36", "37", "38", "39"],
    cities: [
      "Ahmedabad",
      "Surat",
      "Vadodara",
      "Rajkot",
      "Bhavnagar",
      "Jamnagar",
      "Junagadh",
      "Gandhinagar",
      "Anand",
      "Navsari",
      "Morbi",
      "Nadiad",
      "Surendranagar",
      "Bharuch",
      "Mehsana",
      "Bhuj",
      "Porbandar",
      "Palanpur",
      "Valsad",
      "Vapi",
      "Gondal",
      "Veraval",
      "Godhra",
      "Patan",
      "Kalol",
      "Dahod",
      "Botad",
      "Amreli",
      "Deesa",
      "Jetpur",
      "Gandhidham",
      "Anjar",
    ],
  },
  Haryana: {
    state: "Haryana",
    isUnionTerritory: false,
    pinPrefixes: ["12", "13"],
    cities: [
      "Gurugram",
      "Faridabad",
      "Panipat",
      "Ambala",
      "Yamunanagar",
      "Rohtak",
      "Hisar",
      "Karnal",
      "Sonipat",
      "Panchkula",
      "Sirsa",
      "Bhiwani",
      "Bahadurgarh",
      "Jind",
      "Thanesar",
      "Kaithal",
      "Rewari",
      "Palwal",
      "Hansi",
      "Narnaul",
      "Fatehabad",
      "Gohana",
      "Tohana",
      "Narwana",
    ],
  },
  "Himachal Pradesh": {
    state: "Himachal Pradesh",
    isUnionTerritory: false,
    pinPrefixes: ["17"],
    cities: [
      "Shimla",
      "Dharamshala",
      "Solan",
      "Mandi",
      "Kullu",
      "Manali",
      "Baddi",
      "Nahan",
      "Hamirpur",
      "Una",
      "Bilaspur",
      "Chamba",
      "Kangra",
      "Paonta Sahib",
      "Sundarnagar",
      "Palampur",
    ],
  },
  Jharkhand: {
    state: "Jharkhand",
    isUnionTerritory: false,
    pinPrefixes: ["81", "82", "83"],
    cities: [
      "Ranchi",
      "Jamshedpur",
      "Dhanbad",
      "Bokaro Steel City",
      "Deoghar",
      "Phusro",
      "Hazaribagh",
      "Giridih",
      "Ramgarh",
      "Medininagar",
      "Chirkunda",
      "Chaibasa",
      "Dumka",
      "Gumia",
      "Madhupur",
      "Sahibganj",
      "Chatra",
    ],
  },
  Karnataka: {
    state: "Karnataka",
    isUnionTerritory: false,
    pinPrefixes: ["56", "57", "58", "59"],
    cities: [
      "Bengaluru",
      "Mysuru",
      "Hubballi-Dharwad",
      "Mangaluru",
      "Belagavi",
      "Davanagere",
      "Ballari",
      "Vijayapura",
      "Shivamogga",
      "Tumakuru",
      "Raichur",
      "Bidar",
      "Hosapete",
      "Gadag-Betageri",
      "Hassan",
      "Bhadravati",
      "Chitradurga",
      "Udupi",
      "Kolar",
      "Mandya",
      "Chikkamagaluru",
      "Gangawati",
      "Bagalkot",
      "Ranebennuru",
      "Karwar",
      "Yadgir",
      "Chintamani",
      "Gokak",
      "Sirsi",
    ],
  },
  Kerala: {
    state: "Kerala",
    isUnionTerritory: false,
    pinPrefixes: ["67", "68", "69"],
    cities: [
      "Thiruvananthapuram",
      "Kochi",
      "Kozhikode",
      "Kollam",
      "Thrissur",
      "Kannur",
      "Alappuzha",
      "Kottayam",
      "Palakkad",
      "Manjeri",
      "Thalassery",
      "Ponnani",
      "Vatakara",
      "Kanhangad",
      "Payyanur",
      "Koyilandy",
      "Neyyattinkara",
      "Kayamkulam",
      "Malappuram",
      "Guruvayur",
      "Kasargod",
      "Tirur",
      "Perinthalmanna",
      "Muvattupuzha",
    ],
  },
  "Madhya Pradesh": {
    state: "Madhya Pradesh",
    isUnionTerritory: false,
    pinPrefixes: ["45", "46", "47", "48"],
    cities: [
      "Indore",
      "Bhopal",
      "Jabalpur",
      "Gwalior",
      "Ujjain",
      "Sagar",
      "Dewas",
      "Satna",
      "Ratlam",
      "Rewa",
      "Murwara (Katni)",
      "Singrauli",
      "Burhanpur",
      "Khandwa",
      "Bhind",
      "Chhindwara",
      "Guna",
      "Shivpuri",
      "Vidisha",
      "Chhatarpur",
      "Damoh",
      "Mandsaur",
      "Khargone",
      "Neemuch",
      "Pithampur",
      "Narmadapuram",
      "Itarsi",
      "Sehore",
      "Morena",
      "Betul",
    ],
  },
  Maharashtra: {
    state: "Maharashtra",
    isUnionTerritory: false,
    pinPrefixes: ["40", "41", "42", "43", "44"],
    cities: [
      "Mumbai",
      "Pune",
      "Nagpur",
      "Thane",
      "Pimpri-Chinchwad",
      "Nashik",
      "Kalyan-Dombivli",
      "Vasai-Virar",
      "Chhatrapati Sambhaji Nagar (Aurangabad)",
      "Navi Mumbai",
      "Solapur",
      "Mira-Bhayandar",
      "Bhiwandi-Nizampur",
      "Jalgaon",
      "Amravati",
      "Nanded",
      "Kolhapur",
      "Ulhasnagar",
      "Sangli",
      "Malegaon",
      "Akola",
      "Latur",
      "Dhule",
      "Ahmednagar",
      "Chandrapur",
      "Parbhani",
      "Ichalkaranji",
      "Jalna",
      "Ambarnath",
      "Panvel",
      "Bhusawal",
      "Satara",
      "Beed",
      "Yavatmal",
      "Gondia",
      "Wardha",
      "Baramati",
    ],
  },
  Manipur: {
    state: "Manipur",
    isUnionTerritory: false,
    pinPrefixes: ["79"],
    cities: [
      "Imphal",
      "Thoubal",
      "Kakching",
      "Ukhrul",
      "Churachandpur",
      "Bishnupur",
      "Senapati",
      "Tamenglong",
      "Moirang",
    ],
  },
  Meghalaya: {
    state: "Meghalaya",
    isUnionTerritory: false,
    pinPrefixes: ["79"],
    cities: [
      "Shillong",
      "Tura",
      "Jowai",
      "Nongpoh",
      "Williamnagar",
      "Baghmara",
      "Resubelpara",
      "Mairang",
    ],
  },
  Mizoram: {
    state: "Mizoram",
    isUnionTerritory: false,
    pinPrefixes: ["79"],
    cities: [
      "Aizawl",
      "Lunglei",
      "Saiha",
      "Champhai",
      "Kolasib",
      "Serchhip",
      "Lawngtlai",
      "Hnahthial",
    ],
  },
  Nagaland: {
    state: "Nagaland",
    isUnionTerritory: false,
    pinPrefixes: ["79"],
    cities: [
      "Kohima",
      "Dimapur",
      "Mokokchung",
      "Tuensang",
      "Wokha",
      "Zunheboto",
      "Mon",
      "Phek",
      "Chumoukedima",
    ],
  },
  Odisha: {
    state: "Odisha",
    isUnionTerritory: false,
    pinPrefixes: ["75", "76", "77"],
    cities: [
      "Bhubaneswar",
      "Cuttack",
      "Rourkela",
      "Berhampur",
      "Sambalpur",
      "Puri",
      "Balasore",
      "Bhadrak",
      "Baripada",
      "Jharsuguda",
      "Jeypore",
      "Bargarh",
      "Rayagada",
      "Angul",
      "Dhenkanal",
      "Paradip",
      "Kendujhar",
      "Jatani",
      "Sunabeda",
    ],
  },
  Punjab: {
    state: "Punjab",
    isUnionTerritory: false,
    pinPrefixes: ["14", "15"],
    cities: [
      "Ludhiana",
      "Amritsar",
      "Jalandhar",
      "Patiala",
      "Bathinda",
      "Mohali (SAS Nagar)",
      "Hoshiarpur",
      "Batala",
      "Pathankot",
      "Moga",
      "Abohar",
      "Malerkotla",
      "Khanna",
      "Phagwara",
      "Muktsar",
      "Barnala",
      "Firozpur",
      "Kapurthala",
      "Rajpura",
      "Faridkot",
      "Sangrur",
    ],
  },
  Rajasthan: {
    state: "Rajasthan",
    isUnionTerritory: false,
    pinPrefixes: ["30", "31", "32", "33", "34"],
    cities: [
      "Jaipur",
      "Jodhpur",
      "Kota",
      "Bikaner",
      "Ajmer",
      "Udaipur",
      "Bhilwara",
      "Alwar",
      "Bharatpur",
      "Sikar",
      "Pali",
      "Sri Ganganagar",
      "Beawar",
      "Hanumangarh",
      "Dholpur",
      "Sawai Madhopur",
      "Churu",
      "Baran",
      "Chittorgarh",
      "Makrana",
      "Nagaur",
      "Hindaun",
      "Bhiwadi",
      "Bundi",
      "Sujangarh",
      "Kishangarh",
      "Jhunjhunu",
    ],
  },
  Sikkim: {
    state: "Sikkim",
    isUnionTerritory: false,
    pinPrefixes: ["73"],
    cities: [
      "Gangtok",
      "Namchi",
      "Geyzing",
      "Mangan",
      "Rangpo",
      "Singtam",
      "Jorethang",
      "Ravangla",
    ],
  },
  "Tamil Nadu": {
    state: "Tamil Nadu",
    isUnionTerritory: false,
    pinPrefixes: ["60", "61", "62", "63", "64"],
    cities: [
      "Chennai",
      "Coimbatore",
      "Madurai",
      "Tiruchirappalli",
      "Salem",
      "Tiruppur",
      "Erode",
      "Tirunelveli",
      "Vellore",
      "Thoothukudi",
      "Dindigul",
      "Thanjavur",
      "Ranipet",
      "Sivakasi",
      "Karur",
      "Udhagamandalam (Ooty)",
      "Hosur",
      "Nagercoil",
      "Kanchipuram",
      "Kumarapalayam",
      "Karaikkudi",
      "Neyveli",
      "Cuddalore",
      "Kumbakonam",
      "Tiruvannamalai",
      "Pollachi",
      "Rajapalayam",
      "Gudiyatham",
      "Pudukkottai",
      "Vaniyambadi",
      "Ambur",
      "Nagapattinam",
    ],
  },
  Telangana: {
    state: "Telangana",
    isUnionTerritory: false,
    pinPrefixes: ["50"],
    cities: [
      "Hyderabad",
      "Warangal",
      "Nizamabad",
      "Khammam",
      "Karimnagar",
      "Ramagundam",
      "Mahbubnagar",
      "Nalgonda",
      "Adilabad",
      "Suryapet",
      "Siddipet",
      "Miryalaguda",
      "Jagtial",
      "Nirmal",
      "Kamareddy",
      "Kothagudem",
      "Bodhan",
      "Palwancha",
      "Mancherial",
      "Sircilla",
    ],
  },
  Tripura: {
    state: "Tripura",
    isUnionTerritory: false,
    pinPrefixes: ["79"],
    cities: [
      "Agartala",
      "Dharmanagar",
      "Udaipur",
      "Kailashahar",
      "Teliamura",
      "Khowai",
      "Belonia",
      "Melaghar",
      "Ambassa",
      "Santirbazar",
    ],
  },
  "Uttar Pradesh": {
    state: "Uttar Pradesh",
    isUnionTerritory: false,
    pinPrefixes: ["20", "21", "22", "23", "24", "25", "26", "27", "28"],
    cities: [
      "Lucknow",
      "Kanpur",
      "Ghaziabad",
      "Agra",
      "Meerut",
      "Varanasi",
      "Prayagraj (Allahabad)",
      "Bareilly",
      "Aligarh",
      "Moradabad",
      "Saharanpur",
      "Gorakhpur",
      "Noida",
      "Greater Noida",
      "Firozabad",
      "Jhansi",
      "Muzaffarnagar",
      "Mathura",
      "Ayodhya",
      "Rampur",
      "Shahjahanpur",
      "Farrukhabad",
      "Hapur",
      "Budaun",
      "Etawah",
      "Mirzapur",
      "Bulandshahr",
      "Sambhal",
      "Amroha",
      "Hardoi",
      "Fatehpur",
      "Raebareli",
      "Orai",
      "Sitapur",
      "Bahraich",
      "Modinagar",
      "Unnao",
      "Jaunpur",
      "Lakhimpur",
      "Hathras",
      "Banda",
      "Pilibhit",
      "Barabanki",
      "Basti",
    ],
  },
  Uttarakhand: {
    state: "Uttarakhand",
    isUnionTerritory: false,
    pinPrefixes: ["24", "26"],
    cities: [
      "Dehradun",
      "Haridwar",
      "Roorkee",
      "Haldwani",
      "Rudrapur",
      "Kashipur",
      "Rishikesh",
      "Nainital",
      "Mussoorie",
      "Almora",
      "Pithoragarh",
      "Pauri",
      "Kotdwar",
      "Ramnagar",
      "Kichha",
      "Vikasnagar",
    ],
  },
  "West Bengal": {
    state: "West Bengal",
    isUnionTerritory: false,
    pinPrefixes: ["70", "71", "72", "73", "74"],
    cities: [
      "Kolkata",
      "Howrah",
      "Asansol",
      "Siliguri",
      "Durgapur",
      "Bardhaman",
      "Malda",
      "Baharampur",
      "Habra",
      "Kharagpur",
      "Shantipur",
      "Dankuni",
      "Dhulian",
      "Ranaghat",
      "Haldia",
      "Raiganj",
      "Krishnanagar",
      "Nabadwip",
      "Midnapore",
      "Jalpaiguri",
      "Balurghat",
      "Basirhat",
      "Bankura",
      "Darjeeling",
      "Alipurduar",
      "Purulia",
      "Jangipur",
      "Bolpur",
      "Cooch Behar",
    ],
  },
  "Andaman and Nicobar Islands": {
    state: "Andaman and Nicobar Islands",
    isUnionTerritory: true,
    pinPrefixes: ["74"],
    cities: ["Port Blair", "Diglipur", "Mayabunder", "Rangat", "Havelock Island (Swaraj Dweep)"],
  },
  Chandigarh: {
    state: "Chandigarh",
    isUnionTerritory: true,
    pinPrefixes: ["16"],
    cities: ["Chandigarh"],
  },
  "Dadra and Nagar Haveli and Daman and Diu": {
    state: "Dadra and Nagar Haveli and Daman and Diu",
    isUnionTerritory: true,
    pinPrefixes: ["39"],
    cities: ["Daman", "Diu", "Silvassa"],
  },
  "Delhi (NCT)": {
    state: "Delhi (NCT)",
    isUnionTerritory: true,
    pinPrefixes: ["11"],
    cities: [
      "New Delhi",
      "Central Delhi",
      "South Delhi",
      "North Delhi",
      "East Delhi",
      "West Delhi",
      "South West Delhi",
      "North West Delhi",
      "North East Delhi",
      "Shahdara",
      "Dwarka",
      "Rohini",
      "Connaught Place",
      "Saket",
      "Vasant Kunj",
      "Karol Bagh",
      "Lajpat Nagar",
      "Chandni Chowk",
    ],
  },
  "Jammu and Kashmir": {
    state: "Jammu and Kashmir",
    isUnionTerritory: true,
    pinPrefixes: ["18", "19"],
    cities: [
      "Srinagar",
      "Jammu",
      "Anantnag",
      "Baramulla",
      "Kathua",
      "Sopore",
      "Udhampur",
      "Rajouri",
      "Poonch",
      "Kupwara",
      "Pulwama",
      "Ganderbal",
    ],
  },
  Ladakh: {
    state: "Ladakh",
    isUnionTerritory: true,
    pinPrefixes: ["19"],
    cities: ["Leh", "Kargil", "Diskit", "Nubra"],
  },
  Lakshadweep: {
    state: "Lakshadweep",
    isUnionTerritory: true,
    pinPrefixes: ["68"],
    cities: ["Kavaratti", "Agatti", "Amini", "Andrott", "Minicoy", "Kalpeni"],
  },
  Puducherry: {
    state: "Puducherry",
    isUnionTerritory: true,
    pinPrefixes: ["60"],
    cities: ["Puducherry", "Karaikal", "Mahe", "Yanam", "Oulgaret"],
  },
};

/**
 * Returns sorted list of all 36 Indian states and union territories
 */
export function getAllIndianStates(): string[] {
  return Object.keys(INDIA_GEO_DATA).sort((a, b) => a.localeCompare(b));
}

/**
 * Returns sorted list of major cities for a given Indian state
 */
export function getCitiesForState(state: string): string[] {
  const data = INDIA_GEO_DATA[state];
  if (!data) return [];
  return [...data.cities].sort((a, b) => a.localeCompare(b));
}

/**
 * Validates 10-digit Indian mobile number
 * Strictly checks that:
 * - It contains exactly 10 digits (ignoring +91 or leading 0)
 * - The first digit must be 6, 7, 8, or 9 (TRAI standard for Indian GSM/mobile)
 */
export function validateIndianPhone(input: string): {
  valid: boolean;
  cleanDigits: string;
  error?: string;
} {
  if (!input) {
    return { valid: false, cleanDigits: "", error: "Mobile number is required." };
  }

  // Strip non-digits
  let digits = input.replace(/\D/g, "");

  // If prefixed with 91 and has 12 digits, strip country code
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  if (digits.length === 0) {
    return {
      valid: false,
      cleanDigits: "",
      error: "Please enter your 10-digit Indian mobile number.",
    };
  }

  if (digits.length < 10) {
    return {
      valid: false,
      cleanDigits: digits,
      error: `Mobile number is incomplete (${digits.length}/10 digits). Please enter full 10 digits.`,
    };
  }

  if (digits.length > 10) {
    return {
      valid: false,
      cleanDigits: digits,
      error: "Mobile number cannot exceed 10 digits (excluding +91).",
    };
  }

  const firstChar = digits[0];
  if (!["6", "7", "8", "9"].includes(firstChar)) {
    return {
      valid: false,
      cleanDigits: digits,
      error:
        "Invalid Indian mobile number. Valid mobile numbers in India must begin with 6, 7, 8, or 9.",
    };
  }

  return { valid: true, cleanDigits: digits };
}

/**
 * Validates Indian Postal PIN Code (6 numeric digits, cannot start with 0)
 * Optionally checks against the selected state's official India Post postal zone prefix
 */
export function validateIndianPin(
  pin: string,
  state?: string
): {
  valid: boolean;
  error?: string;
} {
  const cleanPin = pin.replace(/\s+/g, "").trim();

  if (!cleanPin) {
    return { valid: false, error: "Postal PIN code is required." };
  }

  if (!/^\d{6}$/.test(cleanPin)) {
    return {
      valid: false,
      error: "PIN code must be exactly 6 numeric digits (e.g. 560038).",
    };
  }

  if (cleanPin.startsWith("0")) {
    return {
      valid: false,
      error: "Indian postal PIN codes never begin with 0. Valid ranges start between 1 and 9.",
    };
  }

  // Delivery post offices in India are numbered 001 to 999. No delivery PIN code ends in '000'
  if (cleanPin.endsWith("000")) {
    return {
      valid: false,
      error: `Postal PIN code ${cleanPin} does not exist in India Post records for home delivery. Delivery post offices start from 001 (e.g. 600001, 612001).`,
    };
  }

  // Identical repetitive digits
  if (/^(\d)\1{5}$/.test(cleanPin)) {
    return {
      valid: false,
      error: `PIN code ${cleanPin} is invalid (repeated digits). Please enter your authentic 6-digit PIN code.`,
    };
  }

  // Simple sequential numbers
  if (cleanPin === "123456" || cleanPin === "654321") {
    return {
      valid: false,
      error: `PIN code ${cleanPin} is an invalid test number. Please enter your authentic 6-digit PIN code.`,
    };
  }

  // If a state is selected, verify against state's postal prefix ranges
  if (state && INDIA_GEO_DATA[state]) {
    const prefixes = INDIA_GEO_DATA[state].pinPrefixes;
    const pinPrefix = cleanPin.slice(0, 2);
    const matchesPrefix = prefixes.some((p) => cleanPin.startsWith(p));

    if (!matchesPrefix) {
      return {
        valid: false,
        error: `PIN code ${cleanPin} does not appear to match ${state} (expected to begin with ${prefixes.join(", ")}). Please verify your state and PIN code.`,
      };
    }
  }

  return { valid: true };
}

/**
 * Enhanced Indian Street Address Validator
 * Detects fake/misinformation addresses, keyboard mash, and missing premise numbers
 */
export function validateIndianStreetAddress(address: string): {
  valid: boolean;
  error?: string;
} {
  const trimmed = address.trim();

  if (!trimmed) {
    return { valid: false, error: "Delivery street address is required." };
  }

  if (trimmed.length < 12) {
    return {
      valid: false,
      error:
        "Address is too short. Please provide a complete delivery address (at least 12 characters).",
    };
  }

  // 1. Keyboard Mash & Misinformation Patterns
  // Detect unnatural consecutive vowel sequences, consonant clusters, or erratic keyboard walking
  const hasVowelMash = /[aeiouy]{4,}/i.test(trimmed);
  const hasConsonantMash = /[bcdfghjklmnpqrstvwxyz]{5,}/i.test(trimmed);
  const hasKeyboardWalk = /(asdf|qwer|zxcv|hjkl|poiuy|lkjh|mnbv)/i.test(trimmed);
  const hasRepeatedChars = /(.)\1{3,}/i.test(trimmed);

  // Check individual words for suspicious randomness (e.g. "hasiuhiuewuf")
  const rawWords = trimmed.toLowerCase().split(/[^a-z0-9]+/i).filter(Boolean);
  const hasGibberishWord = rawWords.some((word) => {
    if (word.length > 7 && !/\d/.test(word)) {
      const vowels = (word.match(/[aeiou]/g) || []).length;
      const ratio = vowels / word.length;
      if (ratio > 0.62 || ratio < 0.15) return true;
      if (/(iu|ue|ew|ui|eu|ewu|uhi){2,}/i.test(word)) return true;
    }
    return false;
  });

  if (hasVowelMash || hasConsonantMash || hasKeyboardWalk || hasRepeatedChars || hasGibberishWord) {
    return {
      valid: false,
      error:
        "The address entered appears to be invalid or misinformation. Please enter a genuine street address (e.g., Flat 402, Lotus Bloom, 100ft Road).",
    };
  }

  // 2. Premise Number / Unit Check
  // Legitimate parcel delivery requires a house/flat/building/plot number or identifier
  const hasPremiseNumber =
    /\d/.test(trimmed) ||
    /\b(flat|house|plot|door|room|shop|villa|floor|bldg|building|h\.no|d\.no|no\.?|block)\b/i.test(
      trimmed
    );

  if (!hasPremiseNumber) {
    return {
      valid: false,
      error:
        "Missing house or flat number. Please include your house, flat, building, or plot number (e.g. Flat 402, House No. 12).",
    };
  }

  // 3. Meaningful Words & Length
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length < 3) {
    return {
      valid: false,
      error:
        "Please provide a complete address with house number, building/apartment, and street/area name (at least 3 words).",
    };
  }

  // 4. Locality / Street Identifier Check
  const recognizedKeywords = [
    "road",
    "rd",
    "street",
    "st",
    "lane",
    "cross",
    "main",
    "nagar",
    "colony",
    "col",
    "layout",
    "puram",
    "galli",
    "gali",
    "marg",
    "sector",
    "sec",
    "block",
    "apartment",
    "apartments",
    "apt",
    "society",
    "soc",
    "enclave",
    "phase",
    "complex",
    "tower",
    "towers",
    "bldg",
    "building",
    "bazaar",
    "market",
    "chowk",
    "near",
    "opp",
    "opposite",
    "behind",
    "floor",
    "flat",
    "house",
    "plot",
    "door",
    "ext",
    "extension",
    "kovil",
    "temple",
    "agraharam",
    "cheri",
    "pet",
    "pete",
    "halli",
    "palya",
    "vihar",
    "kunj",
    "bagh",
    "nagar",
    "town",
    "circle",
    "highway",
    "bypass",
    "village",
    "salai",
    "terrace",
    "park",
    "gardens",
    "villa",
    "estate",
  ];

  const lowerAddress = trimmed.toLowerCase();
  const hasRecognizedLocality = recognizedKeywords.some((kw) =>
    new RegExp(`\\b${kw}\\b`, "i").test(lowerAddress)
  );

  if (!hasRecognizedLocality) {
    return {
      valid: false,
      error:
        "Please include your street, road, locality, or building name (e.g., 2nd Cross, Temple Road, Gandhi Nagar).",
    };
  }

  return { valid: true };
}

/**
 * Validates PIN code against real India Post records via local API
 */
export async function verifyIndiaPostPinOnline(
  pin: string,
  selectedState?: string,
  selectedCity?: string
): Promise<{
  valid: boolean;
  error?: string;
  data?: {
    state: string;
    district: string;
    block: string;
    postOffices: string[];
  };
}> {
  const cleanPin = pin.trim();
  if (!cleanPin || !/^\d{6}$/.test(cleanPin) || cleanPin.startsWith("0")) {
    return {
      valid: false,
      error: "PIN code must be exactly 6 numeric digits and cannot begin with 0.",
    };
  }

  try {
    const res = await fetch(`/api/pincode/${cleanPin}`);
    if (!res.ok) {
      throw new Error(`Lookup failed with status ${res.status}`);
    }

    const result = await res.json();

    if (!result.valid) {
      return {
        valid: false,
        error:
          result.error ||
          `Postal PIN code ${cleanPin} does not exist in India Post records.`,
      };
    }

    // If result has postal info, verify state match
    if (result.state && selectedState) {
      const stateNorm = selectedState.toLowerCase().trim();
      const resStateNorm = result.state.toLowerCase().trim();

      // Check if state matches (handling variations like Delhi / NCT)
      const matchesState =
        stateNorm === resStateNorm ||
        (stateNorm.includes("delhi") && resStateNorm.includes("delhi")) ||
        (stateNorm.includes("pondicherry") && resStateNorm.includes("puducherry")) ||
        (stateNorm.includes("jammu") && resStateNorm.includes("jammu"));

      if (!matchesState) {
        return {
          valid: false,
          error: `PIN code ${cleanPin} belongs to ${result.state} (${result.district || "District"}), which does not match your selected state (${selectedState}).`,
        };
      }
    }

    return {
      valid: true,
      data: {
        state: result.state,
        district: result.district,
        block: result.block,
        postOffices: result.postOffices || [],
      },
    };
  } catch (err) {
    console.warn("Online PIN verification warning:", err);
    // Fallback to offline prefix check if network/endpoint fails
    const staticVal = validateIndianPin(cleanPin, selectedState);
    return staticVal;
  }
}
