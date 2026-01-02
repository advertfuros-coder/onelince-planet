// lib/utils/geolocation.js

/**
 * Detect user's country and location using browser Geolocation API
 * Falls back to IP-based detection if geolocation is denied
 */

// Reverse geocoding using OpenStreetMap Nominatim (free, no API key needed)
async function getAddressFromCoords(latitude, longitude) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
    );
    const data = await response.json();

    const address = data.address || {};
    const countryCode = address.country_code?.toUpperCase();

    // Extract address components
    const city =
      address.city || address.town || address.village || address.suburb || "";
    const state = address.state || "";
    const postcode = address.postcode || "";
    const country = address.country || "";

    // Create formatted address
    const addressParts = [
      address.road || address.neighbourhood,
      address.suburb || address.city_district,
      city,
      state,
      postcode,
    ].filter(Boolean);

    const formattedAddress = addressParts.join(", ");

    // Map country codes to our supported countries
    let mappedCountry = "IN";
    if (countryCode === "IN") mappedCountry = "IN";
    if (countryCode === "AE") mappedCountry = "AE";

    return {
      country: mappedCountry,
      countryName: country,
      city,
      state,
      pincode: postcode,
      formattedAddress,
      latitude,
      longitude,
      fullData: data,
    };
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return {
      country: "IN",
      city: "",
      state: "",
      pincode: "",
      formattedAddress: "",
      latitude,
      longitude,
    };
  }
}

// IP-based geolocation using ipapi.co (free tier: 1000 requests/day)
async function getCountryFromIP() {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();

    const countryCode = data.country_code;

    // Map country codes to our supported countries
    if (countryCode === "IN") return "IN";
    if (countryCode === "AE") return "AE";

    // Default to India for other countries
    return "IN";
  } catch (error) {
    console.error("IP geolocation failed:", error);
    return "IN"; // Default fallback
  }
}

/**
 * Main function to detect user's location with full address details
 * 1. Checks localStorage first
 * 2. Tries browser geolocation (returns full address)
 * 3. Falls back to IP-based detection (country only)
 * 4. Defaults to India
 */
export async function detectUserLocation() {
  // Check if location is already saved
  const savedLocation = localStorage.getItem('userLocation')
  const savedPincode = localStorage.getItem('userPincode')
  const savedCountry = localStorage.getItem('userCountry')
  
  if (savedCountry && savedLocation) {
    return {
      country: savedCountry,
      city: savedLocation,
      pincode: savedPincode || '',
      formattedAddress: savedLocation
    }
  }

  // Try browser geolocation
  if (navigator.geolocation) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          maximumAge: 0,
          enableHighAccuracy: true
        })
      })

      const { latitude, longitude } = position.coords
      const locationData = await getAddressFromCoords(latitude, longitude)

      // Save to localStorage
      localStorage.setItem('userCountry', locationData.country)
      if (locationData.city) {
        localStorage.setItem('userLocation', locationData.city)
      }
      if (locationData.pincode) {
        localStorage.setItem('userPincode', locationData.pincode)
      }
      
      // Dispatch event for header to update
      window.dispatchEvent(new CustomEvent('locationUpdated', { 
        detail: locationData 
      }))

      return locationData
    } catch (error) {
      console.log('Geolocation denied or failed, trying IP-based detection...')
    }
  }

  // Fallback to IP-based detection (country only)
  try {
    const country = await getCountryFromIP()
    localStorage.setItem('userCountry', country)
    return {
      country,
      city: '',
      pincode: '',
      formattedAddress: ''
    }
  } catch (error) {
    console.error('All geolocation methods failed, defaulting to India')
    return {
      country: 'IN',
      city: '',
      pincode: '',
      formattedAddress: ''
    }
  }
}

// Keep backward compatibility
export async function detectUserCountry() {
  const location = await detectUserLocation()
  return location.country
}

/**
 * Request location permission with a user-friendly prompt
 */
export function requestLocationPermission(onSuccess, onDenied) {
  if (!navigator.geolocation) {
    console.log("Geolocation not supported");
    onDenied?.();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      onSuccess?.(position);
    },
    (error) => {
      console.log("Location permission denied:", error.message);
      onDenied?.();
    },
    {
      timeout: 5000,
      maximumAge: 0,
    }
  );
}
