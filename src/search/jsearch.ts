import { config } from "../config.js";
import type {
  SearchParams,
  JobListing,
  SearchResult,
  JSearchRawResponse,
  JSearchRawJob,
} from "../types.js";

function buildQueryParams(params: SearchParams): URLSearchParams {
  const qp = new URLSearchParams();

  qp.set("query", `${params.query} in ${params.location}`);
  qp.set("page", String(params.page ?? 1));
  qp.set("num_pages", String(params.numPages ?? config.defaults.numPages));

  if (params.datePosted && params.datePosted !== "all") {
    qp.set("date_posted", params.datePosted);
  }

  if (params.remoteOnly) {
    qp.set("remote_jobs_only", "true");
  }

  if (params.employmentTypes && params.employmentTypes.length > 0) {
    qp.set("employment_types", params.employmentTypes.join(","));
  }

  if (params.radius) {
    qp.set("radius", String(params.radius));
  }

  return qp;
}

function deriveEducationLevel(
  edu: JSearchRawJob["job_required_education"]
): string | null {
  if (!edu) return null;
  if (edu.postgraduate_degree) return "Postgraduate";
  if (edu.bachelors_degree) return "Bachelor's";
  if (edu.associates_degree) return "Associate's";
  if (edu.high_school) return "High School";
  if (edu.professional_certification) return "Professional Certification";
  return null;
}

function mapJob(raw: JSearchRawJob): JobListing {
  const city = raw.job_city || "";
  const state = raw.job_state || "";
  const locationParts = [city, state].filter(Boolean);

  return {
    jobId: raw.job_id,
    title: raw.job_title,
    company: raw.employer_name,
    companyWebsite: raw.employer_website,
    companyType: raw.employer_company_type,
    location: locationParts.join(", "),
    isRemote: raw.job_is_remote,
    description: raw.job_description,
    applyLink: raw.job_apply_link,
    applyOptions: (raw.apply_options || []).map((opt) => ({
      publisher: opt.publisher,
      link: opt.apply_link,
    })),
    postedAt: raw.job_posted_at_datetime_utc,
    expiresAt: raw.job_offer_expiration_datetime_utc,
    employmentType: raw.job_employment_type || "UNKNOWN",
    source: raw.job_publisher,
    minSalary: raw.job_min_salary,
    maxSalary: raw.job_max_salary,
    salaryCurrency: raw.job_salary_currency,
    salaryPeriod: raw.job_salary_period,
    benefits: raw.job_benefits,
    requiredSkills: raw.job_required_skills,
    requiredExperience: raw.job_required_experience
      ? {
          months: raw.job_required_experience.required_experience_in_months,
          noExperienceRequired:
            raw.job_required_experience.no_experience_required,
        }
      : null,
    requiredEducation: raw.job_required_education
      ? {
          degree: deriveEducationLevel(raw.job_required_education),
          degreeRequired:
            raw.job_required_education.degree_mentioned &&
            !raw.job_required_education.degree_preferred,
        }
      : null,
    highlights: raw.job_highlights
      ? {
          qualifications: raw.job_highlights.Qualifications || [],
          responsibilities: raw.job_highlights.Responsibilities || [],
          benefits: raw.job_highlights.Benefits || [],
        }
      : null,
  };
}

export async function searchJobs(
  params: SearchParams
): Promise<SearchResult> {
  const queryParams = buildQueryParams(params);
  const url = `${config.jsearchBaseUrl}/search?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": config.rapidApiKey,
      "X-RapidAPI-Host": config.jsearchHost,
    },
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Try again later or upgrade your plan.");
    }
    if (response.status === 403) {
      throw new Error("Authentication failed. Check your RAPIDAPI_KEY in .env.");
    }
    const body = await response.text();
    throw new Error(`JSearch API error (${response.status}): ${body}`);
  }

  const raw: JSearchRawResponse = await response.json();

  if (raw.status !== "OK") {
    throw new Error(`JSearch API returned status: ${raw.status}`);
  }

  const listings = (raw.data || []).map(mapJob);

  return {
    query: params.query,
    location: params.location,
    searchedAt: new Date().toISOString(),
    totalResults: listings.length,
    listings,
  };
}
