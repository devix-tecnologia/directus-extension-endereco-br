import axios from 'axios';
import { Endereco } from '../utils/types';

export type GoogleMapsGeocodingResponse = {
    results: Array<{
        address_components: Array<{
            long_name: string;
            short_name: string;
            types: Array<string>;
        }>;
        formatted_address: string;
        geometry: {
            location: {
                lat: number;
                lng: number;
            };
            location_type: string;
            viewport: {
                northeast: {
                    lat: number;
                    lng: number;
                };
                southwest: {
                    lat: number;
                    lng: number;
                };
            };
        };
        place_id: string;
        plus_code: {
            compound_code: string;
            global_code: string;
        };
        types: Array<string>;
    }>;
    status: string;
};

export async function geocodingGoogle(input: Endereco, google_maps_auth_token: string) {
    if (typeof input.bairro !== 'object') {
        return undefined
    }
    const addressRequisicao = `${input.numero}+${input.logradouro},${input.bairro},${input.bairro.cidade.nome},${input.bairro.cidade.estado.sigla}`;
    const addressFormatado = addressRequisicao.replace(' ', '+');
    const geolocation = await axios.get<GoogleMapsGeocodingResponse>(
        'https://maps.googleapis.com/maps/api/geocode/json',
        {
            params: { address: addressFormatado, key: google_maps_auth_token },
        },
    );
    const coords = geolocation.data.results[0]?.geometry.location;
    return coords ? [coords.lng, coords.lat] : undefined;
}

type MapboxGeocodingResponse = {
    type: string;
    query: Array<string>;
    features: Array<{
        id: string;
        type: string;
        place_type: Array<string>;
        relevance: number;
        properties: {
            accuracy: string;
            'override:postcode': string;
            mapbox_id: string;
        };
        text: string;
        place_name: string;
        center: Array<number>;
        geometry: {
            type: string;
            coordinates: Array<number>;
        };
        address: string;
        context: Array<{
            id: string;
            mapbox_id: string;
            text: string;
            wikidata?: string;
            short_code?: string;
        }>;
    }>;
    attribution: string;
};

export async function geocodingMapbox(input: Endereco, mapbox_auth_token: string) {
    if (typeof input.bairro !== 'object') {
        return undefined
    }
    const addressRequisicao = `${input.logradouro} - ${input.bairro}, ${input.bairro.cidade.nome} - ${input.bairro.cidade.estado.sigla}, ${input.numero}`;
    const addressEncode = encodeURI(addressRequisicao);
    const endereco = `https://api.mapbox.com/geocoding/v5/mapbox.places/${addressEncode}.json`;
    const geolocation = await axios.get<MapboxGeocodingResponse>(endereco, {
        params: { limit: 1, access_token: mapbox_auth_token },
    });

    const coords = geolocation.data.features[0]?.center;

    return coords;

}