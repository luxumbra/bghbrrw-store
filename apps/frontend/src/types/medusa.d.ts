import { StoreProductParams } from "@medusajs/types"

declare module "@medusajs/types" {
  interface StoreProductParams {
    collection_id?: string
  }
}