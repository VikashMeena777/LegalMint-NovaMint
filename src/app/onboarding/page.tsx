"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Scale, Send, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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

const QUESTIONS = [
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
    prompt: "In which states do you operate or have customers? (Select all that apply)",
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
    options: ["Below ₹20 Lakh", "₹20 Lakh - ₹5 Crore", "₹5 Crore - ₹50 Crore", "Above ₹50 Crore"],
  },
  {
    key: "collectsPersonalData",
    prompt: "Do you collect personal data from users (name, email, phone, etc.)?",
    type: "boolean",
  },
  {
    key: "dataTypes",
    prompt: "What types of personal data do you collect? (Select all that apply)",
    type: "multiselect",
    options: ["Email", "Name", "Phone Number", "Address", "Payment Info", "Aadhaar", "PAN", "Location Data", "Health Data", "Browsing Behavior"],
  },
  {
    key: "usesCookies",
    prompt: "Do you use cookies or tracking technologies on your website/app?",
    type: "boolean",
  },
  {
    key: "hasUserAccounts",
    prompt: "Do users create accounts on your platform?",
    type: "boolean",
  },
  {
    key: "hasPaymentProcessing",
    prompt: "Do you process payments (UPI, cards, net banking)?",
    type: "boolean",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Partial<BusinessProfile>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      const saved = localStorage.getItem("onboarding_progress");
      if (saved) {
        try {
          const { step, profile: savedProfile, messages: savedMessages } = JSON.parse(saved);
          if (savedMessages?.length > 0) setMessages(savedMessages);
          if (savedProfile) setProfile(savedProfile);
          if (step > 0) {
            setCurrentStep(step);
            const nextQuestion = QUESTIONS[step];
            if (nextQuestion) {
              setTimeout(() => {
                addAiMessage(nextQuestion.prompt + (nextQuestion.options ? `\n\nOptions: ${nextQuestion.options.join(" | ")}` : ""));
              }, 500);
            }
          } else {
            addAiMessage("Namaste! I'm your LegalMint AI compliance assistant. I'll help you understand which legal documents your Indian business needs and which regulations apply to you.\n\nLet's start — what is the name of your business?");
          }
        } catch {
          localStorage.removeItem("onboarding_progress");
          addAiMessage("Namaste! I'm your LegalMint AI compliance assistant. I'll help you understand which legal documents your Indian business needs and which regulations apply to you.\n\nLet's start — what is the name of your business?");
        }
      } else {
        addAiMessage("Namaste! I'm your LegalMint AI compliance assistant. I'll help you understand which legal documents your Indian business needs and which regulations apply to you.\n\nLet's start — what is the name of your business?");
      }
    }
  }, []);

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

  const addAiMessage = (content: string) => {
    setMessages((prev) => [...prev, { role: "ai", content }]);
  };

  const addUserMessage = (content: string) => {
    setMessages((prev) => [...prev, { role: "user", content }]);
  };

  const handleNext = async () => {
    const question = QUESTIONS[currentStep];
    if (!question) return;

    let answer: string | string[] | boolean = "";

    if (question.type === "text") {
      answer = inputValue.trim();
      if (!answer) return;
    } else if (question.type === "select") {
      answer = inputValue.trim();
      if (!answer) return;
    } else if (question.type === "multiselect") {
      answer = selectedOptions;
      if (answer.length === 0) return;
    } else if (question.type === "boolean") {
      answer = inputValue.toLowerCase() === "yes" || inputValue.toLowerCase() === "true";
    }

    addUserMessage(Array.isArray(answer) ? answer.join(", ") : String(answer));
    setProfile((prev) => ({ ...prev, [question.key]: answer }));
    setInputValue("");
    setSelectedOptions([]);

    const nextStep = currentStep + 1;
    if (nextStep < QUESTIONS.length) {
      setCurrentStep(nextStep);
      const nextQuestion = QUESTIONS[nextStep];
      setTimeout(() => {
        addAiMessage(nextQuestion.prompt + (nextQuestion.options ? `\n\nOptions: ${nextQuestion.options.join(" | ")}` : ""));
      }, 500);
    } else {
      setLoading(true);
      addAiMessage("Thank you! I'm now generating your personalized compliance roadmap based on your business profile...");
      await completeOnboarding(profile as BusinessProfile);
    }
  };

  const completeOnboarding = async (finalProfile: BusinessProfile) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to complete onboarding");
        router.push("/login");
        return;
      }

      const businessTypeMap: Record<string, string> = {
        "SaaS": "SAAS", "E-commerce": "ECOMMERCE", "Marketplace": "MARKETPLACE",
        "EdTech": "EDTECH", "Fintech": "FINTECH", "Healthcare": "HEALTHCARE",
        "Agency/Services": "AGENCY", "Retail": "RETAIL", "Manufacturing": "MANUFACTURING",
        "Content/Media": "CONTENT", "Other": "OTHER",
      };

      const entityMap: Record<string, string> = {
        "Proprietorship": "PROPRIETORSHIP", "Partnership": "PARTNERSHIP", "LLP": "LLP",
        "Private Limited": "PRIVATE_LIMITED", "OPC (One Person Company)": "OPC",
        "Public Limited": "PUBLIC_LIMITED", "Section 8 Company": "SECTION_8", "HUF": "HUF",
      };

      const { error } = await supabase.from("BusinessProfile").insert({
        userId: user.id,
        companyName: finalProfile.businessName,
        businessType: (businessTypeMap[finalProfile.businessType] || "OTHER") as any,
        businessEntity: (entityMap[finalProfile.businessEntity] || "PROPRIETORSHIP") as any,
        incorporatedState: finalProfile.registrationState,
        operatingStates: finalProfile.operatingStates || [],
        employeeCount: parseInt(finalProfile.employeeCount?.split("-")[0] || "0") || 0,
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
        return;
      }

      addAiMessage("Your compliance roadmap is ready! Based on your business profile, I've identified the key regulations that apply to you and the documents you need.\n\nClick 'Go to Dashboard' to view your compliance roadmap and start generating documents.");
      setLoading(false);
      localStorage.removeItem("onboarding_progress");
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const currentQuestion = QUESTIONS[currentStep];
  const progress = ((currentStep) / QUESTIONS.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-foreground hidden sm:block">
            Legal<span className="text-primary">Mint</span> AI
          </span>
        </Link>
      </div>

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-semibold text-foreground">Business Onboarding</h1>
          <Badge variant="default">{currentStep + 1} / {QUESTIONS.length}</Badge>
        </div>
        <Progress value={progress} color="default" size="sm" />
      </div>

      {/* Chat Messages */}
      <Card className="border-border/50">
        <CardContent className="p-4 min-h-[400px] max-h-[500px] overflow-y-auto space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] px-4 py-3 rounded-xl text-sm whitespace-pre-wrap leading-relaxed ${
                  msg.role === "user"
                    ? "gradient-primary text-white rounded-br-md"
                    : "bg-muted text-muted-foreground rounded-bl-md"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted text-muted-foreground px-4 py-3 rounded-xl rounded-bl-md flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
      </Card>

      {/* Input Area */}
      {currentStep < QUESTIONS.length && (
        <Card className="border-border/50">
          <CardContent className="p-4">
            {currentQuestion?.type === "multiselect" ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {currentQuestion.options?.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSelectedOptions((prev) =>
                          prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
                        );
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                        selectedOptions.includes(opt)
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-background text-muted-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      {selectedOptions.includes(opt) && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />}
                      {opt}
                    </button>
                  ))}
                </div>
                <Button
                  onClick={handleNext}
                  disabled={selectedOptions.length === 0}
                  className="w-full"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ) : currentQuestion?.type === "boolean" ? (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 py-6 text-base"
                  onClick={() => {
                    setInputValue("yes");
                    setTimeout(handleNext, 100);
                  }}
                >
                  <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-500" />
                  Yes
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 py-6 text-base"
                  onClick={() => {
                    setInputValue("no");
                    setTimeout(handleNext, 100);
                  }}
                >
                  No
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleNext()}
                  placeholder="Type your answer..."
                  autoFocus
                  className="flex-1"
                />
                <Button
                  onClick={handleNext}
                  disabled={!inputValue.trim() || loading}
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Complete */}
      {currentStep >= QUESTIONS.length && (
        <div className="text-center">
          <Button
            onClick={() => router.push("/dashboard")}
            size="lg"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
