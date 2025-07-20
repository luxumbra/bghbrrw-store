import { Icon } from "@iconify/react"

const shopWithConfidence: BenefitsBarProps['benefits'] = [
    {
        title: "Secure Checkout",
        description: "We use Stripe to process payments, so you can shop with confidence.",
        icon: "mdi:lock"
    },
    {
        title: "Free Shipping",
      description: "We offer free Tracked 48 shipping on all orders. Express upgrades available",
        icon: "mdi:truck"
    },
  {
    title: "100% Satisfaction Guarantee",
      description: "If you're not happy with your purchase, we'll refund you or replace it.",
    icon: "mdi:shield-check"
  }
]

const whyBoughAndBurrow: BenefitsBarProps['benefits'] = [
  {
    title: "Small Artisanal Business",
    description: "We're a small business that hand crafts products in the UK.",
    icon: "mdi:heart"
  },
  {
    title: "One of a kind products",
    description: "No two products are the same, each is unique and made with love.",
    icon: "mdi:heart"
  },
  {
    title: "Sustainable Materials",
    description: "All materials are sourced from sustainable sources, 90% from within a couple of miles of the studio.",
    icon: "mdi:heart"
  },
]


interface BenefitsBarProps {
  benefits: {
    title: string
    description: string
    icon: string
  }[]
}

const BenefitsBar: React.FC<BenefitsBarProps> = (props) => {
  const { benefits } = props
  return (
    <div className="p-4 rounded-lg shadow-md bg-ui-bg-secondary content-container">
      <ul className="grid grid-cols-3 gap-12 max-w-7xl mx-auto">
        {benefits &&
          benefits.map((b, i: number) => (
            <li className="">
              <div className="flex flex-col items-start gap-2">
                <div className="flex items-center justify-start gap-2 w-full">
                    <Icon icon={b.icon} width={48} height={48} />

                    <p className="text-2xl font-heading text-ui-text-primary">
                      {b.title}
                    </p>
                </div>

                <p className="text-lg text-ui-text-secondary">
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
