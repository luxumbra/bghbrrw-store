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
    icon: "mdi:shield-check"
  }
]

const whyBoughAndBurrow: BenefitsBarProps['benefits'] = [
  {
    title: "Artisan Crafted in the UK",
    description: "Each piece is lovingly handcrafted in our Devon studio, where passion for woodworking meets meticulous attention to detail.",
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
      <ul className="grid grid-cols-3 gap-12 mx-auto max-w-7xl">
        {benefits &&
          benefits.map((b, i: number) => (
            <li key={`${b.title}-${i}`} className="">
              <div className="flex flex-col items-start gap-2">
                <div className="flex items-center justify-start w-full gap-2">
                    <Icon icon={b.icon} width={48} height={48} className="text-primary" />

                    <h3 className="text-2xl font-heading capitalize text-primary">
                      {b.title}
                    </h3>
                </div>

                <p className="text-lg text-copy-color">
                  {b.description}
                </p>
              </div>
            </li>
          ))}
      </ul>
    </div>
  )
}
const benefitsData = {
    shopWithConfidence,
    whyBoughAndBurrow
}
export { BenefitsBar, benefitsData  }
export type { BenefitsBarProps }
