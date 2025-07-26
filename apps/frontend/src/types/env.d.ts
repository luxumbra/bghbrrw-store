declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SANITY_PROJECT_ID: string
    NEXT_PUBLIC_SANITY_DATASET: string
    SANITY_API_TOKEN?: string
    NEXT_PUBLIC_MEDUSA_BACKEND_URL: string
  }
}