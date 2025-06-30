import { Section, Text } from "@react-email/components";
import { BRAND_NAME, CONTACT_EMAIL } from "utils/constants";

const CustomerEmailFooter = () => {
  return (
    <Section className="p-6 mt-10 bg-[#18181b]">
      <Text className="text-sm text-center text-[#A8B0A3]">
        If you have any questions, reply to this email or contact our support
        team at {CONTACT_EMAIL}.
      </Text>
      <Text className="text-sm text-center text-[#A8B0A3]">
        {/* Order Token: {order.id} */}
      </Text>
      <Text className="mt-4 text-xs text-center text-gray-400">
        © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
      </Text>
    </Section>
  );
};

const AdminEmailFooter = () => {
  return (
    <Section className="p-6 mt-10 bg-[#18181b]">
      <Text className="text-sm text-center text-[#A8B0A3]">
        This is an automated notification from {BRAND_NAME}
      </Text>
    </Section>
  );
};

export { CustomerEmailFooter, AdminEmailFooter };
