import { formatPrice, normalizeCurrency } from "@/lib/utils/currency";
import { parseBudget } from "@/lib/utils/budget";
import {
  filterCars,
  normalizeNumber,
  normalizeString,
} from "@/lib/utils/carFilters";
import { getCars } from "@/lib/carData/carProvider";

export async function searchCars(filters = {}) {
  let maxPrice = normalizeNumber(filters.maxPrice);
  let minPrice = normalizeNumber(filters.minPrice);
  let requestedCurrency = normalizeCurrency(filters.currency);

  if (filters.budget) {
    const parsedBudget = parseBudget(filters.budget, requestedCurrency);

    console.log("[search_cars] Parsed budget:", parsedBudget);

    if (parsedBudget) {
      requestedCurrency = parsedBudget.currency;
      maxPrice = parsedBudget.amount;
    }
  }

  const bodyType = normalizeString(filters.bodyType);
  const fuelType = normalizeString(filters.fuelType);
  const transmission = normalizeString(filters.transmission);
  const seats = normalizeNumber(filters.seats);

  console.log("[search_cars] Received filters:", filters);
  console.log("[search_cars] Normalized filters:", {
    maxPrice,
    minPrice,
    requestedCurrency,
    bodyType,
    fuelType,
    transmission,
    seats,
  });

  const cars = await getCars();

  console.log("[search_cars] Total cars loaded:", cars?.length || 0);

  const results = filterCars(cars || [], {
    maxPrice,
    minPrice,
    currency: requestedCurrency,
    bodyType,
    fuelType,
    transmission,
    seats,
  });

  console.log(`[search_cars] Found ${results.length} matching cars.`);

  return {
    success: true,
    count: results.length,
    currency: requestedCurrency,
    cars: results,
    appliedFilters: {
      maxPrice,
      minPrice,
      currency: requestedCurrency,
      bodyType,
      fuelType,
      transmission,
      seats,
    },
    summary: {
      maxPrice:
        maxPrice !== null ? formatPrice(maxPrice, requestedCurrency) : null,
      minPrice:
        minPrice !== null ? formatPrice(minPrice, requestedCurrency) : null,
    },
  };
}