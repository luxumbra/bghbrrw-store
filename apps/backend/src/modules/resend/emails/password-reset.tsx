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
import { EmailHeader, EmailHeading, EmailTailwind } from "./shared";

type ResetPasswordEmailProps = {
  url: string;
};

/**
 * Password reset email component
 * @param props - The props for the email
 * @returns The email component
 */
function ResetPasswordEmailComponent({ url }: ResetPasswordEmailProps) {
  return (
    <EmailTailwind>
      <Html className="font-sans bg-secondary-background">
        <Head />
        <Preview>Reset your password</Preview>
        <Body className="w-full max-w-2xl mx-auto my-10 bg-primary-background">
          {/* Header */}
          <EmailHeader />

          {/* Reset Message */}
          <Container className="p-6 text-center">
            <EmailHeading>Reset your password</EmailHeading>
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
    </EmailTailwind>
  );
}

/**
 * Password reset email
 * @param props - The props for the email
 * @returns The email component with test data
 */
export const resetPasswordEmail = (props: ResetPasswordEmailProps) => (
  <ResetPasswordEmailComponent {...props} />
);

const mockResetPassword = {
  url: "https://boughandburrow.uk/reset-password",
};

/**
 * @deprecated This is a mock email for testing purposes.
 */
export default () => <ResetPasswordEmailComponent {...mockResetPassword} />;
