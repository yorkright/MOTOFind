export function normalizeString(value) {
  if (typeof value !== "string") {
    return null;
  }

  return value.trim().toLowerCase();
}

export function normalizeNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, "").trim());

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

export function filterCars(cars, filters = {}) {
  if (!Array.isArray(cars)) {
    return [];
  }

  const {
    query,
    name,
    model,
    brand,
    make,
    maxPrice,
    minPrice,
    currency: requestedCurrency,
    bodyType,
    fuelType,
    transmission,
    seats,
  } = filters;

  const searchQuery = normalizeString(query || name || model || brand || make);
  const normalizedMaxPrice = normalizeNumber(maxPrice);
  const normalizedMinPrice = normalizeNumber(minPrice);
  const normalizedBodyType = normalizeString(bodyType);
  const normalizedFuelType = normalizeString(fuelType);
  const normalizedTransmission = normalizeString(transmission);
  const normalizedSeats = normalizeNumber(seats);
  const normalizedCurrency = normalizeString(requestedCurrency);

  let results = [...cars];

  // -------------------------
  // NAME / MODEL / BRAND SEARCH
  // -------------------------
  if (searchQuery) {
    results = results.filter((car) => {
      const carName = normalizeString(car.name || car.model || "");
      const carBrand = normalizeString(car.brand || car.make || "");
      const fullCarTitle = `${carBrand} ${carName}`.trim();

      return (
        carName.includes(searchQuery) ||
        carBrand.includes(searchQuery) ||
        fullCarTitle.includes(searchQuery) ||
        searchQuery.includes(carName)
      );
    });
  }

  // -------------------------
  // CURRENCY
  // -------------------------
  if (normalizedCurrency) {
    results = results.filter(
      (car) => normalizeString(car.currency) === normalizedCurrency,
    );
  }

  // -------------------------
  // MAX PRICE
  // -------------------------
  if (normalizedMaxPrice !== null) {
    results = results.filter((car) => Number(car.price) <= normalizedMaxPrice);
  }

  // -------------------------
  // MIN PRICE
  // -------------------------
  if (normalizedMinPrice !== null) {
    results = results.filter((car) => Number(car.price) >= normalizedMinPrice);
  }

  // -------------------------
  // BODY TYPE
  // -------------------------
  if (normalizedBodyType) {
    results = results.filter((car) => {
      const carBody = normalizeString(car.bodyType || car.body_type);
      return carBody === normalizedBodyType;
    });
  }

  // -------------------------
  // FUEL TYPE
  // -------------------------
  if (normalizedFuelType) {
    results = results.filter((car) => {
      const carFuel = normalizeString(car.fuelType || car.fuel);
      return carFuel === normalizedFuelType;
    });
  }

  // -------------------------
  // TRANSMISSION
  // -------------------------
  if (normalizedTransmission) {
    results = results.filter((car) => {
      const carTrans = normalizeString(car.transmission);
      return carTrans === normalizedTransmission;
    });
  }

  // -------------------------
  // SEATS
  // -------------------------
  if (normalizedSeats !== null) {
    results = results.filter((car) => Number(car.seats) >= normalizedSeats);
  }

  return results;
}