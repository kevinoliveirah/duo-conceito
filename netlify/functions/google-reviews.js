const DEFAULT_PLACE_QUERY = 'Duo Conceito Moveis Planejados Sorocaba';
const DEFAULT_REVIEW_LIMIT = 3;
const MAX_REVIEW_LIMIT = 5;
const CACHE_SECONDS = 600;

function toInt(value, fallbackValue) {
    const parsed = Number.parseInt(String(value || ''), 10);
    return Number.isFinite(parsed) ? parsed : fallbackValue;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function jsonResponse(statusCode, payload) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}`
        },
        body: JSON.stringify(payload)
    };
}

async function fetchJson(url) {
    const response = await fetch(url);
    const data = await response.json().catch(() => ({}));
    return { response, data };
}

async function resolvePlaceId(apiKey, configuredPlaceId, query) {
    if (configuredPlaceId) return configuredPlaceId;

    const endpoint = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json');
    endpoint.searchParams.set('input', query);
    endpoint.searchParams.set('inputtype', 'textquery');
    endpoint.searchParams.set('fields', 'place_id');
    endpoint.searchParams.set('key', apiKey);

    const { data } = await fetchJson(endpoint.toString());
    const candidates = Array.isArray(data.candidates) ? data.candidates : [];
    if (!candidates.length || !candidates[0].place_id) return '';
    return candidates[0].place_id;
}

function normalizeReview(review) {
    if (!review || typeof review !== 'object') return null;

    return {
        author_name: typeof review.author_name === 'string' ? review.author_name : 'Cliente',
        rating: Number.isFinite(Number(review.rating)) ? Number(review.rating) : 5,
        text: typeof review.text === 'string' ? review.text : '',
        relative_time_description: typeof review.relative_time_description === 'string' ? review.relative_time_description : ''
    };
}

exports.handler = async function handler(event) {
    if (event && event.httpMethod && event.httpMethod !== 'GET') {
        return jsonResponse(405, { error: 'method_not_allowed' });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
        return jsonResponse(200, {
            configured: false,
            error: 'missing_google_places_api_key',
            reviews: []
        });
    }

    const requestedLimit = event && event.queryStringParameters ? event.queryStringParameters.limit : undefined;
    const limit = clamp(toInt(requestedLimit, DEFAULT_REVIEW_LIMIT), 1, MAX_REVIEW_LIMIT);
    const placeQuery = process.env.GOOGLE_PLACE_QUERY || DEFAULT_PLACE_QUERY;
    const configuredPlaceId = process.env.GOOGLE_PLACE_ID || '';

    try {
        const placeId = await resolvePlaceId(apiKey, configuredPlaceId, placeQuery);
        if (!placeId) {
            return jsonResponse(200, {
                configured: true,
                error: 'place_id_not_found',
                reviews: []
            });
        }

        const detailsEndpoint = new URL('https://maps.googleapis.com/maps/api/place/details/json');
        detailsEndpoint.searchParams.set('place_id', placeId);
        detailsEndpoint.searchParams.set('fields', 'name,rating,user_ratings_total,reviews,url');
        detailsEndpoint.searchParams.set('reviews_sort', 'newest');
        detailsEndpoint.searchParams.set('language', 'pt-BR');
        detailsEndpoint.searchParams.set('key', apiKey);

        const { data } = await fetchJson(detailsEndpoint.toString());
        if (data.status !== 'OK' || !data.result) {
            return jsonResponse(200, {
                configured: true,
                error: 'google_place_details_failed',
                google_status: data.status || 'unknown',
                reviews: []
            });
        }

        const sourceReviews = Array.isArray(data.result.reviews) ? data.result.reviews : [];
        const reviews = sourceReviews
            .slice(0, limit)
            .map(normalizeReview)
            .filter(Boolean);

        return jsonResponse(200, {
            configured: true,
            place_id: placeId,
            place_name: data.result.name || '',
            rating: Number.isFinite(Number(data.result.rating)) ? Number(data.result.rating) : null,
            total_reviews: Number.isFinite(Number(data.result.user_ratings_total))
                ? Number(data.result.user_ratings_total)
                : null,
            google_maps_url: typeof data.result.url === 'string' ? data.result.url : '',
            reviews
        });
    } catch (error) {
        return jsonResponse(200, {
            configured: true,
            error: 'reviews_fetch_exception',
            reviews: []
        });
    }
};
