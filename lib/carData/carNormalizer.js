/**
 * Converts a raw Carapis (or any future provider's) listing object into our
 * internal, provider-agnostic car shape. Nothing downstream of this file
 * should ever see a raw provider field name.
 *
 * Contract: if the source data doesn't provide a field, we return null for
 * it. We never invent values.
 */

function toNumberOrNull(value) {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function toStringOrNull(value) {
  if (value === undefined || value === null || value === "") return null;
  return String(value);
}

/**
 * @param {object} raw - a single item from Carapis's `results` array
 * @returns {object} normalized car
 */
export function normalizeCar(raw) {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  return {
    id: toStringOrNull(raw.id),

    brand: toStringOrNull(raw.make),
    model: toStringOrNull(raw.model),
    variant: toStringOrNull(raw.trim),

    price: toNumberOrNull(raw.price),
    currency: toStringOrNull(raw.currency),

    fuelType: toStringOrNull(raw.fuel_type),
    transmission: toStringOrNull(raw.transmission),

    // Carapis's documented listing object does not include body type or
    // seating capacity. We do NOT fabricate these — they stay null unless
    // a future provider (or a richer Carapis field we haven't seen) supplies
    // them.
    bodyType: toStringOrNull(raw.body_type ?? null),
    seats: toNumberOrNull(raw.seats ?? null),
    mileage: toNumberOrNull(raw.mileage),

    year: toNumberOrNull(raw.year),

    location: {
      city: toStringOrNull(raw.location),
      state: null, // not provided by the documented listing object
    },

    image: Array.isArray(raw.photos) && raw.photos.length > 0
      ? toStringOrNull(raw.photos[0])
      : null,
    images: Array.isArray(raw.photos) ? raw.photos.filter(Boolean) : [],

    url: toStringOrNull(raw.url),

    dealer: toStringOrNull(raw.dealer),

    // Extra fields Carapis sometimes includes; kept as-is, null if absent.
    inspectionSheet: raw.inspection_sheet ?? null,
    accidentHistory: Array.isArray(raw.accident_history) ? raw.accident_history : null,
    priceHistory: Array.isArray(raw.price_history) ? raw.price_history : null,

    source: toStringOrNull(raw.source),
  };
}

export function normalizeCars(rawList) {
  if (!Array.isArray(rawList)) return [];
  return rawList
    .map(normalizeCar)
    .filter((car) => car !== null && car.id !== null);
}