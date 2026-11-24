/**
 * Image utilities for handling attraction photos and fallback images
 * Supports Google Places photo URLs with Unsplash fallbacks
 */

// Unsplash fallback images organized by category
const UNSPLASH_FALLBACK_URLS = {
  beaches: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1491496014055-e4835cdcd4c6?w=400&h=220&fit=crop',
  ],
  food: [
    'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1504674900967-9ef5e935696a?w=400&h=220&fit=crop',
  ],
  shopping: [
    'https://images.unsplash.com/photo-1555529927-febc91c00d9c?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=220&fit=crop',
  ],
  nature: [
    'https://images.unsplash.com/photo-1469022563149-aa64e87c3duncan?w=400&h=220&fit=crop',
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
    'https://images.unsplash.com/photo-1518925596868-8bae438d1c0e?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1523438097799-512a08b6a147?w=400&h=220&fit=crop',
  ],
  default: [
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1469022563149-aa64e87c3duncan?w=400&h=220&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=220&fit=crop',
  ],
};

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
export function getAttractionFallbackImage(attraction) {
  // Determine category from attraction types or name
  const types = attraction.types || [];
  const name = (attraction.name || '').toLowerCase();

  let category = 'default';

  if (types.some(t => t.toLowerCase().includes('beach'))) {
    category = 'beaches';
  } else if (
    types.some(t => t.toLowerCase().includes('restaurant')) ||
    types.some(t => t.toLowerCase().includes('cafe')) ||
    name.includes('food') || name.includes('restaurant')
  ) {
    category = 'food';
  } else if (
    types.some(t => t.toLowerCase().includes('shopping')) ||
    name.includes('mall') || name.includes('store')
  ) {
    category = 'shopping';
  } else if (
    types.some(t => t.toLowerCase().includes('park')) ||
    types.some(t => t.toLowerCase().includes('nature')) ||
    name.includes('park')
  ) {
    category = 'nature';
  } else if (
    types.some(t => t.toLowerCase().includes('museum')) ||
    types.some(t => t.toLowerCase().includes('temple')) ||
    types.some(t => t.toLowerCase().includes('monument')) ||
    name.includes('cultural')
  ) {
    category = 'cultural';
  } else if (
    types.some(t => t.toLowerCase().includes('outdoor')) ||
    types.some(t => t.toLowerCase().includes('activity'))
  ) {
    category = 'adventure';
  }

  const urls = UNSPLASH_FALLBACK_URLS[category] || UNSPLASH_FALLBACK_URLS.default;
  const hash = hashString(attraction.id || attraction.name || '');
  return urls[hash % urls.length];
}

/**
 * Get attraction image URL with fallback support
 * Prefers Google Places photo URL if available, falls back to Unsplash
 */
export function getAttractionImageUrl(attraction) {
  // Use Google Places photo URL if available
  if (attraction.photoUrl) {
    return attraction.photoUrl;
  }

  // Fallback to Unsplash images
  return getAttractionFallbackImage(attraction);
}

/**
 * Handle image load error - returns fallback URL
 */
export function handleImageError(event, attraction) {
  if (!event.target) return;

  const fallbackUrl = getAttractionFallbackImage(attraction);
  if (event.target.src !== fallbackUrl) {
    event.target.src = fallbackUrl;
  }
}
