import {
  BigNumberValue,
  CustomerDTO,
  FulfillmentDTO,
  OrderDTO,
} from "@medusajs/framework/types";
import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import {
  AdminEmailFooter,
  EmailHeader,
  EmailHeading,
  EmailTailwind,
} from "../shared";

type OrderDeliveredEmailProps = {
  fulfillment: FulfillmentDTO & {
    orders: OrderDTO[];
  };
  order: OrderDTO;
  email_banner?: {
    body: string;
    title: string;
    url: string;
  };
};

function AdminOrderDeliveredEmailComponent({
  fulfillment,
  order,
  email_banner,
}: OrderDeliveredEmailProps) {
  const shouldDisplayBanner = email_banner && "title" in email_banner;

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
        <Preview>
          Your order from Bough &amp; Burrow has been delivered!
        </Preview>
        <Body className="mx-auto my-10 w-full max-w-2xl bg-primary-background">
          {/* Header */}
          <EmailHeader />

          {/* Thank You Message */}
          <Container className="p-6">
            <EmailHeading>An order has been delivered! 🎉</EmailHeading>
            <Section>
              <Text className="mt-4 text-center text-secondary">
                Order #{order.display_id} has been delivered to{" "}
                {order.shipping_address?.first_name}{" "}
                {order.shipping_address?.last_name} at{" "}
                {order.shipping_address?.postal_code},{" "}
                {order.shipping_address?.country_code}.
              </Text>
              <Text className="mt-4 text-center text-secondary">
                The order was delivered on{" "}
                {fulfillment.created_at.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
                at{" "}
                {fulfillment.created_at.toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                .{" "}
                <Link
                  href={`https://admin.boughandburrow.uk/orders/${order.id}`}
                  className="text-blue-500 underline"
                >
                  View order
                </Link>
              </Text>
            </Section>
          </Container>

          {/* Promotional Banner */}
          {shouldDisplayBanner && (
            <Container
              className="p-7 mb-4 rounded-lg"
              style={{
                background: "linear-gradient(to right, #3b82f6, #4f46e5)",
              }}
            >
              <Section>
                <Row>
                  <Column align="left">
                    <Heading className="text-xl font-semibold text-white">
                      {email_banner.title}
                    </Heading>
                    <Text className="mt-2 text-white">{email_banner.body}</Text>
                  </Column>
                  <Column align="right">
                    <Link
                      href={email_banner.url}
                      className="px-2 font-semibold text-white underline"
                    >
                      Shop Now
                    </Link>
                  </Column>
                </Row>
              </Section>
            </Container>
          )}

          {/* Shipping Details */}
          <Container className="px-6">
            <Heading className="mb-4 text-xl font-semibold text-[#A8B0A3]">
              Shipping Details
            </Heading>
            <Row>
              <Column className="w-1/2">
                <Text className="m-0 my-2 text-sm text-[#A8B0A3]">
                  {fulfillment.delivery_address?.first_name ||
                    order.shipping_address?.first_name}{" "}
                  {fulfillment.delivery_address?.last_name ||
                    order.shipping_address?.last_name}
                </Text>
                <Text className="m-0 my-2 text-sm text-[#A8B0A3]">
                  {fulfillment.delivery_address?.address_1 ||
                    order.shipping_address?.address_1}
                  ,{" "}
                  {fulfillment.delivery_address?.city ||
                    order.shipping_address?.city}
                  ,{" "}
                  {fulfillment.delivery_address?.postal_code ||
                    order.shipping_address?.postal_code}
                </Text>
                <Text className="m-0 my-2 text-sm text-[#A8B0A3]">
                  {fulfillment.delivery_address?.country_code ||
                    order.shipping_address?.country_code}
                </Text>
              </Column>
            </Row>
          </Container>

          {/* Order Items */}
          {/* <Container className="px-6">
            <Heading className="mb-4 text-xl font-semibold text-[#A8B0A3]">
              Your Items
            </Heading>
            <Row>
              <Column>
                <Text className="m-0 my-2 text-sm text-[#A8B0A3]">
                  Order ID: #{fulfillment.orders[0].display_id}
                </Text>
              </Column>
            </Row>
            {/* {fulfillment.items?.map((item) => (
              <Section key={item.id} className="py-4 border-b border-gray-200">
                <Row>
                  <Column className="w-1/3">
                    <Img
                      src={item.thumbnail ?? ""}
                      alt={item.product_title ?? ""}
                      className="rounded-lg"
                      width="100%"
                    />
                  </Column>
                  <Column className="pl-4 w-2/3">
                    <Text className="text-lg font-semibold text-[#A8B0A3]">
                      {item.product_title}
                    </Text>
                    <Text className="text-[#A8B0A3]">{item.variant_title}</Text>
                    <Text className="mt-2 font-bold text-[#A8B0A3]">
                      {formatPrice(item.total)}
                    </Text>
                  </Column>
                </Row>
              </Section>
            ))} */}

          {/* Order Summary */}
          {/* <Section className="mt-8">
              <Heading className="mb-4 text-xl font-semibold text-[#A8B0A3]">
                Order Summary
              </Heading>
              <Row className="text-[#A8B0A3]">
                <Column className="w-1/2">
                  <Text className="m-0">Subtotal</Text>
                </Column>
                <Column className="w-1/2 text-right">
                  <Text className="m-0">{formatPrice(order.item_total)}</Text>
                </Column>
              </Row>
              {order.shipping_methods?.map((method) => (
                <Row className="text-[#A8B0A3]" key={method.id}>
                  <Column className="w-1/2">
                    <Text className="m-0">{method.name}</Text>
                  </Column>
                  <Column className="w-1/2 text-right">
                    <Text className="m-0">{formatPrice(method.total)}</Text>
                  </Column>
                </Row>
              ))}
              <Row className="text-[#A8B0A3]">
                <Column className="w-1/2">
                  <Text className="m-0">Tax</Text>
                </Column>
                <Column className="w-1/2 text-right">
                  <Text className="m-0">
                    {formatPrice(order.tax_total || 0)}
                  </Text>
                </Column>
              </Row>
              <Row className="mt-4 font-bold text-[#A8B0A3] border-t border-gray-200">
                <Column className="w-1/2">
                  <Text>Total</Text>
                </Column>
                <Column className="w-1/2 text-right">
                  <Text>{formatPrice(order.total)}</Text>
                </Column>
              </Row>
            </Section>
          </Container> */}

          {/* Footer */}
          <AdminEmailFooter />
        </Body>
      </Html>
    </EmailTailwind>
  );
}

export const adminOrderDeliveredEmail = (props: OrderDeliveredEmailProps) => (
  <AdminOrderDeliveredEmailComponent {...props} />
);

const mockDelivered = {
  fulfillment: {
    id: "fulfillment_01JSNXDH9C47KZ43WQ3TBFXZA9",
    order_id: "order_01JSNXDH9BPJWWKVW03B9E9KW8",
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
  order: {
    id: "order_01JSNXDH9BPJWWKVW03B9E9KW8",
    display_id: 1,
    email: "dave@foresite.rocks",
    currency_code: "gbp",
    total: 20,
    subtotal: 20,
    discount_total: 0,
    shipping_total: 10,
    tax_total: 0,
    item_subtotal: 10,
    item_total: 10,
    item_tax_total: 0,
    customer: {
      id: "cus_01JSNXD6VQC1YH56E4TGC81NWX",
      first_name: "Dave",
    },
    items: [
      {
        id: "ordli_01JSNXDH9C47KZ43WQ3TBFXZA9",
        title: "L",
        subtitle: "Medusa Sweatshirt",
        thumbnail:
          "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png",
        variant_id: "variant_01JSNXAQCZ5X81A3NRSVFJ3ZHQ",
        product_id: "prod_01JSNXAQBQ6MFV5VHKN420NXQW",
        product_title: "Medusa Sweatshirt",
        product_description:
          "Reimagine the feeling of a classic sweatshirt. With our cotton sweatshirt, everyday essentials no longer have to be ordinary.",
        product_subtitle: null,
        product_type: null,
        product_type_id: null,
        product_collection: null,
        product_handle: "sweatshirt",
        variant_sku: "SWEATSHIRT-L",
        variant_barcode: null,
        variant_title: "L",
        variant_option_values: null,
        requires_shipping: true,
        is_giftcard: false,
        is_discountable: true,
        is_tax_inclusive: false,
        is_custom_price: false,
        metadata: {},
        raw_compare_at_unit_price: null,
        raw_unit_price: {
          value: "10",
          precision: 20,
        },
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        tax_lines: [],
        adjustments: [],
        compare_at_unit_price: null,
        unit_price: 10,
        quantity: 1,
        raw_quantity: {
          value: "1",
          precision: 20,
        },
        detail: {
          id: "orditem_01JSNXDH9DK1XMESEZPADYFWKY",
          version: 1,
          metadata: null,
          order_id: "order_01JSNXDH9BPJWWKVW03B9E9KW8",
          raw_unit_price: null,
          raw_compare_at_unit_price: null,
          raw_quantity: {
            value: "1",
            precision: 20,
          },
          raw_fulfilled_quantity: {
            value: "0",
            precision: 20,
          },
          raw_delivered_quantity: {
            value: "0",
            precision: 20,
          },
          raw_shipped_quantity: {
            value: "0",
            precision: 20,
          },
          raw_return_requested_quantity: {
            value: "0",
            precision: 20,
          },
          raw_return_received_quantity: {
            value: "0",
            precision: 20,
          },
          raw_return_dismissed_quantity: {
            value: "0",
            precision: 20,
          },
          raw_written_off_quantity: {
            value: "0",
            precision: 20,
          },
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
        subtotal: 10,
        total: 10,
        original_total: 10,
        discount_total: 0,
        discount_subtotal: 0,
        discount_tax_total: 0,
        tax_total: 0,
        original_tax_total: 0,
        refundable_total_per_unit: 10,
        refundable_total: 10,
        fulfilled_total: 0,
        shipped_total: 0,
        return_requested_total: 0,
        return_received_total: 0,
        return_dismissed_total: 0,
        write_off_total: 0,
        raw_subtotal: {
          value: "10",
          precision: 20,
        },
        raw_total: {
          value: "10",
          precision: 20,
        },
        raw_original_total: {
          value: "10",
          precision: 20,
        },
        raw_discount_total: {
          value: "0",
          precision: 20,
        },
        raw_discount_subtotal: {
          value: "0",
          precision: 20,
        },
        raw_discount_tax_total: {
          value: "0",
          precision: 20,
        },
        raw_tax_total: {
          value: "0",
          precision: 20,
        },
        raw_original_tax_total: {
          value: "0",
          precision: 20,
        },
        raw_refundable_total_per_unit: {
          value: "10",
          precision: 20,
        },
        raw_refundable_total: {
          value: "10",
          precision: 20,
        },
        raw_fulfilled_total: {
          value: "0",
          precision: 20,
        },
        raw_shipped_total: {
          value: "0",
          precision: 20,
        },
        raw_return_requested_total: {
          value: "0",
          precision: 20,
        },
        raw_return_received_total: {
          value: "0",
          precision: 20,
        },
        raw_return_dismissed_total: {
          value: "0",
          precision: 20,
        },
        raw_write_off_total: {
          value: "0",
          precision: 20,
        },
      },
    ],
    shipping_address: {
      id: "caaddr_01JSNXD6W0TGPH2JQD18K97B25",
      customer_id: null,
      company: "",
      first_name: "Dave",
      last_name: "S",
      address_1: "The Burrow",
      address_2: "",
      city: "Wotton-Under-Edge",
      country_code: "uk",
      province: "",
      postal_code: "GL12 8DG",
      phone: "",
      metadata: null,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    },
    billing_address: {
      id: "caaddr_01JSNXD6W0V7RNZH63CPG26K5W",
      customer_id: null,
      company: "",
      first_name: "Dave",
      last_name: "asfaf",
      address_1: "asfasf",
      address_2: "",
      city: "asfasf",
      country_code: "dk",
      province: "",
      postal_code: "asfasf",
      phone: "",
      metadata: null,
      created_at: "2025-04-25T07:25:48.801Z",
      updated_at: "2025-04-25T07:25:48.801Z",
      deleted_at: null,
    },
    shipping_methods: [
      {
        id: "ordsm_01JSNXDH9B9DDRQXJT5J5AE5V1",
        name: "Standard Shipping",
        description: null,
        is_tax_inclusive: false,
        is_custom_amount: false,
        shipping_option_id: "so_01JSNXAQA64APG6BNHGCMCTN6V",
        data: {},
        metadata: null,
        raw_amount: {
          value: "10",
          precision: 20,
        },
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        tax_lines: [],
        adjustments: [],
        amount: 10,
        order_id: "order_01JSNXDH9BPJWWKVW03B9E9KW8",
        detail: {
          id: "ordspmv_01JSNXDH9B5RAF4FH3M1HH3TEA",
          version: 1,
          order_id: "order_01JSNXDH9BPJWWKVW03B9E9KW8",
          return_id: null,
          exchange_id: null,
          claim_id: null,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
          shipping_method_id: "ordsm_01JSNXDH9B9DDRQXJT5J5AE5V1",
        },
        subtotal: 10,
        total: 10,
        original_total: 10,
        discount_total: 0,
        discount_subtotal: 0,
        discount_tax_total: 0,
        tax_total: 0,
        original_tax_total: 0,
        raw_subtotal: {
          value: "10",
          precision: 20,
        },
        raw_total: {
          value: "10",
          precision: 20,
        },
        raw_original_total: {
          value: "10",
          precision: 20,
        },
        raw_discount_total: {
          value: "0",
          precision: 20,
        },
        raw_discount_subtotal: {
          value: "0",
          precision: 20,
        },
        raw_discount_tax_total: {
          value: "0",
          precision: 20,
        },
        raw_tax_total: {
          value: "0",
          precision: 20,
        },
        raw_original_tax_total: {
          value: "0",
          precision: 20,
        },
      },
    ],
  },
  customer: {
    first_name: "Dave",
  },
};
// @ts-ignore
export default () => <AdminOrderDeliveredEmailComponent {...mockDelivered} />;
