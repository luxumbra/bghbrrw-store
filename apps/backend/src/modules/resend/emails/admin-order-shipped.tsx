import {
  Text,
  Column,
  Container,
  Heading,
  Html,
  Img,
  Row,
  Section,
  Head,
  Preview,
  Body,
  Link,
} from "@react-email/components";
import {
  OrderDTO,
  FulfillmentDTO,
  BigNumberValue,
} from "@medusajs/framework/types";

import { EmailHeading, EmailHeader, EmailTailwind } from "./shared";

type AdminOrderShippedEmailProps = {
  order: OrderDTO;
  fulfillment: FulfillmentDTO;
  isAdminNotification?: boolean;
  message?: string;
};

/**
 * Admin order shipped email component
 * @param props - The props for the email
 * @returns The email component
 */
function AdminOrderShippedEmailComponent({
  order,
  fulfillment,
  isAdminNotification = true,
  message,
}: AdminOrderShippedEmailProps) {
  const formatter = new Intl.NumberFormat([], {
    style: "currency",

    currencyDisplay: "narrowSymbol",

    currency: order.currency_code,
  });

  const formatPrice = (price: BigNumberValue) => {
    if (typeof price === "number") {
      return formatter.format(price);
    }

    if (typeof price === "string") {
      return formatter.format(parseFloat(price));
    }

    return price?.toString() || "";
  };
  return (
    <Html className="font-sans bg-secondary">
      <Head />
      <Preview>
        Order Shipped to Customer - {`#${String((order as any).display_id)}`}
      </Preview>
      <EmailTailwind>
        <Body className="w-full max-w-2xl mx-auto my-10 bg-primary-background">
          <EmailHeader />

          {/* Admin Notification */}
          <Container className="p-6">
            <EmailHeading>🚚 Order Shipped</EmailHeading>
            <Section>
              <Text className="mt-4 text-center text-secondary">
                {message ||
                  `Order #${String(
                    (order as any).display_id
                  )} has been shipped`}
              </Text>
            </Section>
          </Container>

          {/* Order Details */}
          <Container className="px-6">
            <Heading className="mb-4 text-xl font-semibold text-[#A8B0A3]">
              Order Details
            </Heading>
            <Row>
              <Column className="w-1/2">
                <Text className="m-0 my-2 text-sm text-[#A8B0A3]">
                  <strong>Order ID:</strong> #
                  {String((order as any).display_id)}
                </Text>
                <Text className="m-0 my-2 text-sm text-[#A8B0A3]">
                  <strong>Customer Email:</strong> {order.email}
                </Text>
                <Text className="m-0 my-2 text-sm text-[#A8B0A3]">
                  <strong>Total:</strong> {formatPrice(order.total)}
                </Text>
                <Text className="m-0 my-2 text-sm text-[#A8B0A3]">
                  <strong>Fulfillment ID:</strong> {fulfillment.id}
                </Text>
              </Column>
            </Row>
          </Container>

          {/* Tracking Information */}
          {fulfillment.labels && fulfillment.labels.length > 0 && (
            <Container className="px-6">
              <Heading className="mb-4 text-xl font-semibold text-[#A8B0A3]">
                Tracking Information
              </Heading>
              <Row>
                <Column>
                  <Text className="m-0 my-2 text-sm text-[#A8B0A3]">
                    <strong>Tracking Number:</strong>{" "}
                    {fulfillment.labels[0].tracking_number}
                  </Text>
                  <Text className="m-0 my-2 text-sm text-[#A8B0A3]">
                    <strong>Tracking URL:</strong>{" "}
                    <Link
                      href={fulfillment.labels[0].tracking_url}
                      className="text-blue-500 underline"
                    >
                      {fulfillment.labels[0].tracking_url}
                    </Link>
                  </Text>
                </Column>
              </Row>
            </Container>
          )}

          {/* Shipping Address */}
          <Container className="px-6">
            <Heading className="mb-4 text-xl font-semibold text-[#A8B0A3]">
              Shipping Address
            </Heading>
            <Row>
              <Column>
                <Text className="m-0 my-2 text-sm text-[#A8B0A3]">
                  {fulfillment.delivery_address?.first_name ||
                    order.shipping_address?.first_name}{" "}
                  {fulfillment.delivery_address?.last_name ||
                    order.shipping_address?.last_name}
                </Text>
                <Text className="m-0 my-2 text-sm text-[#A8B0A3]">
                  {fulfillment.delivery_address?.address_1 ||
                    order.shipping_address?.address_1}
                </Text>
                <Text className="m-0 my-2 text-sm text-[#A8B0A3]">
                  {fulfillment.delivery_address?.city ||
                    order.shipping_address?.city}
                  ,{" "}
                  {fulfillment.delivery_address?.postal_code ||
                    order.shipping_address?.postal_code}
                </Text>
                <Text className="m-0 my-2 text-sm text-[#A8B0A3]">
                  {(
                    fulfillment.delivery_address?.country_code ||
                    order.shipping_address?.country_code
                  )?.toUpperCase()}
                </Text>
              </Column>
            </Row>
          </Container>

          {/* Footer */}
          <Section className="bg-[#18181b] text-white text-center py-4 mt-8">
            <Text className="text-sm text-[#A8B0A3]">
              This is an automated notification from Bough & Burrow
            </Text>
          </Section>
        </Body>
      </EmailTailwind>
    </Html>
  );
}

export const adminOrderShippedEmail = (props: AdminOrderShippedEmailProps) => (
  <AdminOrderShippedEmailComponent {...props} />
);

/**
 * Mock data for the admin order shipped email
 * @deprecated This is a mock email for testing purposes.
 */
const mockAdminOrderShipped: AdminOrderShippedEmailProps = {
  // @ts-ignore
  order: {
    id: "order_01JSNXDH9BPJWWKVW03B9E9KW8",
    display_id: 1,
    email: "dave@foresite.rocks",
    currency_code: "gbp",
    total: 100,
    tax_total: 10,
    subtotal: 90,
    original_total: 100,
    discount_total: 0,
    discount_subtotal: 0,
    discount_tax_total: 0,
    original_tax_total: 10,
    raw_subtotal: {
      value: "90",
      precision: 20,
    },
    raw_total: {
      value: "100",
      precision: 20,
    },
    raw_original_total: {
      value: "100",
      precision: 20,
    },
    raw_discount_total: {
      value: "0",
      precision: 20,
    },
  },
  fulfillment: {
    id: "fulfillment_01JSNXDH9BPJWWKVW03B9E9KW8",
    tracking_number: "1234567890",
    tracking_url: "https://www.google.com",
    delivery_address: {
      id: "address_01JSNXDH9BPJWWKVW03B9E9KW8",
      fulfillment_id: "fulfillment_01JSNXDH9BPJWWKVW03B9E9KW8",
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      first_name: "John",
      last_name: "Doe",
      address_1: "123 Main St",
      city: "Anytown",
      postal_code: "12345",
      country_code: "US",
      company: "Acme Inc",
      address_2: "Apt 1",
      phone: "1234567890",
      province: "CA",
      metadata: {},
    },
    labels: [
      {
        id: "label_01JSNXDH9BPJWWKVW03B9E9KW8",
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        tracking_number: "1234567890",
        tracking_url: "https://www.google.com",
        label_url: "https://www.google.com",
        fulfillment_id: "fulfillment_01JSNXDH9BPJWWKVW03B9E9KW8",
        fulfillment: {
          id: "fulfillment_01JSNXDH9BPJWWKVW03B9E9KW8",
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
          location_id: "location_01JSNXDH9BPJWWKVW03B9E9KW8",
          packed_at: new Date(),
          shipped_at: new Date(),
          delivered_at: new Date(),
          canceled_at: null,
          data: {},
          provider_id: "provider_01JSNXDH9BPJWWKVW03B9E9KW8",
          metadata: {},
          shipping_option_id: "shipping_option_01JSNXDH9BPJWWKVW03B9E9KW8",
          // @ts-ignore
          shipping_option: {
            id: "shipping_option_01JSNXDH9BPJWWKVW03B9E9KW8",
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
            name: "Standard Shipping",
            service_zone_id: "service_zone_01JSNXDH9BPJWWKVW03B9E9KW8",
            shipping_profile_id: "shipping_profile_01JSNXDH9BPJWWKVW03B9E9KW8",
            metadata: {},
            provider_id: "provider_01JSNXDH9BPJWWKVW03B9E9KW8",
            price_type: "flat",
            shipping_option_type_id:
              "shipping_option_type_01JSNXDH9BPJWWKVW03B9E9KW8",
            data: {},
            shipping_profile: {
              id: "shipping_profile_01JSNXDH9BPJWWKVW03B9E9KW8",
              created_at: new Date(),
              updated_at: new Date(),
              deleted_at: null,
              name: "Standard Shipping",
              type: "standard",
              metadata: {},
              shipping_options: [],
            },
            service_zone: {
              id: "service_zone_01JSNXDH9BPJWWKVW03B9E9KW8",
              created_at: new Date(),
              updated_at: new Date(),
              deleted_at: null,
              name: "Standard Shipping",
              metadata: {},
              fulfillment_set_id: "fulfillment_set_01JSNXDH9BPJWWKVW03B9E9KW8",
              fulfillment_set: {
                id: "fulfillment_set_01JSNXDH9BPJWWKVW03B9E9KW8",
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null,
                name: "Standard Shipping",
                metadata: {},
                type: "standard",
                service_zones: [],
              },
              metadata: {},
              geo_zones: [],
              shipping_options: [],
            },
            fulfillment_provider: {
              id: "fulfillment_provider_01JSNXDH9BPJWWKVW03B9E9KW8",
              created_at: new Date(),
              updated_at: new Date(),
              deleted_at: null,
              name: "Standard Shipping",
              metadata: {},
              shipping_options: [],
            },
            rules: [],
            fulfillments: [],
          },
        },
      },
    ],
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    item_id: "ordli_01JSNXDH9C47KZ43WQ3TBFXZA9",
    unit_price: null,
    compare_at_unit_price: null,
    quantity: 1,
    fulfilled_quantity: 0,
    delivered_quantity: 0,
    shipped_quantity: 0,
    return_requested_quantity: 0,
    return_received_quantity: 0,
    return_dismissed_quantity: 0,
    written_off_quantity: 0,
  },
  isAdminNotification: true,
  message: "Order has been shipped",
};

/**
 * Admin order shipped email
 * @param props - The props for the email
 * @returns The email component with test data
 */
export default () => (
  <AdminOrderShippedEmailComponent {...mockAdminOrderShipped} />
);
