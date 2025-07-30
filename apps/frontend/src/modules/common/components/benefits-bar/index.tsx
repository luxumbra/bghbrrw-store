import { Icon } from "@iconify/react"

const shopWithConfidence: BenefitsBarProps['benefits'] = [
    {
        title: "Secure & Simple Checkout",
        description: "Shop with peace of mind using our secure Stripe payment system, trusted by millions worldwide.",
        icon: "mdi:lock"
    },
    {
        title: "Free UK Delivery",
      description: "Enjoy free Tracked 48 delivery on all UK orders, with optional express shipping available.",
        icon: "mdi:truck"
    },
  {
    title: "Happiness Guaranteed",
      description: "Love your piece or we'll make it right - full refund or replacement, no questions asked.",
    icon: "ph:smiley-duotone"
  }
]

const whyBoughAndBurrow: BenefitsBarProps['benefits'] = [
  {
    title: "Artisan Crafted in the UK",
    description: "Each piece is lovingly handcrafted in our Cotswold studio, where passion for woodworking meets meticulous attention to detail.",
    icon: "mdi:hand-heart"
  },
  {
    title: "Uniquely Natural",
    description: "Nature's beauty shines through in every piece - each item tells its own story through unique grain patterns and natural character.",
    icon: "mdi:star-four-points"
  },
  {
    title: "Locally Sourced Wood",
    description: "We carefully select sustainable wood from within miles of our studio, giving new life to storm-fallen and reclaimed timber.",
    icon: "ph:tree-duotone"
  },
]


interface BenefitsBarProps {
  benefits: {
    title: string
    description: string
    icon: string
  }[]
  borderless?: boolean
}

const BenefitsBar: React.FC<BenefitsBarProps> = (props) => {
  const { benefits, borderless } = props
  return (
    <div className={`p-4 bg-ui-bg-secondary content-container ${borderless ? "" : "border-t-2 border-ui-border-base border-b-2 py-12"} w-screen`}>
      <ul className="grid grid-cols-1 gap-12 mx-auto xl:grid-cols-3 xl:max-w-7xl">
        {benefits &&
          benefits.map((b, i: number) => (
            <li key={`${b.title}-${i}`} className="">
              <div className="flex flex-col items-start gap-2">
                <div className="flex items-center justify-start w-full gap-2">
                    <Icon icon={b.icon} width={48} height={48} className="w-6 h-6 text-primary lg:w-12 lg:h-12" />

                    <h3 className="text-xl capitalize lg:text-2xl font-heading text-primary">
                      {b.title}
                    </h3>
                </div>

                <p className="text-base lg:text-lg text-copy-color/80">
                  {b.description}
                </p>
              </div>
            </li>
          ))}
      </ul>
    </div>
  )
}

const BenefitsList: React.FC<BenefitsBarProps> = (props) => {
  const { benefits } = props
  return (
    <ul className="grid w-full grid-cols-1 gap-6">
      {benefits && benefits.map((b, i: number) => (
        <li key={`${b.title}-${i}`} className="">
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-center justify-start w-full gap-2">
              <Icon icon={b.icon} width={28} height={28} className="w-5 h-5 text-copy-color lg:h-7 lg:w-7" />
              <h3 className="text-xl capitalize font-heading text-copy-color">
                {b.title}
              </h3>
            </div>
            <p className="text-base text-copy-color/80">
              {b.description}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}

const benefitsData = {
    shopWithConfidence,
    whyBoughAndBurrow
}
export { BenefitsBar, BenefitsList, benefitsData  }
export type { BenefitsBarProps }
