"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import CountryInsightPanel from "./CountryInsightPanel"

const DottedMap = dynamic(() => import("./DottedMap"), {
  ssr: false,
  loading: () => <div className="w-full h-[560px] bg-[var(--ds-background-100)] animate-pulse rounded-md" />,
})

export default function MapContainer() {
  const [selectedCountry, setSelectedCountry] = useState<{
    code: string
    name: string
    requests: number
  } | null>(null)

  const handleCountryClick = (countryCode: string, countryName: string, requests: number) => {
    setSelectedCountry({ code: countryCode, name: countryName, requests })
  }

  const handleClosePanel = () => {
    setSelectedCountry(null)
  }

  return (
    <div className="space-y-4">
      <DottedMap onCountryClick={handleCountryClick} />

      {selectedCountry && (
        <CountryInsightPanel
          countryCode={selectedCountry.code}
          countryName={selectedCountry.name}
          requests={selectedCountry.requests}
          onClose={handleClosePanel}
        />
      )}
    </div>
  )
}
