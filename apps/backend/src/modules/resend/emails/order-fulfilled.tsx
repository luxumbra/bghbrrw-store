import {
  Text,
  Column,
  Container,
  Heading,
  Html,
  Img,
  Row,
  Section,
  Tailwind,
  Head,
  Preview,
  Body,
  Link,
} from "@react-email/components";
import {
  BigNumberValue,
  CustomerDTO,
  OrderDTO,
  FulfillmentDTO,
} from "@medusajs/framework/types";
import { EmailHeader, EmailHeading, EmailTailwind } from "./shared";
import { CustomerEmailFooter } from "./shared/email-footer";

type OrderFulfilledEmailProps = {
  fulfillment: FulfillmentDTO;
  order: OrderDTO;
  email_banner?: {
    body: string;
    title: string;
    url: string;
  };
};

function OrderFulfilledEmailComponent({
  fulfillment,
  order,
  email_banner,
}: OrderFulfilledEmailProps) {
    const shouldDisplayBanner = email_banner && "title" in email_banner;
  const formatPrice = (price: BigNumberValue) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: order.currency_code.toUpperCase(),
    }).format(Number(price));
  };

  return (
    <EmailTailwind>
      <Html className="font-sans bg-secondary-background">
        <Head />
        <Preview>
          Your order #{`${order.display_id}`} has been fulfilled and is ready for shipping!
        </Preview>
        <Body className="w-full max-w-2xl mx-auto my-10 bg-primary-background">
          {/* Header */}
          <EmailHeader />

          {/* Main Content */}
          <Container className="p-6">
            <EmailHeading>
              📦 Your order has been fulfilled, {order.billing_address?.first_name}!
            </EmailHeading>
            <Section>
              <Text className="mt-4 text-center text-[#A8B0A3]">
                Great news! Your order #{order.display_id} has been fulfilled and is now being prepared for shipping.
              </Text>
              <Text className="mt-4 text-center text-[#A8B0A3]">
                We're carefully packaging your handmade wooden items and will ship them to you soon.
              </Text>
            </Section>

            {/* Order Details */}
            <Section className="mt-8">
              <Heading as="h2" className="mb-4 text-xl font-semibold text-center">
                Order Details
              </Heading>
              <Row>
                <Column>
                  <Text className="text-[#A8B0A3]">
                    <strong>Order Number:</strong> #{order.display_id}
                  </Text>
                  <Text className="text-[#A8B0A3]">
                    <strong>Total:</strong> {formatPrice(order.total)}
                  </Text>
                  <Text className="text-[#A8B0A3]">
                    <strong>Shipping Address:</strong>
                  </Text>
                  <Text className="text-[#A8B0A3] ml-4">
                    {order.shipping_address?.first_name} {order.shipping_address?.last_name}
                    <br />
                    {order.shipping_address?.address_1}
                    {order.shipping_address?.address_2 && (
                      <>
                        <br />
                        {order.shipping_address.address_2}
                      </>
                    )}
                    <br />
                    {order.shipping_address?.city}, {order.shipping_address?.postal_code}
                    <br />
                    {order.shipping_address?.country_code?.toUpperCase()}
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Next Steps */}
            <Section className="mt-8">
              <Heading as="h2" className="mb-4 text-xl font-semibold text-center">
                What's Next?
              </Heading>
              <Text className="text-[#A8B0A3] text-center">
                We'll send you another email with tracking information once your order ships.
                You can also check your order status anytime in your account.
              </Text>
            </Section>
          </Container>

          {/* Promotional Banner */}
          {shouldDisplayBanner && email_banner && (
            <Section className="mt-8">
              <Container className="bg-[#F5F5F5] p-6 rounded-lg">
                <Row>
                  <Column>
                    <Heading as="h3" className="mb-2 text-lg font-semibold text-center">
                      {email_banner.title}
                    </Heading>
                    <Text className="text-center text-[#A8B0A3] mb-4">
                      {email_banner.body}
                    </Text>
                    <Row>
                      <Column className="text-center">
                        <Link
                          href={email_banner.url}
                          className="bg-[#8B9A47] text-white px-6 py-3 rounded-lg inline-block no-underline"
                        >
                          Shop Now
                        </Link>
                      </Column>
                    </Row>
                  </Column>
                </Row>
              </Container>
            </Section>
          )}

          {/* Footer */}
          <CustomerEmailFooter />
        </Body>
      </Html>
    </EmailTailwind>
  );
}

const orderFulfilledEmail = (props: OrderFulfilledEmailProps) => (
  <OrderFulfilledEmailComponent {...props} />
);

const mockFulfilled = {
  fulfillment: {
    id: "fulfillment_01JSNXDH9C47KZ43WQ3TBFXZA9",
    order_id: "order_01JYS8E5YE1HHMN2E0DWSG6WTG",
    order_version: 1,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    location_id: "loc_01JSNXDH9C47KZ43WQ3TBFXZA9",
    packed_at: null,
    shipped_at: null,
    delivered_at: null,
    canceled_at: null,
    data: {},
    provider_id: "manual_manual",
    metadata: {},
    labels: [
      {
        id: "fulfill_label_01JSNXDH9C47KZ43WQ3TBFXZA9",
        tracking_number: "0212-F7DB-01DC-901D",
        carrier_code: "rm",
        tracking_url:
          "https://www.royalmail.com/portal/rm/track?trackNumber=0212-F7DB-01DC-901D",
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
    ],
  },
  order: {
    id: "order_01JYS8E5YE1HHMN2E0DWSG6WTG",
    display_id: 1,
    email: "dave@foresite.rocks",
    currency_code: "gbp",
    total: 2500,
    subtotal: 2000,
    discount_total: 0,
    shipping_total: 500,
    tax_total: 0,
    item_subtotal: 2000,
    item_total: 2000,
    item_tax_total: 0,
    customer: {
      id: "cus_01JSNXD6VQC1YH56E4TGC81NWX",
      first_name: "Dave",
      last_name: "Customer",
    },
    shipping_address: {
      id: "addr_01JSNXD6VQC1YH56E4TGC81NWX",
      first_name: "Dave",
      last_name: "Customer",
      address_1: "123 Test Street",
      address_2: "Apt 1",
      city: "Test City",
      postal_code: "TE1 1ST",
      country_code: "gb",
      province: "Test Province",
    },
    billing_address: {
      id: "addr_01JSNXD6VQC1YH56E4TGC81NWX",
      first_name: "Dave",
      last_name: "Customer",
      address_1: "123 Test Street",
      address_2: "Apt 1",
      city: "Test City",
      postal_code: "TE1 1ST",
      country_code: "gb",
      province: "Test Province",
    },
    items: [
      {
        id: "ordli_01JSNXD6VQC1YH56E4TGC81NWX",
        title: "Rustic Tealight Holder",
        quantity: 1,
        unit_price: 2000,
        total: 2000,
        variant: {
          id: "var_01JSNXD6VQC1YH56E4TGC81NWX",
          title: "Rustic Tealight Holder - Natural",
          sku: "TLH-001",
        },
      },
    ],
  },
  email_banner: {
    title: "Discover More Handcrafted Treasures",
    body: "Explore our latest collection of handcrafted wooden items, each piece lovingly made in our workshop.",
    url: "https://boughandburrow.uk/collections/new",
  },
};

/**
 * Order fulfilled email
 * @param props - The props for the email
 * @returns The email component with test data
 */
export default () => (
  <OrderFulfilledEmailComponent {...mockFulfilled} />
);

export { orderFulfilledEmail };
