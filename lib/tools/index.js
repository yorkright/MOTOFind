import { searchCars } from "./searchCars";
import { getCarDetails } from "./getCarDeatils.js";
import { compareCars } from "./compareCars.js";
import { recommendCars } from "./recommendCars";
import { searchWebCars } from "./webSearchCars.js";

export const toolDeclarations = [

  // =====================================
  // SEARCH CARS
  // =====================================

  {
    name: "search_cars",

    description:
      "Search the car inventory based on user requirements such as budget, currency, body type, fuel type, transmission, and seating capacity. Use this tool whenever the user asks to find, search, or filter cars.",

    parameters: {
      type: "object",

      properties: {

        budget: {
          type: "string",

          description:
            "The user's original budget expression when available, such as '20 lakh', '₹15 lakh', '1 crore', '$20,000', or '20000 USD'. Preserve the user's original budget wording when possible.",
        },

        maxPrice: {
          type: "number",

          description:
            "Maximum numeric car price after converting the user's budget into the inventory currency's base unit. Example: 2000000 means 20 lakh INR.",
        },

        minPrice: {
          type: "number",

          description:
            "Minimum numeric car price after converting the user's budget into the inventory currency's base unit.",
        },

        currency: {
          type: "string",

          enum: ["INR", "USD"],

          description:
            "Currency specified or implied by the user. Use INR for rupees, lakh, lakhs, crore, ₹, or Indian pricing.",
        },

        bodyType: {
          type: "string",

          description:
            "Preferred body type such as SUV, Sedan, Hatchback, Coupe, or Pickup.",
        },

        fuelType: {
          type: "string",

          description:
            "Preferred fuel type such as Petrol, Diesel, Electric, CNG, or Hybrid.",
        },

        transmission: {
          type: "string",

          description:
            "Preferred transmission such as Automatic or Manual.",
        },

        seats: {
          type: "number",

          description:
            "Minimum number of seats required.",
        },

      },
    },
  },


  // =====================================
  // GET CAR DETAILS
  // =====================================

  {
    name: "get_car_details",

    description:
      "Get detailed information about one specific car from the inventory. Use this when the user asks for more information, specifications, price, fuel type, seating, mileage, or other details about a specific car.",

    parameters: {
      type: "object",

      properties: {

        carId: {
          type: "number",

          description:
            "The unique ID of the car.",
        },

      },

      required: ["carId"],
    },
  },


  // =====================================
  // COMPARE CARS
  // =====================================

  {
    name: "compare_cars",

    description:
      "Compare two to four cars from the inventory. Use this when the user explicitly asks to compare cars or wants to know which of several cars is better.",

    parameters: {
      type: "object",

      properties: {

        carIds: {
          type: "array",

          items: {
            type: "number",
          },

          description:
            "Array containing the unique IDs of the cars to compare.",
        },

      },

      required: ["carIds"],
    },
  },


  // =====================================
  // RECOMMEND CARS
  // =====================================

  {
    name: "recommend_cars",

    description:
      "Recommend the best matching cars based on the user's stated requirements. Apply hard requirements such as budget, body type, fuel type, transmission, and minimum seats first. Then rank the remaining cars using preferences such as mileage priority.",

    parameters: {
      type: "object",

      properties: {

        maxPrice: {
          type: "number",

          description:
            "Maximum acceptable car price in the inventory currency.",
        },

        bodyType: {
          type: "string",

          description:
            "Preferred body type such as SUV, Sedan, Hatchback, Coupe, or Pickup.",
        },

        fuelType: {
          type: "string",

          description:
            "Preferred fuel type such as Petrol, Diesel, Electric, CNG, or Hybrid.",
        },

        transmission: {
          type: "string",

          description:
            "Preferred transmission such as Automatic or Manual.",
        },

        seats: {
          type: "number",

          description:
            "Minimum number of seats required.",
        },

        mileagePriority: {
          type: "string",

          enum: ["low", "medium", "high"],

          description:
            "How important fuel efficiency or mileage is to the user. Use high when the user strongly prioritizes mileage or fuel economy.",
        },

      },
    },
  },

  // =====================================
  // SEARCH WEB CARS
  // =====================================
  {
    name: "search_web_cars",

    description:
      "Search the web for current and real-world information about cars, especially in the Indian automobile market. Use this tool when the user asks for latest prices, newly launched cars, current variants, recent specifications, availability, mileage, features, launch information, or information that may have changed over time. Do not use this tool for searching the local inventory unless current information is required.",

    parameters: {
      type: "object",

      properties: {

        query: {
          type: "string",

          description:
            "A clear and specific web search query about cars. Include the car name, brand, model, or information being requested whenever possible. Example: 'latest Tata Nexon price in India 2026'.",
        },

      },

      required: ["query"],
    },
  },

  
];


// =====================================
// TOOL EXECUTORS
// =====================================

export const toolExecutors = {

  search_cars: searchCars,

  search_web_cars: searchWebCars,

  get_car_details: getCarDetails,

  compare_cars: compareCars,

  recommend_cars: recommendCars,


};


