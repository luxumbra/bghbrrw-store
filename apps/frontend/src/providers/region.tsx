"use client"
import { createContext, useContext, useEffect, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { sdk } from "@/lib/config"

type RegionContextType = {
  region?: HttpTypes.StoreRegion
  setRegion: React.Dispatch<React.SetStateAction<HttpTypes.StoreRegion | undefined>>
}
const RegionContext = createContext<RegionContextType | null>(null)

type RegionProviderProps = { children: React.ReactNode }

export const RegionProvider = ({ children }: RegionProviderProps) => {
  const [region, setRegion] = useState<HttpTypes.StoreRegion>()

  useEffect(() => {
    if (region) {
      localStorage.setItem("region_id", region.id)
      return
    }
    // Always fetch and set the first region (UK)
    sdk.store.region.list().then(({ regions }) => {
      setRegion(regions[0])
    })
  }, [region])

  return (
    <RegionContext.Provider value={{ region, setRegion }}>
      {children}
    </RegionContext.Provider>
  )
}

export const useRegion = () => {
  const context = useContext(RegionContext)
  if (!context) {
    throw new Error("useRegion must be used within a RegionProvider")
  }
  return context
}
