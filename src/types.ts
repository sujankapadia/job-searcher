export interface SearchParams {
  query: string;
  location: string;
  radius?: number;
  datePosted?: "all" | "today" | "3days" | "week" | "month";
  employmentTypes?: string[];
  remoteOnly?: boolean;
  page?: number;
  numPages?: number;
}

export interface JobListing {
  jobId: string;
  title: string;
  company: string;
  companyWebsite: string | null;
  companyType: string | null;
  location: string;
  isRemote: boolean;
  description: string;
  applyLink: string;
  applyOptions: { publisher: string; link: string }[];
  postedAt: string;
  expiresAt: string | null;
  employmentType: string;
  source: string;
  minSalary: number | null;
  maxSalary: number | null;
  salaryCurrency: string | null;
  salaryPeriod: string | null;
  benefits: string[] | null;
  requiredSkills: string[] | null;
  requiredExperience: {
    months: number | null;
    noExperienceRequired: boolean;
  } | null;
  requiredEducation: {
    degree: string | null;
    degreeRequired: boolean;
  } | null;
  highlights: {
    qualifications: string[];
    responsibilities: string[];
    benefits: string[];
  } | null;
}

export interface SearchResult {
  query: string;
  location: string;
  searchedAt: string;
  totalResults: number;
  listings: JobListing[];
}

// Leads mode types

export interface LeadsParams {
  queries: string[];
  location: string;
  radius?: number;
  datePosted?: "all" | "today" | "3days" | "week" | "month";
  employmentTypes?: string[];
  remoteOnly?: boolean;
  format: "json" | "csv" | "both";
  outputDir: string;
}

export interface LeadRole {
  jobId: string;
  title: string;
  employmentType: string;
  location: string;
  isRemote: boolean;
  applyLink: string;
  postedAt: string;
  minSalary: number | null;
  maxSalary: number | null;
  salaryCurrency: string | null;
  salaryPeriod: string | null;
  sourceQuery: string;
}

export interface CompanyLead {
  company: string;
  companyWebsite: string | null;
  companyType: string | null;
  matchedQueries: string[];
  roles: LeadRole[];
  signalScore: number;
  signalReasons: string[];
}

export interface LeadsResult {
  queries: string[];
  location: string;
  searchedAt: string;
  totalLeads: number;
  totalRoles: number;
  apiRequestsUsed: number;
  leads: CompanyLead[];
}

// Raw JSearch API response types
export interface JSearchRawResponse {
  status: string;
  request_id: string;
  parameters: Record<string, unknown>;
  data: JSearchRawJob[];
}

export interface JSearchRawJob {
  job_id: string;
  employer_name: string;
  employer_logo: string | null;
  employer_website: string | null;
  employer_company_type: string | null;
  job_publisher: string;
  job_employment_type: string;
  job_title: string;
  job_apply_link: string;
  job_apply_is_direct: boolean;
  job_apply_quality_score: number;
  apply_options: { publisher: string; apply_link: string; is_direct: boolean }[];
  job_description: string;
  job_is_remote: boolean;
  job_posted_at_timestamp: number;
  job_posted_at_datetime_utc: string;
  job_city: string;
  job_state: string;
  job_country: string;
  job_latitude: number;
  job_longitude: number;
  job_benefits: string[] | null;
  job_google_link: string;
  job_offer_expiration_datetime_utc: string | null;
  job_offer_expiration_timestamp: number | null;
  job_required_experience: {
    no_experience_required: boolean;
    required_experience_in_months: number | null;
    experience_mentioned: boolean;
    experience_preferred: boolean;
  } | null;
  job_required_skills: string[] | null;
  job_required_education: {
    postgraduate_degree: boolean;
    professional_certification: boolean;
    high_school: boolean;
    associates_degree: boolean;
    bachelors_degree: boolean;
    degree_mentioned: boolean;
    degree_preferred: boolean;
    professional_certification_mentioned: boolean;
  } | null;
  job_experience_in_place_of_education: boolean;
  job_min_salary: number | null;
  job_max_salary: number | null;
  job_salary_currency: string | null;
  job_salary_period: string | null;
  job_highlights: {
    Qualifications?: string[];
    Responsibilities?: string[];
    Benefits?: string[];
  } | null;
  job_posting_language: string;
  job_onet_soc: string;
  job_onet_job_zone: string;
}
