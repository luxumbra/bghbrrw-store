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

type ResetPasswordEmailProps = {
  url: string;
};

function ResetPasswordEmailComponent({ url }: ResetPasswordEmailProps) {
  return (
    <Tailwind>
      <Html className="font-sans bg-gray-100">
        <Head />
        <Preview>Reset your password</Preview>
        <Body className="w-full max-w-2xl mx-auto my-10 bg-[#18181B]">
          {/* Header */}
          <Section className="bg-[#18181b] text-white relative text-center py-4">
            <Img
              src="https://cdn.boughandburrow.uk/static/FullLogo.png"
              alt="Bough & Burrow Logo"
              className="h-20 mx-auto"
            />
          </Section>

          {/* Reset Message */}
          <Container className="p-6">
            <Heading className="text-2xl font-bold text-center text-[#B87333]">
              Reset your password
            </Heading>
            <Text className="mt-2 text-center text-[#A8B0A3]">
              Click the link below to reset your password.
            </Text>
            <Link href={url} className="text-blue-500">
              Reset password
            </Link>
            <Text className="mt-2 text-center text-[#A8B0A3]">
              If you did not request a password reset, please ignore this email.
            </Text>
          </Container>

          {/* Footer */}
          <Section className="p-6 mt-10 bg-[#18181b]">
            <Text className="text-sm text-center text-[#A8B0A3]">
              If you have any questions, reply to this email or contact our
              support team at hello@boughandburrow.uk.
            </Text>

            <Text className="mt-4 text-xs text-center text-gray-400">
              © {new Date().getFullYear()} Bough &amp; Burrow. All rights
              reserved.
            </Text>
          </Section>
        </Body>
      </Html>
    </Tailwind>
  );
}

export const resetPasswordEmail = (props: ResetPasswordEmailProps) => (
  <ResetPasswordEmailComponent {...props} />
);

const mockResetPassword = {
  url: "https://boughandburrow.uk/reset-password",
};
// @ts-ignore
export default () => <ResetPasswordEmailComponent {...mockResetPassword} />;
