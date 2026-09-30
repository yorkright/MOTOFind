import { getCars } from "@/lib/carData/carProvider";
import { normalizeString } from "@/lib/utils/carFilters";

export async function getCarDetails({ carId, name, model, query }) {
  const cars = await getCars();

  if (!cars || cars.length === 0) {
    return {
      success: false,
      error: "No car data available.",
    };
  }

  // 1. Look up by numeric carId if provided
  if (carId !== undefined && carId !== null) {
    const numericId = Number(carId);
    if (Number.isInteger(numericId)) {
      const car = cars.find((item) => Number(item.id) === numericId);
      if (car) {
        return {
          success: true,
          car,
        };
      }
    }
  }

  // 2. Look up by car name/model query
  const targetName = normalizeString(name || model || query || carId);
  if (targetName) {
    const car = cars.find((item) => {
      const itemName = normalizeString(item.name || item.model || "");
      const itemBrand = normalizeString(item.brand || item.make || "");
      const fullTitle = `${itemBrand} ${itemName}`.trim();

      return (
        itemName.includes(targetName) ||
        itemBrand.includes(targetName) ||
        fullTitle.includes(targetName) ||
        targetName.includes(itemName)
      );
    });

    if (car) {
      return {
        success: true,
        car,
      };
    }
  }

  return {
    success: false,
    error: `No car found matching the provided identifier or query.`,
  };
}