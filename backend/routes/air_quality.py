import os
import re

import requests
from flask import Blueprint, jsonify, request

air_quality_bp = Blueprint('air_quality', __name__)

WAQI_TOKEN = os.getenv('WAQI_TOKEN') or os.getenv('VITE_WAQI_TOKEN') or '3aae4bcf330896f9b401609544929c52654ef10a'
NOT_FOUND_MESSAGE = 'No air quality data found for this location. Try a nearby bigger city.'
CITY_ALIASES = [
    (re.compile(r'\bahemdabad\b', re.IGNORECASE), 'Ahmedabad'),
    (re.compile(r'\bahmadabad\b', re.IGNORECASE), 'Ahmedabad'),
    (re.compile(r'\bamdavad\b', re.IGNORECASE), 'Ahmedabad'),
    (re.compile(r'\bbaroda\b', re.IGNORECASE), 'Vadodara')
]


def normalize_city_name(city):
    normalized = city.strip()
    for pattern, replacement in CITY_ALIASES:
        normalized = pattern.sub(replacement, normalized)
    return normalized


def unique_values(values):
    seen = set()
    output = []
    for value in values:
        if value and value not in seen:
            seen.add(value)
            output.append(value)
    return output


def build_location_queries(city):
    normalized = normalize_city_name(city)
    lower = normalized.lower()

    if 'india' in lower:
        return [normalized]

    if 'gujarat' in lower:
        return unique_values([normalized, f'{normalized}, India'])

    return unique_values([
        f'{normalized}, India',
        f'{normalized}, Gujarat, India',
        f'{normalized}, Gujarat'
    ])


def fetch_nominatim_locations(query, limit=5):
    response = requests.get(
        'https://nominatim.openstreetmap.org/search',
        params={
            'q': query,
            'format': 'json',
            'limit': limit,
            'countrycodes': 'in',
            'addressdetails': 1
        },
        headers={'User-Agent': 'EcoSenseAI/1.0'},
        timeout=10
    )
    response.raise_for_status()
    data = response.json()
    return data if isinstance(data, list) else []


def is_gujarat_location(location):
    return 'gujarat' in (location.get('displayName') or '').lower()


def get_locations(city):
    normalized = normalize_city_name(city)
    seen = set()
    locations = []

    for query in build_location_queries(normalized):
        results = fetch_nominatim_locations(query)
        for result in results:
            if not result.get('lat') or not result.get('lon'):
                continue

            key = f'{result["lat"]},{result["lon"]}'
            if key in seen:
                continue

            seen.add(key)
            locations.append({
                'lat': float(result['lat']),
                'lon': float(result['lon']),
                'displayName': result.get('display_name'),
                'searchedName': normalized
            })

        place_name = normalized.split(',')[0].strip().lower()
        has_good_match = any(place_name in (item.get('displayName') or '').lower() for item in locations)
        if has_good_match:
            break

    lower_input = normalized.lower()
    if 'gujarat' in lower_input or ',' not in lower_input:
        locations.sort(key=is_gujarat_location, reverse=True)

    return locations


def get_location(city):
    locations = get_locations(city)
    return locations[0] if locations else None


def normalize_waqi_payload(payload, city, location):
    data = payload.get('data') or {}
    iaqi = data.get('iaqi') or {}
    station = data.get('city') or {}
    station_geo = station.get('geo') or [None, None]
    co = (iaqi.get('co') or {}).get('v', 0)

    return {
        'pm25': (iaqi.get('pm25') or {}).get('v', 0),
        'pm10': (iaqi.get('pm10') or {}).get('v', 0),
        'no2': (iaqi.get('no2') or {}).get('v', 0),
        'co': co,
        'co2': co,
        'aqi': data.get('aqi'),
        'lat': location['lat'],
        'lon': location['lon'],
        'cityName': city,
        'displayName': location.get('displayName'),
        'stationName': station.get('name'),
        'stationLat': station_geo[0],
        'stationLon': station_geo[1]
    }


@air_quality_bp.route('/airquality', methods=['GET'])
def get_air_quality():
    city = request.args.get('city', 'Delhi').strip()
    location = get_location(city)

    if not location:
        return jsonify({'city': city, 'data': None, 'message': 'City not found'}), 404

    response = requests.get(
        f'https://api.waqi.info/feed/geo:{location["lat"]};{location["lon"]}/',
        params={'token': WAQI_TOKEN},
        timeout=10
    )
    response.raise_for_status()
    payload = response.json()

    if payload.get('status') != 'ok':
        return jsonify({
            'city': city,
            'data': {
                'pm25': 0,
                'pm10': 0,
                'no2': 0,
                'co': 0,
                'co2': 0,
                'aqi': 0,
                'lat': location['lat'],
                'lon': location['lon'],
                'cityName': city,
                'displayName': location.get('displayName'),
                'stationName': 'No nearby monitoring station found',
                'locationOnly': True
            },
            'message': NOT_FOUND_MESSAGE
        })

    return jsonify({'city': city, 'data': normalize_waqi_payload(payload, city, location), 'source': 'waqi'})


@air_quality_bp.route('/airquality/search', methods=['GET'])
def search_air_quality_city():
    keyword = request.args.get('keyword', '').strip()

    if not keyword:
        return jsonify({'data': []})

    return jsonify({
        'data': [{
            'uid': f'nominatim-{location["lat"]}-{location["lon"]}',
            'cityName': location.get('displayName') or location.get('searchedName') or keyword,
            'displayName': location.get('displayName'),
            'lat': location['lat'],
            'lon': location['lon']
        } for location in get_locations(keyword)[:8]]
    })
