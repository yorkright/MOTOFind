import cars from "@/data/cars.json";
import {
    normalizeNumber,
    normalizeString,
} from "@/lib/utils/carFilters";

function calculateScore(car, preferences) {
    let score = 0;

    const maxPrice = normalizeNumber(preferences.maxPrice);
    const preferredFuel = normalizeString(preferences.fuelType);
    const preferredTransmission = normalizeString(
        preferences.transmission
    );
    const preferredBodyType = normalizeString(
        preferences.bodyType
    );
    const requiredSeats = normalizeNumber(preferences.seats);
    const mileagePriority = normalizeString(
        preferences.mileagePriority
    );

    if (mileagePriority === "high") {
        if (car.mileage >= 15) {
            score += 20;
        } else if (car.mileage >= 12) {
            score += 10;
        }
    }

    /*
     * Budget
     */

    if (maxPrice !== null) {
        if (car.price <= maxPrice) {
            score += 30;
        } else {
            score -= 30;
        }
    }

    /*
     * Body type
     */

    if (
        preferredBodyType &&
        normalizeString(car.bodyType) === preferredBodyType
    ) {
        score += 25;
    }

    /*
     * Transmission
     */

    if (
        preferredTransmission &&
        normalizeString(car.transmission) ===
        preferredTransmission
    ) {
        score += 15;
    }

    /*
     * Fuel type
     */

    if (
        preferredFuel &&
        normalizeString(car.fuelType) === preferredFuel
    ) {
        score += 15;
    }

    /*
     * Seating
     */

    if (
        requiredSeats !== null &&
        car.seats >= requiredSeats
    ) {
        score += 15;
    }

    return score;
}

export async function recommendCars(
    preferences = {}
) {
    let candidates = [...cars];

    const bodyType = normalizeString(preferences.bodyType);
    const fuelType = normalizeString(preferences.fuelType);
    const transmission = normalizeString(preferences.transmission);
    const maxPrice = normalizeNumber(preferences.maxPrice);
    const seats = normalizeNumber(preferences.seats);

    /*
     * First apply hard filters.
     */

    if (bodyType) {
        candidates = candidates.filter(
            (car) =>
                normalizeString(car.bodyType) === bodyType
        );
    }

    if (fuelType) {
        candidates = candidates.filter(
            (car) =>
                normalizeString(car.fuelType) === fuelType
        );
    }

    if (transmission) {
        candidates = candidates.filter(
            (car) =>
                normalizeString(car.transmission) ===
                transmission
        );
    }

    if (maxPrice !== null) {
        candidates = candidates.filter(
            (car) => car.price <= maxPrice
        );
    }

    if (seats !== null) {
        candidates = candidates.filter(
            (car) => car.seats >= seats
        );
    }

    /*
     * Then calculate recommendation scores.
     */

    const rankedCars = candidates
        .map((car) => ({
            ...car,
            recommendationScore:
                calculateScore(car, preferences),
        }))
        .sort(
            (a, b) =>
                b.recommendationScore -
                a.recommendationScore
        );

    return {
        success: true,
        count: rankedCars.length,
        cars: rankedCars.slice(0, 5),
        appliedPreferences: {
            bodyType,
            fuelType,
            transmission,
            maxPrice,
            seats,
        },
    };
}