export type CompanyInfo = {
  companyName: string;
  address: string;
  email: string;
  website: string;
  taxId: string;
};

const STORAGE_KEY = "ekaflow_company_info";

const defaultInfo: CompanyInfo = {
  companyName: "Your Company LLC",
  address: "123 Business St, City, Country",
  email: "hello@yourcompany.com",
  website: "www.yourcompany.com",
  taxId: "TAX-123456",
};

export function getCompanyInfo(): CompanyInfo {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as CompanyInfo;
    }
  } catch (err) {
    console.error("Failed to parse company info from localStorage", err);
  }
  return defaultInfo;
}

export function saveCompanyInfo(data: CompanyInfo): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save company info to localStorage", err);
  }
}
