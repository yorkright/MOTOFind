import cars from "@/data/cars.json";

export async function compareCars({
  carIds,
}) {
  if (!Array.isArray(carIds)) {
    return {
      success: false,
      error: "carIds must be an array.",
    };
  }

  if (carIds.length < 2) {
    return {
      success: false,
      error:
        "At least two car IDs are required for comparison.",
    };
  }

  if (carIds.length > 4) {
    return {
      success: false,
      error:
        "A maximum of four cars can be compared at once.",
    };
  }

  const normalizedIds = carIds.map(Number);

  if (
    normalizedIds.some(
      (id) => !Number.isInteger(id)
    )
  ) {
    return {
      success: false,
      error:
        "All car IDs must be integers.",
    };
  }

  const matchedCars = cars.filter((car) =>
    normalizedIds.includes(Number(car.id))
  );

  if (matchedCars.length !== normalizedIds.length) {
    return {
      success: false,
      error:
        "One or more requested cars could not be found.",
    };
  }

  return {
    success: true,
    count: matchedCars.length,
    cars: matchedCars,
  };
}