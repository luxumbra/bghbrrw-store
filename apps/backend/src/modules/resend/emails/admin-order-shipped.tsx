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
  OrderDTO,
  FulfillmentDTO,
  BigNumberValue,
} from "@medusajs/framework/types";

type AdminOrderShippedEmailProps = {
  order: OrderDTO;
  fulfillment: FulfillmentDTO;
  isAdminNotification?: boolean;
  message?: string;
};

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
    <Html>
      <Head />
      <Preview>Order Shipped - #{String((order as any).display_id)}</Preview>
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
              🚚 Order Shipped
            </Heading>
            <Section>
              <Text className="mt-4 text-center text-[#A8B0A3]">
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
                  <strong>Total:</strong>{" "}
                  {formatPrice(order.total, order.currency_code)}
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
      </Tailwind>
    </Html>
  );
}

export default AdminOrderShippedEmailComponent;
