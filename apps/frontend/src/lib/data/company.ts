import { sdk } from "@lib/config"
import { getCacheOptions } from "./cookies"

export interface CompanyInfo {
  name: string
  email: string
  location?: {
    name: string
    address: {
      address_1?: string
      city?: string
      country_code?: string
      postal_code?: string
      province?: string
    }
  }
}

export const getCompanyInfo = async (): Promise<CompanyInfo> => {
  const next = {
    ...(await getCacheOptions("company-info")),
  }

  return sdk.client
    .fetch<{ company: CompanyInfo }>("/store/company-info", {
      next,
      cache: "force-cache",
    })
    .then(({ company }) => company)
}