import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthStore } from "@/store/useAuthStore";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberDevice, setRememberDevice] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { signIn, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearError();

    const result = await signIn(email, password, rememberDevice);

    if (result.success) {
      navigate("/home");
    }

    setIsSubmitting(false);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(26, 43, 74, 0.1)', boxShadow: '0 4px 24px rgba(26, 43, 74, 0.08)' }}>
        <CardHeader>
          <CardTitle style={{ color: '#1A2B4A' }}>Login to your account</CardTitle>
          <CardDescription style={{ color: '#5A6B7D' }}>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    style={{ color: '#D97746' }}
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </Field>
              <Field>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Remember this device
                  </label>
                </div>
              </Field>
              <Field>
                <Button type="submit" disabled={isSubmitting} className="w-full" style={{ backgroundColor: '#1A2B4A', color: '#FFFFFF' }}>
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>
                <FieldDescription className="text-center" style={{ color: '#5A6B7D' }}>
                  Don&apos;t have an account?{" "}
                  <Link to="/signup" className="underline hover:no-underline" style={{ color: '#D97746' }}>
                    Sign up
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
