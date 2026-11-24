/**
 * Image utilities for handling attraction photos and fallback images
 * Supports Google Places photo URLs with verified HTTP 200 Unsplash fallbacks
 * and an offline SVG data-URI ultimate fallback so no place ever lacks an image.
 */

// Verified HTTP 200 Unsplash fallback images organized by category
const UNSPLASH_FALLBACK_URLS = {
  beaches: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=400&h=220&fit=crop',
  ],
  food: [
    'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=220&fit=crop',
  ],
  shopping: [
    'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=220&fit=crop',
  ],
  nature: [
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=220&fit=crop',
  ],
  adventure: [
    'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400&h=220&fit=crop',
  ],
  cultural: [
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1548013146-72479768bada?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=400&h=220&fit=crop',
  ],
  wellness: [
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=220&fit=crop',
  ],
  nightlife: [
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=220&fit=crop',
  ],
  default: [
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=220&fit=crop',
  ],
};

// Ultimate offline-safe SVG data URI if network/Unsplash is unreachable
const ULTIMATE_SVG_FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="220" viewBox="0 0 400 220">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="#DBEAFE"/><stop offset="100%" stop-color="#EFF6FF"/>' +
      "</linearGradient></defs>" +
      '<rect width="400" height="220" fill="url(#g)"/>' +
      '<circle cx="315" cy="58" r="24" fill="#93C5FD" opacity="0.55"/>' +
      '<path d="M0 175 L110 105 L195 160 L275 95 L400 175 L400 220 L0 220 Z" fill="#60A5FA" opacity="0.35"/>' +
      '<path d="M0 190 L150 125 L245 175 L335 120 L400 180 L400 220 L0 220 Z" fill="#2563EB" opacity="0.25"/>' +
      "</svg>"
  );

/**
 * Simple hash function to deterministically select an image
 * based on the attraction name/ID for consistent fallback selection
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Get appropriate fallback image based on attraction category/type
 * Uses deterministic selection for consistency
 */
export function getAttractionFallbackImage(attraction = {}) {
  const rawTypes = [
    ...(Array.isArray(attraction.types) ? attraction.types : []),
    ...(Array.isArray(attraction.tags) ? attraction.tags : []),
  ];
  const types = rawTypes.map((t) => String(t).toLowerCase());
  const name = String(attraction.name || attraction.destination || '').toLowerCase();

  let category = 'default';

  if (
    types.some((t) => t.includes('beach') || t.includes('island') || t.includes('snorkeling') || t.includes('diving') || t.includes('water') || t.includes('aquarium')) ||
    name.includes('beach') || name.includes('island') || name.includes('lagoon') || name.includes('cove')
  ) {
    category = 'beaches';
  } else if (
    types.some((t) => t.includes('spa') || t.includes('wellness') || t.includes('hot spring') || t.includes('relaxation') || t.includes('resort')) ||
    name.includes('spa') || name.includes('wellness') || name.includes('spring')
  ) {
    category = 'wellness';
  } else if (
    types.some((t) => t.includes('bar') || t.includes('club') || t.includes('lounge') || t.includes('night')) ||
    name.includes('lounge') || name.includes('bar') || name.includes('club')
  ) {
    category = 'nightlife';
  } else if (
    types.some((t) => t.includes('restaurant') || t.includes('cafe') || t.includes('food')) ||
    name.includes('food') || name.includes('restaurant') || name.includes('cafe') || name.includes('grill')
  ) {
    category = 'food';
  } else if (
    types.some((t) => t.includes('shopping') || t.includes('market') || t.includes('boutique') || t.includes('store')) ||
    name.includes('mall') || name.includes('store') || name.includes('market')
  ) {
    category = 'shopping';
  } else if (
    types.some((t) => t.includes('museum') || t.includes('temple') || t.includes('monument') || t.includes('historical') || t.includes('art') || t.includes('church')) ||
    name.includes('cultural') || name.includes('museum') || name.includes('church') || name.includes('fort') || name.includes('heritage')
  ) {
    category = 'cultural';
  } else if (
    types.some((t) => t.includes('outdoor') || t.includes('activity') || t.includes('hiking') || t.includes('mountain') || t.includes('campground')) ||
    name.includes('trail') || name.includes('peak') || name.includes('mt.') || name.includes('mount') || name.includes('camp')
  ) {
    category = 'adventure';
  } else if (
    types.some((t) => t.includes('park') || t.includes('nature') || t.includes('wildlife') || t.includes('landscape') || t.includes('viewpoint') || t.includes('zoo')) ||
    name.includes('park') || name.includes('hills') || name.includes('falls') || name.includes('forest')
  ) {
    category = 'nature';
  }

  const urls = UNSPLASH_FALLBACK_URLS[category] || UNSPLASH_FALLBACK_URLS.default;
  const seedKey = String(attraction.id || attraction.name || attraction.destination || 'tripana');
  const hash = hashString(seedKey);
  return urls[hash % urls.length];
}

/**
 * Get attraction image URL with fallback support
 * Prefers Google Places photo URL if available, falls back to Unsplash
 */
export function getAttractionImageUrl(attraction = {}) {
  if (attraction?.photoUrl && typeof attraction.photoUrl === 'string' && attraction.photoUrl.trim().length > 0) {
    return attraction.photoUrl;
  }

  if (attraction?.image && typeof attraction.image === 'string' && attraction.image.trim().length > 0) {
    return attraction.image;
  }

  return getAttractionFallbackImage(attraction);
}

/**
 * Handle image load error - cascades from primary URL -> category Unsplash URL -> safe default Unsplash URL -> inline SVG
 */
export function handleImageError(event, attraction = {}) {
  const img = event?.target;
  if (!img) return;

  const fallbackStep = Number(img.dataset.fallbackStep || '0');

  if (fallbackStep === 0) {
    img.dataset.fallbackStep = '1';
    const categoryUrl = getAttractionFallbackImage(attraction);
    if (img.src !== categoryUrl) {
      img.src = categoryUrl;
      return;
    }
  }

  if (fallbackStep <= 1) {
    img.dataset.fallbackStep = '2';
    const safeUnsplash = UNSPLASH_FALLBACK_URLS.default[0];
    if (img.src !== safeUnsplash) {
      img.src = safeUnsplash;
      return;
    }
  }

  img.dataset.fallbackStep = '3';
  img.src = ULTIMATE_SVG_FALLBACK;
}
