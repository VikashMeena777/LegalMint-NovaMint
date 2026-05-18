"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/Logo";
import type { Database } from "@/types/database";

interface Message {
  role: "ai" | "user";
  content: string;
}

interface BusinessProfile {
  businessName: string;
  businessType: string;
  businessEntity: string;
  registrationState: string;
  operatingStates: string[];
  collectsPersonalData: boolean;
  dataTypes: string[];
  usesCookies: boolean;
  hasUserAccounts: boolean;
  hasPaymentProcessing: boolean;
  employeeCount: string;
  annualRevenue: string;
}

type QuestionType = "text" | "select" | "multiselect" | "boolean";
type AnswerValue = string | string[] | boolean;
type BusinessType = Database["public"]["Enums"]["BusinessType"];
type BusinessEntity = Database["public"]["Enums"]["BusinessEntity"];

interface Question {
  key: keyof BusinessProfile;
  prompt: string;
  type: QuestionType;
  options?: string[];
}

const QUESTIONS: Question[] = [
  {
    key: "businessName",
    prompt: "What is the name of your business?",
    type: "text",
  },
  {
    key: "businessType",
    prompt: "What type of business do you operate?",
    type: "select",
    options: ["SaaS", "E-commerce", "Marketplace", "EdTech", "Fintech", "Healthcare", "Agency/Services", "Retail", "Manufacturing", "Content/Media", "Other"],
  },
  {
    key: "businessEntity",
    prompt: "What is your business structure?",
    type: "select",
    options: ["Proprietorship", "Partnership", "LLP", "Private Limited", "OPC (One Person Company)", "Public Limited", "Section 8 Company", "HUF"],
  },
  {
    key: "registrationState",
    prompt: "In which Indian state is your business registered?",
    type: "select",
    options: ["Karnataka", "Maharashtra", "Delhi", "Tamil Nadu", "Gujarat", "Rajasthan", "Telangana", "Uttar Pradesh", "West Bengal", "Kerala", "Andhra Pradesh", "Madhya Pradesh", "Punjab", "Haryana", "Bihar", "Odisha", "Other"],
  },
  {
    key: "operatingStates",
    prompt: "In which states do you operate or have customers?",
    type: "multiselect",
    options: ["Karnataka", "Maharashtra", "Delhi", "Tamil Nadu", "Gujarat", "Rajasthan", "Telangana", "Uttar Pradesh", "West Bengal", "All India"],
  },
  {
    key: "employeeCount",
    prompt: "How many employees do you have?",
    type: "select",
    options: ["0 (Solo)", "1-9", "10-19", "20-49", "50-99", "100+"],
  },
  {
    key: "annualRevenue",
    prompt: "What is your approximate annual turnover?",
    type: "select",
    options: ["Below Rs. 20 Lakh", "Rs. 20 Lakh - Rs. 5 Crore", "Rs. 5 Crore - Rs. 50 Crore", "Above Rs. 50 Crore"],
  },
  {
    key: "collectsPersonalData",
    prompt: "Do you collect personal data from users, such as name, email, or phone number?",
    type: "boolean",
  },
  {
    key: "dataTypes",
    prompt: "What types of personal data do you collect?",
    type: "multiselect",
    options: ["Email", "Name", "Phone Number", "Address", "Payment Info", "Aadhaar", "PAN", "Location Data", "Health Data", "Browsing Behavior"],
  },
  {
    key: "usesCookies",
    prompt: "Do you use cookies or tracking technologies on your website or app?",
    type: "boolean",
  },
  {
    key: "hasUserAccounts",
    prompt: "Do users create accounts on your platform?",
    type: "boolean",
  },
  {
    key: "hasPaymentProcessing",
    prompt: "Do you process payments through UPI, cards, or net banking?",
    type: "boolean",
  },
];

function formatAnswer(answer: AnswerValue) {
  if (Array.isArray(answer)) return answer.join(", ");
  if (typeof answer === "boolean") return answer ? "Yes" : "No";
  return answer;
}

function parseEmployeeCount(value?: string) {
  if (!value) return 0;
  if (value.startsWith("100")) return 100;
  const parsed = Number.parseInt(value.split("-")[0], 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function parseAnnualRevenue(value?: string) {
  if (!value) return null;
  if (value.includes("20 Lakh")) return 2000000;
  if (value.includes("5 Crore")) return 50000000;
  if (value.includes("50 Crore")) return 500000000;
  return null;
}

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Partial<BusinessProfile>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  const addAiMessage = useCallback((content: string) => {
    setMessages((prev) => [...prev, { role: "ai", content }]);
  }, []);

  const addUserMessage = useCallback((content: string) => {
    setMessages((prev) => [...prev, { role: "user", content }]);
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const saved = localStorage.getItem("onboarding_progress");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as {
          step?: number;
          profile?: Partial<BusinessProfile>;
          messages?: Message[];
        };

        if (parsed.messages?.length) setMessages(parsed.messages);
        if (parsed.profile) setProfile(parsed.profile);
        if (typeof parsed.step === "number" && parsed.step >= 0 && parsed.step < QUESTIONS.length) {
          setCurrentStep(parsed.step);
        }
        if (parsed.messages?.length) return;
      } catch {
        localStorage.removeItem("onboarding_progress");
      }
    }

    addAiMessage("Namaste. I will build your Indian compliance profile and identify the documents and requirements that apply. Let us start with your business name.");
  }, [addAiMessage]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("onboarding_progress", JSON.stringify({
        step: currentStep,
        profile,
        messages,
      }));
    }
  }, [messages, currentStep, profile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const completeOnboarding = useCallback(async (finalProfile: BusinessProfile) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to complete onboarding");
        router.push("/login");
        setLoading(false);
        return false;
      }

      const businessTypeMap: Record<string, BusinessType> = {
        "SaaS": "SAAS",
        "E-commerce": "ECOMMERCE",
        "Marketplace": "MARKETPLACE",
        "EdTech": "EDTECH",
        "Fintech": "FINTECH",
        "Healthcare": "HEALTHCARE",
        "Agency/Services": "AGENCY",
        "Retail": "RETAIL",
        "Manufacturing": "MANUFACTURING",
        "Content/Media": "CONTENT",
        "Other": "OTHER",
      };

      const entityMap: Record<string, BusinessEntity> = {
        "Proprietorship": "PROPRIETORSHIP",
        "Partnership": "PARTNERSHIP",
        "LLP": "LLP",
        "Private Limited": "PRIVATE_LIMITED",
        "OPC (One Person Company)": "OPC",
        "Public Limited": "PUBLIC_LIMITED",
        "Section 8 Company": "SECTION_8",
        "HUF": "HUF",
      };

      const { error } = await supabase.from("BusinessProfile").insert({
        userId: user.id,
        companyName: finalProfile.businessName,
        businessType: businessTypeMap[finalProfile.businessType] || "OTHER",
        businessEntity: entityMap[finalProfile.businessEntity] || "PROPRIETORSHIP",
        incorporatedState: finalProfile.registrationState,
        operatingStates: finalProfile.operatingStates || [],
        employeeCount: parseEmployeeCount(finalProfile.employeeCount),
        annualRevenue: parseAnnualRevenue(finalProfile.annualRevenue),
        collectsPersonalData: finalProfile.collectsPersonalData || false,
        dataTypesCollected: finalProfile.dataTypes || [],
        usesCookies: finalProfile.usesCookies || false,
        hasUserAccounts: finalProfile.hasUserAccounts || false,
        hasPaymentProcessing: finalProfile.hasPaymentProcessing || false,
        onboardingCompleted: true,
        onboardingStep: QUESTIONS.length,
        updatedAt: new Date().toISOString(),
      });

      if (error) {
        toast.error("Failed to save profile: " + error.message);
        setLoading(false);
        return false;
      }

      addAiMessage("Your compliance roadmap is ready. Go to the dashboard to review your obligations and generate the documents you need first.");
      localStorage.removeItem("onboarding_progress");
      setLoading(false);
      return true;
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
      return false;
    }
  }, [addAiMessage, router, supabase]);

  const handleNext = async (explicitAnswer?: AnswerValue) => {
    const question = QUESTIONS[currentStep];
    if (!question || loading) return;

    let answer: AnswerValue | null = explicitAnswer ?? null;

    if (answer === null) {
      if (question.type === "text") {
        answer = inputValue.trim();
      } else if (question.type === "multiselect") {
        answer = selectedOptions;
      } else if (question.type === "select") {
        answer = inputValue.trim();
      }
    }

    if (answer === null) return;
    if (typeof answer === "string" && !answer.trim()) return;
    if (Array.isArray(answer) && answer.length === 0) return;

    const nextProfile = { ...profile, [question.key]: answer };

    addUserMessage(formatAnswer(answer));
    setProfile(nextProfile);
    setInputValue("");
    setSelectedOptions([]);

    const nextStep = currentStep + 1;
    if (nextStep < QUESTIONS.length) {
      setCurrentStep(nextStep);
      window.setTimeout(() => {
        addAiMessage(QUESTIONS[nextStep].prompt);
      }, 250);
      return;
    }

    setLoading(true);
    addAiMessage("Thank you. I am generating your personalized compliance roadmap from these answers.");
    const saved = await completeOnboarding(nextProfile as BusinessProfile);
    if (saved) {
      setCurrentStep(nextStep);
    }
  };

  const currentQuestion = QUESTIONS[currentStep];
  const progress = Math.round((currentStep / QUESTIONS.length) * 100);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Logo size="sm" />
        <Badge variant="default">{Math.min(currentStep + 1, QUESTIONS.length)} / {QUESTIONS.length}</Badge>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-foreground">Business Onboarding</h1>
          <span className="text-sm text-muted-foreground">{progress}% complete</span>
        </div>
        <Progress value={progress} color="default" size="sm" />
      </div>

      <Card className="border-border">
        <CardContent className="max-h-[52vh] min-h-[360px] space-y-4 overflow-y-auto p-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[88%] rounded-lg px-4 py-3 text-sm leading-6 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
      </Card>

      {currentStep < QUESTIONS.length && currentQuestion && (
        <Card className="border-border">
          <CardContent className="space-y-4 p-4">
            <p className="text-sm font-medium text-foreground">{currentQuestion.prompt}</p>

            {currentQuestion.type === "multiselect" && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {currentQuestion.options?.map((opt) => {
                    const selected = selectedOptions.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setSelectedOptions((prev) =>
                            prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
                          );
                        }}
                        className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {selected && <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />}
                        {opt}
                      </button>
                    );
                  })}
                </div>
                <Button
                  onClick={() => void handleNext()}
                  disabled={selectedOptions.length === 0 || loading}
                  className="w-full"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {currentQuestion.type === "select" && (
              <div className="grid gap-2 sm:grid-cols-2">
                {currentQuestion.options?.map((opt) => (
                  <Button
                    key={opt}
                    type="button"
                    variant="outline"
                    className="justify-start whitespace-normal text-left"
                    onClick={() => void handleNext(opt)}
                    disabled={loading}
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            )}

            {currentQuestion.type === "boolean" && (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="py-6 text-base"
                  onClick={() => void handleNext(true)}
                  disabled={loading}
                >
                  <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-500" />
                  Yes
                </Button>
                <Button
                  variant="outline"
                  className="py-6 text-base"
                  onClick={() => void handleNext(false)}
                  disabled={loading}
                >
                  No
                </Button>
              </div>
            )}

            {currentQuestion.type === "text" && (
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleNext();
                  }}
                  placeholder="Type your answer..."
                  autoFocus
                  className="flex-1"
                />
                <Button
                  onClick={() => void handleNext()}
                  disabled={!inputValue.trim() || loading}
                  size="icon"
                  aria-label="Send answer"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {currentStep >= QUESTIONS.length && (
        <div className="text-center">
          <Button
            onClick={() => router.push("/dashboard")}
            size="lg"
          >
            Go to Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
