export const majorCities = [
  { name: 'Delhi', country: 'India', lat: 28.7041, lng: 77.1025, pm25: 145, pm10: 210, no2: 65, co2: 420 },
  { name: 'Mumbai', country: 'India', lat: 19.076, lng: 72.8777, pm25: 89, pm10: 130, no2: 45, co2: 390 },
  { name: 'Ahmedabad', country: 'India', lat: 23.0225, lng: 72.5714, pm25: 110, pm10: 165, no2: 55, co2: 405 },
  { name: 'Chennai', country: 'India', lat: 13.0827, lng: 80.2707, pm25: 95, pm10: 150, no2: 52, co2: 400 },
  { name: 'Kolkata', country: 'India', lat: 22.5726, lng: 88.3639, pm25: 120, pm10: 175, no2: 60, co2: 410 },
  { name: 'Bangalore', country: 'India', lat: 12.9716, lng: 77.5946, pm25: 85, pm10: 120, no2: 40, co2: 385 },
  { name: 'Hyderabad', country: 'India', lat: 17.385, lng: 78.4867, pm25: 92, pm10: 135, no2: 48, co2: 392 },
  { name: 'Pune', country: 'India', lat: 18.5204, lng: 73.8567, pm25: 78, pm10: 110, no2: 38, co2: 380 }
];

export const searchCities = [
  ...majorCities,
  { name: 'Goa', country: 'India', lat: 15.2993, lng: 74.1240, pm25: 78, pm10: 95, no2: 30, co2: 380 }
];

export function getStatus(value) {
  if (value <= 75) return 'good';
  if (value <= 150) return 'moderate';
  return 'bad';
}

export function getStatusLabel(value) {
  if (value <= 75) return 'Good';
  if (value <= 150) return 'Moderate';
  return 'Poor';
}

export function getCityTips(pm25) {
  if (pm25 <= 75) {
    return [
      'Air quality is healthy, continue using public transport and green spaces.',
      'Keep dust control measures in place around construction and roadwork.'
    ];
  }
  if (pm25 <= 150) {
    return [
      'Limit outdoor activities during peak traffic hours.',
      'Use air purifiers indoors and keep windows closed on high pollution days.'
    ];
  }
  return [
    'Avoid strenuous outdoor exercise and keep windows closed.',
    'Reduce vehicle use, carpool, or choose public transit whenever possible.'
  ];
}
