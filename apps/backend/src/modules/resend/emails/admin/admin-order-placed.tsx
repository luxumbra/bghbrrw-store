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
import { OrderDTO, BigNumberValue } from "@medusajs/framework/types";
import { mockOrder } from "../order-placed";
import {
  AdminEmailFooter,
  EmailHeader,
  EmailHeading,
  EmailTailwind,
} from "../shared";

type AdminOrderPlacedEmailProps = {
  order: OrderDTO;
  isAdminNotification?: boolean;
  message?: string;
};

/**
 * Admin order placed email component
 * @param props - The props for the email
 * @returns The email component
 */
function AdminOrderPlacedEmailComponent({
  order,
  isAdminNotification = true,
  message,
}: AdminOrderPlacedEmailProps) {
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
    <EmailTailwind>
      <Html className="font-sans bg-secondary">
        <Head />

        <Preview>New Order Received - #{String(order.display_id)}</Preview>
        <Body className="w-full max-w-2xl mx-auto my-10 bg-[#18181B]">
          <EmailHeader />

          {/* Admin Notification */}
          <Container className="p-6">
            <EmailHeading>🛒 New Order Received</EmailHeading>
            <Section>
              <Text className="mt-4 text-center text-secondary">
                {message ||
                  `${order.email} just placed order #${String(
                    order.display_id
                  )}`}
              </Text>
            </Section>
          </Container>

          {/* Order Details */}
          <Container className="px-6">
            <Heading className="mb-4 text-xl font-semibold text-secondary">
              Order Details
            </Heading>
            <Row>
              <Column className="w-1/2">
                <Text className="m-0 my-2 text-sm text-secondary">
                  <strong>Order ID:</strong> #{order.display_id}
                </Text>
                <Text className="m-0 my-2 text-sm text-secondary">
                  <strong>Email:</strong> {order.email}
                </Text>
                <Text className="m-0 my-2 text-sm text-secondary">
                  <strong>Total:</strong> {formatPrice(order.total)}
                </Text>
              </Column>
            </Row>
          </Container>

          {/* Customer Address */}
          <Container className="px-6">
            <Heading className="mb-4 text-xl font-semibold text-secondary">
              Shipping Address
            </Heading>
            <Row>
              <Column>
                <Text className="m-0 my-2 text-sm text-secondary">
                  {order.shipping_address?.first_name}{" "}
                  {order.shipping_address?.last_name}
                </Text>
                <Text className="m-0 my-2 text-sm text-secondary">
                  {order.shipping_address?.address_1}
                </Text>
                {order.shipping_address?.address_2 && (
                  <Text className="m-0 my-2 text-sm text-secondary">
                    {order.shipping_address.address_2}
                  </Text>
                )}
                <Text className="m-0 my-2 text-sm text-secondary">
                  {order.shipping_address?.city},{" "}
                  {order.shipping_address?.postal_code}
                </Text>
                <Text className="m-0 my-2 text-sm text-secondary">
                  {order.shipping_address?.country_code?.toUpperCase()}
                </Text>
              </Column>
            </Row>
          </Container>

          {/* Order Items */}
          <Container className="px-6">
            <Heading className="mb-4 text-xl font-semibold text-secondary">
              Order Items
            </Heading>
            {order.items?.map((item) => (
              <Section key={item.id} className="py-2 border-b border-gray-700">
                <Row>
                  <Column className="w-2/3">
                    <Text className="text-sm font-semibold text-secondary">
                      {item.title}
                    </Text>
                  </Column>
                  <Column className="w-1/3 text-right">
                    <Text className="text-sm text-secondary">
                      Qty: {item.quantity}
                    </Text>
                    <Text className="text-sm font-bold text-secondary">
                      {formatPrice(item.item_total)}
                    </Text>
                  </Column>
                </Row>
              </Section>
            ))}
            <Section>
              <Row>
                <Column>
                  <Text className="text-sm font-semibold text-secondary">
                    Total
                  </Text>
                </Column>
                <Column className="w-1/3 text-right">
                  <Text className="text-sm font-bold text-secondary">
                    {formatPrice(order.total)}
                  </Text>
                </Column>
              </Row>
            </Section>
          </Container>

          <AdminEmailFooter />
        </Body>
      </Html>
    </EmailTailwind>
  );
}

/**
 * Admin order placed email
 * @param props - The props for the email
 * @returns The email component with test data
 */
const adminOrderPlacedEmail = (props: AdminOrderPlacedEmailProps) => (
  <AdminOrderPlacedEmailComponent {...props} />
);

/**
 * Mock data for the admin order placed email
 * @example This is a mock email for testing purposes.
 */
const mockAdminOrderPlaced = mockOrder;

export { adminOrderPlacedEmail, mockAdminOrderPlaced };

/**
 * Admin order placed email
 * @example This is a mock email for testing purposes.
 */
export default () => (
  <AdminOrderPlacedEmailComponent {...mockAdminOrderPlaced} />
);
