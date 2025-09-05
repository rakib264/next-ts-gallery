import GeonamesService from '@/lib/geonames';
// import OpenStreetMapService from '@/lib/openStreetMap'; // Commented out - using Geonames instead
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address') || '';
    const division = searchParams.get('division') || '';
    const district = searchParams.get('district') || '';
    const postal = searchParams.get('postal') || '';

    // For Geonames API, we primarily use postal code for geocoding
    if (!postal) {
      return NextResponse.json({ error: 'Postal code is required for geocoding' }, { status: 400 });
    }

    const geonamesService = new GeonamesService();

    // Use Geonames API to geocode by postal code
    const result = await geonamesService.geocodeByPostalCode(postal, 'BD');

    if (!result) {
      return NextResponse.json({ error: 'Could not geocode postal code' }, { status: 404 });
    }

    // Transform the result to match the expected format for the checkout page
    const transformedResult = {
      latitude: result.latitude,
      longitude: result.longitude,
      address: result.placeName,
      city: result.district,
      area: result.thanaOrUpazilaName,
      postCode: result.postalCode,
      // Additional Geonames-specific data
      divisionName: result.divisionName,
      district: result.district,
      thanaOrUpazilaName: result.thanaOrUpazilaName,
      placeName: result.placeName,
      countryCode: result.countryCode
    };

    return NextResponse.json(transformedResult);

    /* 
    // Commented out - OpenStreetMap implementation
    const geocoder = new OpenStreetMapService();

    // 1) Structured query first for higher accuracy
    const regionResult = await geocoder.geocodeStructured({
      street: address || undefined,
      city: district || undefined,
      state: division || undefined,
      postalcode: postal || undefined,
      countrycode: 'bd'
    });

    // 2) Fallback to free-form query combining fields
    let result = regionResult;
    if (!result) {
      const fullQuery = [address, district, division, postal].filter(Boolean).join(', ');
      if (fullQuery) {
        result = await geocoder.geocodeAddress(fullQuery);
      }
    }
    if (!result) {
      return NextResponse.json({ error: 'Could not geocode address' }, { status: 404 });
    }

    return NextResponse.json(result);
    */
  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json({ error: 'Failed to geocode address' }, { status: 500 });
  }
}