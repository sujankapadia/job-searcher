import dotenv from "dotenv";

dotenv.config();

export const config = {
  rapidApiKey: process.env.RAPIDAPI_KEY || "",
  jsearchHost: "jsearch.p.rapidapi.com",
  jsearchBaseUrl: "https://jsearch.p.rapidapi.com",
  defaults: {
    location: "Philadelphia, PA",
    radius: 50,
    datePosted: "week" as const,
    numPages: 1,
  },
};

export function validateConfig(): void {
  if (!config.rapidApiKey || config.rapidApiKey === "your_key_here") {
    console.error(
      "Error: RAPIDAPI_KEY is not set. Add your key to .env file."
    );
    process.exit(1);
  }
}
