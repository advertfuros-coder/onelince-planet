// lib/config/districtMapping.js

/**
 * Major Indian districts with representative pincodes
 * Organized by state for efficient lookup
 * Each district represents 20-50 pincodes on average
 */

export const districtMapping = {
  // ============ Maharashtra ============
  Maharashtra: [
    {
      code: "MUMBAI_CITY",
      name: "Mumbai City",
      pincodes: [
        "400001",
        "400002",
        "400003",
        "400004",
        "400005",
        "400006",
        "400007",
        "400008",
        "400009",
        "400010",
      ],
      zone: "Metro",
    },
    {
      code: "MUMBAI_SUBURBAN",
      name: "Mumbai Suburban",
      pincodes: [
        "400050",
        "400051",
        "400052",
        "400053",
        "400054",
        "400055",
        "400056",
        "400057",
        "400058",
        "400059",
      ],
      zone: "Metro",
    },
    {
      code: "PUNE",
      name: "Pune",
      pincodes: [
        "411001",
        "411002",
        "411003",
        "411004",
        "411005",
        "411006",
        "411007",
        "411008",
        "411009",
        "411010",
      ],
      zone: "Tier1",
    },
    {
      code: "NAGPUR",
      name: "Nagpur",
      pincodes: [
        "440001",
        "440002",
        "440003",
        "440004",
        "440005",
        "440006",
        "440007",
        "440008",
        "440009",
        "440010",
      ],
      zone: "Tier1",
    },
    {
      code: "THANE",
      name: "Thane",
      pincodes: [
        "400601",
        "400602",
        "400603",
        "400604",
        "400605",
        "400606",
        "400607",
        "400608",
        "400609",
        "400610",
      ],
      zone: "Tier1",
    },
    {
      code: "NASHIK",
      name: "Nashik",
      pincodes: [
        "422001",
        "422002",
        "422003",
        "422004",
        "422005",
        "422006",
        "422007",
        "422008",
        "422009",
        "422010",
      ],
      zone: "Tier2",
    },
    {
      code: "AURANGABAD",
      name: "Aurangabad",
      pincodes: ["431001", "431002", "431003", "431004", "431005"],
      zone: "Tier2",
    },
  ],

  // ============ Delhi ============
  Delhi: [
    {
      code: "CENTRAL_DELHI",
      name: "Central Delhi",
      pincodes: [
        "110001",
        "110002",
        "110003",
        "110004",
        "110005",
        "110006",
        "110007",
        "110008",
        "110009",
        "110010",
      ],
      zone: "Metro",
    },
    {
      code: "SOUTH_DELHI",
      name: "South Delhi",
      pincodes: [
        "110011",
        "110012",
        "110013",
        "110014",
        "110015",
        "110016",
        "110017",
        "110018",
        "110019",
        "110020",
      ],
      zone: "Metro",
    },
    {
      code: "NORTH_DELHI",
      name: "North Delhi",
      pincodes: [
        "110031",
        "110032",
        "110033",
        "110034",
        "110035",
        "110036",
        "110037",
        "110038",
        "110039",
        "110040",
      ],
      zone: "Metro",
    },
    {
      code: "WEST_DELHI",
      name: "West Delhi",
      pincodes: [
        "110051",
        "110052",
        "110053",
        "110054",
        "110055",
        "110056",
        "110057",
        "110058",
        "110059",
        "110060",
      ],
      zone: "Metro",
    },
    {
      code: "EAST_DELHI",
      name: "East Delhi",
      pincodes: ["110091", "110092", "110093", "110094", "110095", "110096"],
      zone: "Metro",
    },
  ],

  // ============ Karnataka ============
  Karnataka: [
    {
      code: "BANGALORE_URBAN",
      name: "Bangalore Urban",
      pincodes: [
        "560001",
        "560002",
        "560003",
        "560004",
        "560005",
        "560006",
        "560007",
        "560008",
        "560009",
        "560010",
      ],
      zone: "Metro",
    },
    {
      code: "BANGALORE_RURAL",
      name: "Bangalore Rural",
      pincodes: ["562101", "562102", "562103", "562104", "562105"],
      zone: "Tier1",
    },
    {
      code: "MYSORE",
      name: "Mysore",
      pincodes: [
        "570001",
        "570002",
        "570003",
        "570004",
        "570005",
        "570006",
        "570007",
        "570008",
        "570009",
        "570010",
      ],
      zone: "Tier2",
    },
    {
      code: "MANGALORE",
      name: "Mangalore",
      pincodes: ["575001", "575002", "575003", "575004", "575005"],
      zone: "Tier2",
    },
    {
      code: "HUBLI",
      name: "Hubli",
      pincodes: ["580001", "580002", "580003", "580004", "580005"],
      zone: "Tier2",
    },
  ],

  // ============ Tamil Nadu ============
  "Tamil Nadu": [
    {
      code: "CHENNAI",
      name: "Chennai",
      pincodes: [
        "600001",
        "600002",
        "600003",
        "600004",
        "600005",
        "600006",
        "600007",
        "600008",
        "600009",
        "600010",
      ],
      zone: "Metro",
    },
    {
      code: "COIMBATORE",
      name: "Coimbatore",
      pincodes: [
        "641001",
        "641002",
        "641003",
        "641004",
        "641005",
        "641006",
        "641007",
        "641008",
        "641009",
        "641010",
      ],
      zone: "Tier2",
    },
    {
      code: "MADURAI",
      name: "Madurai",
      pincodes: [
        "625001",
        "625002",
        "625003",
        "625004",
        "625005",
        "625006",
        "625007",
        "625008",
        "625009",
        "625010",
      ],
      zone: "Tier2",
    },
    {
      code: "SALEM",
      name: "Salem",
      pincodes: ["636001", "636002", "636003", "636004", "636005"],
      zone: "Tier2",
    },
  ],

  // ============ West Bengal ============
  "West Bengal": [
    {
      code: "KOLKATA",
      name: "Kolkata",
      pincodes: [
        "700001",
        "700002",
        "700003",
        "700004",
        "700005",
        "700006",
        "700007",
        "700008",
        "700009",
        "700010",
      ],
      zone: "Metro",
    },
    {
      code: "HOWRAH",
      name: "Howrah",
      pincodes: ["711101", "711102", "711103", "711104", "711105"],
      zone: "Tier2",
    },
    {
      code: "DURGAPUR",
      name: "Durgapur",
      pincodes: ["713201", "713202", "713203", "713204", "713205"],
      zone: "Tier2",
    },
  ],

  // ============ Telangana ============
  Telangana: [
    {
      code: "HYDERABAD",
      name: "Hyderabad",
      pincodes: [
        "500001",
        "500002",
        "500003",
        "500004",
        "500005",
        "500006",
        "500007",
        "500008",
        "500009",
        "500010",
      ],
      zone: "Metro",
    },
    {
      code: "SECUNDERABAD",
      name: "Secunderabad",
      pincodes: ["500011", "500012", "500013", "500014", "500015"],
      zone: "Metro",
    },
    {
      code: "WARANGAL",
      name: "Warangal",
      pincodes: ["506001", "506002", "506003", "506004", "506005"],
      zone: "Tier2",
    },
  ],

  // ============ Gujarat ============
  Gujarat: [
    {
      code: "AHMEDABAD",
      name: "Ahmedabad",
      pincodes: [
        "380001",
        "380002",
        "380003",
        "380004",
        "380005",
        "380006",
        "380007",
        "380008",
        "380009",
        "380010",
      ],
      zone: "Tier1",
    },
    {
      code: "SURAT",
      name: "Surat",
      pincodes: [
        "395001",
        "395002",
        "395003",
        "395004",
        "395005",
        "395006",
        "395007",
        "395008",
        "395009",
        "395010",
      ],
      zone: "Tier1",
    },
    {
      code: "VADODARA",
      name: "Vadodara",
      pincodes: [
        "390001",
        "390002",
        "390003",
        "390004",
        "390005",
        "390006",
        "390007",
        "390008",
        "390009",
        "390010",
      ],
      zone: "Tier1",
    },
    {
      code: "RAJKOT",
      name: "Rajkot",
      pincodes: ["360001", "360002", "360003", "360004", "360005"],
      zone: "Tier2",
    },
  ],

  // ============ Rajasthan ============
  Rajasthan: [
    {
      code: "JAIPUR",
      name: "Jaipur",
      pincodes: [
        "302001",
        "302002",
        "302003",
        "302004",
        "302005",
        "302006",
        "302007",
        "302008",
        "302009",
        "302010",
      ],
      zone: "Tier1",
    },
    {
      code: "JODHPUR",
      name: "Jodhpur",
      pincodes: ["342001", "342002", "342003", "342004", "342005"],
      zone: "Tier2",
    },
    {
      code: "KOTA",
      name: "Kota",
      pincodes: ["324001", "324002", "324003", "324004", "324005"],
      zone: "Tier2",
    },
    {
      code: "UDAIPUR",
      name: "Udaipur",
      pincodes: ["313001", "313002", "313003", "313004", "313005"],
      zone: "Tier2",
    },
  ],

  // ============ Uttar Pradesh ============
  "Uttar Pradesh": [
    {
      code: "LUCKNOW",
      name: "Lucknow",
      pincodes: [
        "226001",
        "226002",
        "226003",
        "226004",
        "226005",
        "226006",
        "226007",
        "226008",
        "226009",
        "226010",
      ],
      zone: "Tier1",
    },
    {
      code: "KANPUR",
      name: "Kanpur",
      pincodes: [
        "208001",
        "208002",
        "208003",
        "208004",
        "208005",
        "208006",
        "208007",
        "208008",
        "208009",
        "208010",
      ],
      zone: "Tier1",
    },
    {
      code: "GHAZIABAD",
      name: "Ghaziabad",
      pincodes: ["201001", "201002", "201003", "201004", "201005"],
      zone: "Tier1",
    },
    {
      code: "AGRA",
      name: "Agra",
      pincodes: ["282001", "282002", "282003", "282004", "282005"],
      zone: "Tier2",
    },
    {
      code: "VARANASI",
      name: "Varanasi",
      pincodes: ["221001", "221002", "221003", "221004", "221005"],
      zone: "Tier2",
    },
    {
      code: "MEERUT",
      name: "Meerut",
      pincodes: ["250001", "250002", "250003", "250004", "250005"],
      zone: "Tier2",
    },
    {
      code: "ALLAHABAD",
      name: "Prayagraj",
      pincodes: ["211001", "211002", "211003", "211004", "211005"],
      zone: "Tier2",
    },
    {
      code: "BAREILLY",
      name: "Bareilly",
      pincodes: ["243001", "243002", "243003", "243004", "243005"],
      zone: "Tier2",
    },
    {
      code: "NOIDA",
      name: "Noida",
      pincodes: ["201301", "201302", "201303", "201304", "201305"],
      zone: "Tier2",
    },
  ],

  // ============ Madhya Pradesh ============
  "Madhya Pradesh": [
    {
      code: "INDORE",
      name: "Indore",
      pincodes: [
        "452001",
        "452002",
        "452003",
        "452004",
        "452005",
        "452006",
        "452007",
        "452008",
        "452009",
        "452010",
      ],
      zone: "Tier1",
    },
    {
      code: "BHOPAL",
      name: "Bhopal",
      pincodes: [
        "462001",
        "462002",
        "462003",
        "462004",
        "462005",
        "462006",
        "462007",
        "462008",
        "462009",
        "462010",
      ],
      zone: "Tier1",
    },
    {
      code: "JABALPUR",
      name: "Jabalpur",
      pincodes: ["482001", "482002", "482003", "482004", "482005"],
      zone: "Tier2",
    },
    {
      code: "GWALIOR",
      name: "Gwalior",
      pincodes: ["474001", "474002", "474003", "474004", "474005"],
      zone: "Tier2",
    },
  ],

  // ============ Punjab ============
  Punjab: [
    {
      code: "LUDHIANA",
      name: "Ludhiana",
      pincodes: ["141001", "141002", "141003", "141004", "141005"],
      zone: "Tier2",
    },
    {
      code: "AMRITSAR",
      name: "Amritsar",
      pincodes: ["143001", "143002", "143003", "143004", "143005"],
      zone: "Tier2",
    },
    {
      code: "JALANDHAR",
      name: "Jalandhar",
      pincodes: ["144001", "144002", "144003", "144004", "144005"],
      zone: "Tier2",
    },
  ],

  // ============ Haryana ============
  Haryana: [
    {
      code: "GURGAON",
      name: "Gurgaon",
      pincodes: ["122001", "122002", "122003", "122004", "122005"],
      zone: "Tier2",
    },
    {
      code: "FARIDABAD",
      name: "Faridabad",
      pincodes: ["121001", "121002", "121003", "121004", "121005"],
      zone: "Tier2",
    },
  ],

  // ============ Kerala ============
  Kerala: [
    {
      code: "THIRUVANANTHAPURAM",
      name: "Thiruvananthapuram",
      pincodes: ["695001", "695002", "695003", "695004", "695005"],
      zone: "Tier2",
    },
    {
      code: "KOCHI",
      name: "Kochi",
      pincodes: ["682001", "682002", "682003", "682004", "682005"],
      zone: "Tier2",
    },
    {
      code: "KOZHIKODE",
      name: "Kozhikode",
      pincodes: ["673001", "673002", "673003", "673004", "673005"],
      zone: "Tier2",
    },
  ],

  // ============ Bihar ============
  Bihar: [
    {
      code: "PATNA",
      name: "Patna",
      pincodes: [
        "800001",
        "800002",
        "800003",
        "800004",
        "800005",
        "800006",
        "800007",
        "800008",
        "800009",
        "800010",
      ],
      zone: "Tier1",
    },
    {
      code: "GAYA",
      name: "Gaya",
      pincodes: ["823001", "823002", "823003", "823004", "823005"],
      zone: "Tier2",
    },
  ],

  // ============ Jharkhand ============
  Jharkhand: [
    {
      code: "RANCHI",
      name: "Ranchi",
      pincodes: ["834001", "834002", "834003", "834004", "834005"],
      zone: "Tier2",
    },
    {
      code: "JAMSHEDPUR",
      name: "Jamshedpur",
      pincodes: ["831001", "831002", "831003", "831004", "831005"],
      zone: "Tier2",
    },
    {
      code: "DHANBAD",
      name: "Dhanbad",
      pincodes: ["826001", "826002", "826003", "826004", "826005"],
      zone: "Tier2",
    },
  ],

  // ============ Odisha ============
  Odisha: [
    {
      code: "BHUBANESWAR",
      name: "Bhubaneswar",
      pincodes: ["751001", "751002", "751003", "751004", "751005"],
      zone: "Tier2",
    },
    {
      code: "CUTTACK",
      name: "Cuttack",
      pincodes: ["753001", "753002", "753003", "753004", "753005"],
      zone: "Tier2",
    },
  ],

  // ============ Andhra Pradesh ============
  "Andhra Pradesh": [
    {
      code: "VISAKHAPATNAM",
      name: "Visakhapatnam",
      pincodes: ["530001", "530002", "530003", "530004", "530005"],
      zone: "Tier1",
    },
    {
      code: "VIJAYAWADA",
      name: "Vijayawada",
      pincodes: ["520001", "520002", "520003", "520004", "520005"],
      zone: "Tier2",
    },
  ],

  // ============ Chhattisgarh ============
  Chhattisgarh: [
    {
      code: "RAIPUR",
      name: "Raipur",
      pincodes: ["492001", "492002", "492003", "492004", "492005"],
      zone: "Tier2",
    },
  ],

  // ============ Assam ============
  Assam: [
    {
      code: "GUWAHATI",
      name: "Guwahati",
      pincodes: ["781001", "781002", "781003", "781004", "781005"],
      zone: "Tier2",
    },
  ],

  // ============ Uttarakhand ============
  Uttarakhand: [
    {
      code: "DEHRADUN",
      name: "Dehradun",
      pincodes: ["248001", "248002", "248003", "248004", "248005"],
      zone: "Tier2",
    },
  ],

  // ============ Chandigarh ============
  Chandigarh: [
    {
      code: "CHANDIGARH",
      name: "Chandigarh",
      pincodes: ["160001", "160002", "160003", "160004", "160005"],
      zone: "Tier2",
    },
  ],

  // ============ Jammu and Kashmir ============
  "Jammu and Kashmir": [
    {
      code: "SRINAGAR",
      name: "Srinagar",
      pincodes: ["190001", "190002", "190003", "190004", "190005"],
      zone: "Tier2",
    },
    {
      code: "JAMMU",
      name: "Jammu",
      pincodes: ["180001", "180002", "180003", "180004", "180005"],
      zone: "Tier2",
    },
  ],
};

/**
 * Create reverse lookup: pincode → district
 */
export const pincodeToDistrict = {};
Object.entries(districtMapping).forEach(([state, districts]) => {
  districts.forEach((district) => {
    district.pincodes.forEach((pincode) => {
      pincodeToDistrict[pincode] = {
        code: district.code,
        name: district.name,
        state: state,
        zone: district.zone,
      };
    });
  });
});

/**
 * Get district info from pincode
 */
export function getDistrictFromPincode(pincode) {
  return pincodeToDistrict[pincode] || null;
}

/**
 * Get all districts for a state
 */
export function getDistrictsByState(state) {
  return districtMapping[state] || [];
}

/**
 * Get statistics
 */
export function getDistrictStats() {
  let totalDistricts = 0;
  let totalPincodes = 0;

  Object.values(districtMapping).forEach((districts) => {
    totalDistricts += districts.length;
    districts.forEach((district) => {
      totalPincodes += district.pincodes.length;
    });
  });

  return {
    states: Object.keys(districtMapping).length,
    districts: totalDistricts,
    pincodes: totalPincodes,
    avgPincodesPerDistrict: Math.round(totalPincodes / totalDistricts),
  };
}

export default districtMapping;
