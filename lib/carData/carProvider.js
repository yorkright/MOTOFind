import fs from "fs/promises";
import path from "path";

export async function getCars(filters = {}) {
  const params = new URLSearchParams();

  if (filters.bodyType) {
    params.set("body_type", filters.bodyType);
  }

  if (filters.maxPrice != null) {
    params.set("max_price", String(filters.maxPrice));
  }

  if (filters.minPrice != null) {
    params.set("min_price", String(filters.minPrice));
  }

  if (filters.fuelType) {
    params.set("fuel", filters.fuelType);
  }

  if (filters.transmission) {
    params.set("transmission", filters.transmission);
  }

  params.set("limit", "50");

  try {
    const rootDir = process.cwd();
    let filePath = path.join(rootDir, "data", "car.json");

    let fileContent;
    try {
      fileContent = await fs.readFile(filePath, "utf-8");
    } catch {
      // Fallback in case the file is named cars.json (plural)
      filePath = path.join(rootDir, "data", "cars.json");
      fileContent = await fs.readFile(filePath, "utf-8");
    }

    const carsData = JSON.parse(fileContent);

    // If carsData is a raw array: [ {...}, {...} ]
    if (Array.isArray(carsData)) {
      return carsData;
    }

    // If carsData is wrapped inside an object: { cars: [...] } or { data: [...] }
    if (carsData && Array.isArray(carsData.cars)) {
      return carsData.cars;
    }

    if (carsData && Array.isArray(carsData.data)) {
      return carsData.data;
    }

    return [];
  } catch (error) {
    console.error("[getCars] Error loading car data from filesystem:", error);
    return [];
  }
}