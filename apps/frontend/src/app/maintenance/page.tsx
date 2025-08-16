import { BrandHeading } from "@/modules/common/components/brand-heading"
import { Icon } from "@iconify/react"
import type { Metadata } from "next"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Maintenance | Bough & Burrow",
  description: "Bough & Burrow is currently undergoing maintenance. We'll be back soon!",
  robots: "noindex, nofollow",
}

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
        <BrandHeading size="xlarge" showLogo showText={false} />
        </div>

        {/* Maintenance Message */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-heading text-primarymb-4">
            We're launching soon
          </h2>
          <p className="text-body text-zinc-500 text-lg mb-6 leading-relaxed">
            The Bough & Burrow shop will be open for business very soon! We're working hard to bring you a fantastic shopping experience with a new website and a blog where I'll be posting about the products, the process, and the inspiration behind them among other subjects close to the heart of The Burrow.
          </p>
          <p className="text-zinc-500 mb-8">
            We expect to be launching any day now. In the meantime, you can check out our Etsy shop at <a href="https://boughandburrowstudio.etsy.com" className="text-zinc-600 hover:text-zinc-400 transition-colors">boughandburrowstudio.etsy.com</a>.
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 mb-8 border border-zinc-700">
          <h3 className="text-xl font-heading mb-4">
            Need to reach us?
          </h3>
          <p className="text-zinc-400 mb-2">
            You can reach us via our Facebook page or our email:
          </p>
          <p className="flex items-center justify-center gap-2">
          <Icon icon="mdi:facebook" width={24} height={24} /> <a href="https://www.facebook.com/boughandburrow.uk">boughandburrow.uk</a>
            <Icon icon="mdi:email" width={24} height={24} /> hello at boughandburrow.uk
            </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="w-64 h-2 bg-stone-200 rounded-full mx-auto mb-2">
            <div className="w-3/4 h-full bg-stone-600 rounded-full animate-pulse"></div>
          </div>
          <p className="text-stone-500 text-sm">Almost ready...</p>
        </div>

        {/* Footer */}
        <footer className="text-stone-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Bough & Burrow. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}