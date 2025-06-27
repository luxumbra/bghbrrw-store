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

type AdminOrderPlacedEmailProps = {
  order: OrderDTO;
  isAdminNotification?: boolean;
  message?: string;
};

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
    <Html>
      <Head />
      <Preview>New Order Received - #{String(order.display_id)}</Preview>
      <Tailwind>
        <Body className="w-full max-w-2xl mx-auto my-10 bg-[#18181B]">
          {/* Header */}
          <Section className="bg-[#18181b] text-white relative text-center py-4">
            <Img
              src="https://cdn.boughandburrow.uk/static/FullLogo.png"
              alt="Bough & Burrow Logo"
              className="h-20 mx-auto"
            />
          </Section>

          {/* Admin Notification */}
          <Container className="p-6">
            <Heading className="text-2xl font-bold text-center text-[#B87333]">
              🛒 New Order Received
            </Heading>
            <Section>
              <Text className="mt-4 text-center text-[#A8B0A3]">
                {message ||
                  `Order #${String(order.display_id)} has been placed`}
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
                  <strong>Order ID:</strong> #{order.display_id}
                </Text>
                <Text className="m-0 my-2 text-sm text-[#A8B0A3]">
                  <strong>Email:</strong> {order.email}
                </Text>
                <Text className="m-0 my-2 text-sm text-[#A8B0A3]">
                  <strong>Total:</strong> {formatPrice(order.total)}
                </Text>
              </Column>
            </Row>
          </Container>

          {/* Customer Address */}
          <Container className="px-6">
            <Heading className="mb-4 text-xl font-semibold text-[#A8B0A3]">
              Shipping Address
            </Heading>
            <Row>
              <Column>
                <Text className="m-0 my-2 text-sm text-[#A8B0A3]">
                  {order.shipping_address?.first_name}{" "}
                  {order.shipping_address?.last_name}
                </Text>
                <Text className="m-0 my-2 text-sm text-[#A8B0A3]">
                  {order.shipping_address?.address_1}
                </Text>
                {order.shipping_address?.address_2 && (
                  <Text className="m-0 my-2 text-sm text-[#A8B0A3]">
                    {order.shipping_address.address_2}
                  </Text>
                )}
                <Text className="m-0 my-2 text-sm text-[#A8B0A3]">
                  {order.shipping_address?.city},{" "}
                  {order.shipping_address?.postal_code}
                </Text>
                <Text className="m-0 my-2 text-sm text-[#A8B0A3]">
                  {order.shipping_address?.country_code?.toUpperCase()}
                </Text>
              </Column>
            </Row>
          </Container>

          {/* Order Items */}
          <Container className="px-6">
            <Heading className="mb-4 text-xl font-semibold text-[#A8B0A3]">
              Order Items
            </Heading>
            {order.items?.map((item) => (
              <Section key={item.id} className="py-2 border-b border-gray-700">
                <Row>
                  <Column className="w-2/3">
                    <Text className="text-sm font-semibold text-[#A8B0A3]">
                      {item.title}
                    </Text>
                  </Column>
                  <Column className="w-1/3 text-right">
                    <Text className="text-sm text-[#A8B0A3]">
                      Qty: {item.quantity}
                    </Text>
                    <Text className="text-sm font-bold text-[#A8B0A3]">
                      {formatPrice(item.total)}
                    </Text>
                  </Column>
                </Row>
              </Section>
            ))}
            <Section>
              <Row>
                <Column>
                  <Text className="text-sm font-semibold text-[#A8B0A3]">
                    Total
                  </Text>
                </Column>
                <Column className="w-1/3 text-right">
                  <Text className="text-sm font-bold text-[#A8B0A3]">
                    {formatPrice(order.total)}
                  </Text>
                </Column>
              </Row>
            </Section>
          </Container>

          {/* Footer */}
          <Section className="bg-[#18181b] text-white text-center py-4 mt-8">
            <Text className="text-sm text-[#A8B0A3]">
              This is an automated notification from Bough & Burrow
            </Text>
          </Section>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default AdminOrderPlacedEmailComponent;
