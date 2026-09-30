import { normalizeCurrency } from "../../lib/utils/currency";

/**
 * Convert an Indian budget unit into its numeric value.
 *
 * Examples:
 *
 * 20 lakh  -> 2,000,000
 * 15 lakh  -> 1,500,000
 * 1 crore  -> 10,000,000
 * 1.5 crore -> 15,000,000
 */
function convertIndianUnit(amount, unit) {
  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return null;
  }

  const normalizedUnit = String(unit || "")
    .trim()
    .toLowerCase();

  if (
    normalizedUnit === "lakh" ||
    normalizedUnit === "lakhs" ||
    normalizedUnit === "lac" ||
    normalizedUnit === "lacs" ||
    normalizedUnit === "l"
  ) {
    return value * 100000;
  }

  if (
    normalizedUnit === "crore" ||
    normalizedUnit === "crores" ||
    normalizedUnit === "cr"
  ) {
    return value * 10000000;
  }

  return value;
}


/**
 * Parse a budget expression.
 *
 * Examples:
 *
 * "20 lakh"
 * "20 lakhs"
 * "20L"
 * "₹20 lakh"
 * "15.5 lakh"
 * "1 crore"
 * "1.5 crore"
 * "2000000 INR"
 */
export function parseBudget(input, defaultCurrency = "INR") {
  if (typeof input !== "string") {
    return null;
  }

  const originalInput = input.trim();

  if (!originalInput) {
    return null;
  }

  const normalizedInput = originalInput
    .toLowerCase()
    .replace(/,/g, "")
    .replace(/₹/g, " inr ")
    .replace(/\$/g, " usd ")
    .replace(/\s+/g, " ")
    .trim();

  let currency = normalizeCurrency(defaultCurrency);

  if (
    normalizedInput.includes("inr") ||
    normalizedInput.includes("rupee") ||
    normalizedInput.includes("rupees")
  ) {
    currency = "INR";
  }

  if (
    normalizedInput.includes("usd") ||
    normalizedInput.includes("dollar") ||
    normalizedInput.includes("dollars")
  ) {
    currency = "USD";
  }

  /*
   * Match Indian units:
   *
   * 20 lakh
   * 20 lakhs
   * 20L
   * 1.5 crore
   * 1.5cr
   */
  const indianUnitMatch = normalizedInput.match(
    /(\d+(?:\.\d+)?)\s*(lakh|lakhs|lac|lacs|l|crore|crores|cr)\b/i
  );

  if (indianUnitMatch) {
    const amount = Number(indianUnitMatch[1]);
    const unit = indianUnitMatch[2];

    const convertedAmount = convertIndianUnit(
      amount,
      unit
    );

    if (convertedAmount === null) {
      return null;
    }

    return {
      amount: convertedAmount,
      currency: "INR",
      originalInput,
      unit,
    };
  }

  /*
   * Match a normal numeric amount.
   *
   * Examples:
   *
   * 2000000
   * 20,00,000
   * 20000 USD
   */
  const numericMatch = normalizedInput.match(
    /(\d+(?:\.\d+)?)/
  );

  if (!numericMatch) {
    return null;
  }

  const amount = Number(numericMatch[1]);

  if (!Number.isFinite(amount)) {
    return null;
  }

  return {
    amount,
    currency,
    originalInput,
    unit: null,
  };
}

