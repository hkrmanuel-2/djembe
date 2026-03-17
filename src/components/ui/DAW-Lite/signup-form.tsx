import { useState, useEffect, useMemo } from "react";
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
import { supabase } from "@/lib/supabase";
import { validateEmailDomain } from "@/lib/emailValidation";
import { logger } from "@/lib/logger";

interface School {
  school_id: string;
  name: string;
  allowed_domains?: string[] | null;
}

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userType, setUserType] = useState<"teacher" | "student">("student");
  const [schoolId, setSchoolId] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [rememberDevice, setRememberDevice] = useState(true);
  const navigate = useNavigate();
  const { signUp, error, clearError } = useAuthStore();

  // Load schools on mount
  useEffect(() => {
    loadSchools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSchools = async () => {
    setIsLoadingSchools(true);
    try {
      let { data, error } = await supabase
        .from("schools")
        .select("school_id, name, allowed_domains")
        .order("name");
      
      // If error, try lowercase (table name might be case-sensitive)
      if (error && (error.message?.includes("relation") || error.code === "PGRST116")) {
        logger.log("Trying lowercase table name...");
        const result = await supabase
          .from("schools")
          .select("school_id, name, allowed_domains")
          .order("name");
        data = result.data;
        error = result.error;
      }
      
      if (error) {
        console.error("Error loading schools:", error);
        useAuthStore.setState({ 
          error: `Failed to load schools: ${error.message}. Please check your database connection.` 
        });
        return;
      }
      
      logger.log("Loaded schools:", data);
      setSchools(data || []);
      
      if (!data || data.length === 0) {
        logger.warn("No schools found in database");
        useAuthStore.setState({ 
          error: "No schools available. Please contact your administrator." 
        });
      } else {
        // Clear any previous errors if schools loaded successfully
        clearError();
      }
    } catch (err: any) {
      console.error("Error loading schools:", err);
      useAuthStore.setState({ 
        error: `Error loading schools: ${err.message || "Unknown error"}` 
      });
    } finally {
      setIsLoadingSchools(false);
    }
  };

  // Get selected school's allowed domains
  const selectedSchool = useMemo(() => {
    return schools.find((s) => s.school_id === schoolId);
  }, [schools, schoolId]);

  const allowedDomains = useMemo(() => {
    if (!selectedSchool?.allowed_domains) return [];
    // Handle both array and JSON string formats
    if (Array.isArray(selectedSchool.allowed_domains)) {
      return selectedSchool.allowed_domains;
    }
    if (typeof selectedSchool.allowed_domains === "string") {
      try {
        return JSON.parse(selectedSchool.allowed_domains);
      } catch {
        return [selectedSchool.allowed_domains];
      }
    }
    return [];
  }, [selectedSchool]);

  // Validate email domain when email or school changes
  useEffect(() => {
    if (!email || !schoolId) {
      setEmailError(null);
      return;
    }

    const validation = validateEmailDomain(email, allowedDomains);
    if (!validation.isValid) {
      setEmailError(validation.error || "Invalid email domain");
    } else {
      setEmailError(null);
    }
  }, [email, schoolId, allowedDomains]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearError();
    setEmailError(null);

    // Validate school selection
    if (!schoolId) {
      useAuthStore.setState({ error: "Please select a school" });
      setIsSubmitting(false);
      return;
    }

    // Validate email domain
    if (email && schoolId) {
      const validation = validateEmailDomain(email, allowedDomains);
      if (!validation.isValid) {
        setEmailError(validation.error || "Invalid email domain");
        useAuthStore.setState({ error: validation.error || "Invalid email domain" });
        setIsSubmitting(false);
        return;
      }
    }

    const result = await signUp(
      email,
      password,
      userType,
      firstName,
      lastName,
      schoolId,
      rememberDevice
    );

    if (result.success) {
      navigate("/home");
    }

    setIsSubmitting(false);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(26, 43, 74, 0.1)', boxShadow: '0 4px 24px rgba(26, 43, 74, 0.08)' }}>
        <CardHeader>
          <CardTitle style={{ color: '#1A2B4A' }}>Create an account</CardTitle>
          <CardDescription style={{ color: '#5A6B7D' }}>
            Enter your information to create your account
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
                <FieldLabel>I am a</FieldLabel>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={userType === "student" ? "default" : "outline"}
                    onClick={() => setUserType("student")}
                    disabled={isSubmitting}
                    className="flex-1"
                    style={userType === "student" ? { backgroundColor: '#1A2B4A', color: '#FFFFFF' } : { borderColor: 'rgba(26, 43, 74, 0.2)', color: '#1A2B4A' }}
                  >
                    Student
                  </Button>
                  <Button
                    type="button"
                    variant={userType === "teacher" ? "default" : "outline"}
                    onClick={() => setUserType("teacher")}
                    disabled={isSubmitting}
                    className="flex-1"
                    style={userType === "teacher" ? { backgroundColor: '#1A2B4A', color: '#FFFFFF' } : { borderColor: 'rgba(26, 43, 74, 0.2)', color: '#1A2B4A' }}
                  >
                    Teacher
                  </Button>
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </Field>

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
                  className={emailError ? "border-destructive" : ""}
                />
                {emailError && (
                  <p className="text-sm text-destructive mt-1">{emailError}</p>
                )}
                {schoolId && allowedDomains.length > 0 && !emailError && email && (
                  <FieldDescription className="text-green-600">
                    ✓ Email domain verified for {selectedSchool?.name}
                  </FieldDescription>
                )}
                {schoolId && allowedDomains.length === 0 && (
                  <FieldDescription className="text-muted-foreground">
                    No domain restrictions configured for this school
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  minLength={6}
                />
                <FieldDescription>
                  Password must be at least 6 characters
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="school">School</FieldLabel>
                {isLoadingSchools ? (
                  <div className="flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                    Loading schools...
                  </div>
                ) : (
                  <>
                    <select
                      id="school"
                      value={schoolId}
                      onChange={(e) => {
                        setSchoolId(e.target.value);
                        // Clear email error when school changes to re-validate
                        setEmailError(null);
                      }}
                      required
                      disabled={isSubmitting || isLoadingSchools}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select a school</option>
                      {schools.length === 0 ? (
                        <option value="" disabled>
                          No schools available
                        </option>
                      ) : (
                        schools.map((school) => (
                          <option key={school.school_id} value={school.school_id}>
                            {school.name}
                          </option>
                        ))
                      )}
                    </select>
                    {schools.length === 0 && !isLoadingSchools && (
                      <FieldDescription className="text-destructive">
                        No schools found. Please ensure schools are added to the database.
                      </FieldDescription>
                    )}
                    {selectedSchool && allowedDomains.length > 0 && (
                      <FieldDescription>
                        Allowed email domains: {allowedDomains.join(", ")}
                      </FieldDescription>
                    )}
                  </>
                )}
              </Field>

              <Field>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-signup"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor="remember-signup"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Remember this device
                  </label>
                </div>
              </Field>
              <Field>
                <Button type="submit" disabled={isSubmitting} className="w-full" style={{ backgroundColor: '#1A2B4A', color: '#FFFFFF' }}>
                  {isSubmitting ? "Creating account..." : "Create account"}
                </Button>
                <FieldDescription className="text-center" style={{ color: '#5A6B7D' }}>
                  Already have an account?{" "}
                  <Link to="/login" className="underline hover:no-underline" style={{ color: '#D97746' }}>
                    Login
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