import { Modules } from "@medusajs/framework/utils"

export const sdk = {
  client: {
    fetch: async (url: string, options?: RequestInit) => {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return response.json()
    }
  }
}