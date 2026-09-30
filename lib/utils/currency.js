const CURRENCY_CONFIG = {
    INR: {
        code: "INR",
        symbol: "₹",
        lakh: 100000,
        crore: 10000000,
    },

    USD: {
        code: "USD",
        symbol: "$",
        lakh: null,
        crore: null,
    },
};

export function normalizeCurrency(currency) {
    if (!currency || typeof currency !== "string") {
        return "INR";
    }

    const value = currency.trim().toUpperCase();

    if (value === "₹" || value === "RUPEE" || value === "RUPEES") {
        return "INR";
    }

    if (
        value === "$" ||
        value === "DOLLAR" ||
        value === "DOLLARS"
    ) {
        return "USD";
    }

    if (value === "INR" || value === "USD") {
        return value;
    }

    return "INR";
}

export function convertIndianAmount(value, unit) {
    const amount = Number(value);

    if (!Number.isFinite(amount)) {
        return null;
    }

    const normalizedUnit = String(unit || "")
        .trim()
        .toLowerCase();

    if (
        normalizedUnit === "lakh" ||
        normalizedUnit === "lakhs"
    ) {
        return amount * 100000;
    }

    if (
        normalizedUnit === "crore" ||
        normalizedUnit === "crores"
    ) {
        return amount * 10000000;
    }

    return amount;
}

export function formatPrice(amount, currency = "INR") {
    const normalizedCurrency = normalizeCurrency(currency);

    return new Intl.NumberFormat(
        normalizedCurrency === "INR"  ? "en-IN" : "en-US",
        {
            style: "currency",
            currency: normalizedCurrency,
            maximumFractionDigits: 0,
        }
    ).format(amount);
}

export { CURRENCY_CONFIG };
