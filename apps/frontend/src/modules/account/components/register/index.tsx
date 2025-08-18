"use client"

import { useActionState } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"
import { useCompanyInfo } from "@/hooks/useCompanyInfo"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [state, formAction] = useActionState(signup, null)
  const { companyInfo } = useCompanyInfo()

  return (
    <div
      className="w-full max-w-4xl flex items-start gap-6 cols-2 justify-between rounded-2xl"
      data-testid="register-page"
    >
      <div className="flex flex-col items-center justify-start p-6 w-full text-center max-w-md">
        <h1 className="text-xlarge-regular uppercase mb-6">
          Register
        </h1>
        <p className="text-xlarge-regular mb-6">
          Become a {companyInfo?.name || ""} Store Member
        </p>
      <p className="text-center text-large-regular text-ui-fg-base mb-4">
        Create your {companyInfo?.name || ""} account, and get access to an enhanced
        shopping experience--opt-in newsletter, discounts, and more.
      </p>

      </div>
      <div className="flex flex-col items-center w-full justify-start p-6 max-w-md">
      <form className="w-full flex flex-col" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="First name"
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
          />
          <Input
            label="Last name"
            name="last_name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
          />
          <Input
            label="Email"
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            data-testid="phone-input"
          />
          <Input
            label="Password"
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={state} data-testid="register-error" />
        <span className="text-center text-ui-fg-base text-small-regular mt-6">
          By creating an account, you agree to {companyInfo?.name || "our"}&apos;s{" "}
          <LocalizedClientLink
            href="/privacy"
            className="underline"
          >
            Privacy Policy
          </LocalizedClientLink>{" "}
          and{" "}
          <LocalizedClientLink
            href="/terms"
            className="underline"
          >
            Terms & Conditions
          </LocalizedClientLink>
          .
        </span>
        <SubmitButton className="w-full mt-6" data-testid="register-button">
          Join
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-base-regular mt-6">
        Already a member?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
        >
          Sign in
        </button>
        .
        </span>
      </div>
    </div>
  )
}

export default Register
