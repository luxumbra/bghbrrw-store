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

import { EmailHeading, EmailHeader, EmailTailwind } from "../shared";

type AdminOrderFulfilledEmailProps = {
  order: OrderDTO;
  fulfillment: FulfillmentDTO;
  isAdminNotification?: boolean;
  message?: string;
};

function AdminOrderFulfilledEmailComponent({
  order,
  fulfillment,
  isAdminNotification = true,
  message,
}: AdminOrderFulfilledEmailProps) {
  const formatPrice = (price: BigNumberValue) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: order.currency_code.toUpperCase(),
    }).format(Number(price) / 100);
  };

  return (
    <Html>
      <Head />
      <Preview>
        Order #{order.display_id} has been fulfilled - {order.email}
      </Preview>
      <EmailTailwind>
        <Body className="mx-auto my-10 w-full max-w-2xl bg-primary-background">
          {/* Header */}
          <EmailHeader />

          {/* Main Content */}
          <Container className="p-6">
            <EmailHeading>📦 Order Fulfilled - #{order.display_id}</EmailHeading>
            <Section>
              <Text className="mt-4 text-center text-secondary">
                Order #{order.display_id} has been fulfilled for {order.email}
              </Text>
              <Text className="mt-4 text-center text-secondary">
                Fulfillment ID: {fulfillment.id}
              </Text>
              <Text className="mt-4 text-center text-secondary">
                Fulfilled on: {fulfillment.created_at ? fulfillment.created_at.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }) : "Unknown date"}{" "}
                at{" "}
                {fulfillment.created_at ? fulfillment.created_at.toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                }) : "Unknown time"}
              </Text>
            </Section>

            {/* Order Details */}
            <Section className="mt-8">
              <Heading as="h2" className="text-xl font-semibold text-center mb-4">
                Order Details
              </Heading>
              <Row>
                <Column>
                  <Text className="text-secondary">
                    <strong>Order Number:</strong> #{order.display_id}
                  </Text>
                  <Text className="text-secondary">
                    <strong>Customer:</strong> {order.email}
                  </Text>
                  <Text className="text-secondary">
                    <strong>Total:</strong> {formatPrice(order.total)}
                  </Text>
                  <Text className="text-secondary">
                    <strong>Shipping Address:</strong>
                  </Text>
                  <Text className="text-secondary ml-4">
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

            {/* Action Button */}
            <Section className="mt-8">
              <Row>
                <Column className="text-center">
                  <Link
                    href={`https://admin.boughandburrow.uk/orders/${order.id}`}
                    className="bg-[#8B9A47] text-white px-6 py-3 rounded-lg inline-block no-underline"
                  >
                    View Order in Admin
                  </Link>
                </Column>
              </Row>
            </Section>
          </Container>
        </Body>
      </EmailTailwind>
    </Html>
  );
}

const adminOrderFulfilledEmail = (props: AdminOrderFulfilledEmailProps) => (
  <AdminOrderFulfilledEmailComponent {...props} />
);

const mockAdminFulfilled = {
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
  },
  fulfillment: {
    id: "fulfillment_01JSNXDH9C47KZ43WQ3TBFXZA9",
    order_id: "order_01JYS8E5YE1HHMN2E0DWSG6WTG",
    order_version: 1,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
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
  isAdminNotification: true,
  message: "Order has been fulfilled",
};

/**
 * Admin order fulfilled email
 * @param props - The props for the email
 * @returns The email component with test data
 */
export default () => (
  <AdminOrderFulfilledEmailComponent {...mockAdminFulfilled} />
);

export { adminOrderFulfilledEmail };