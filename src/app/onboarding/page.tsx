"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

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
      addAiMessage("Namaste! I'm your LegalEase AI compliance assistant. I'll help you understand which legal documents your Indian business needs and which regulations apply to you.\n\nLet's start — what is the name of your business?");
    }
  }, []);

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
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const currentQuestion = QUESTIONS[currentStep];
  const progress = ((currentStep) / QUESTIONS.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-slate-900">Business Onboarding</h1>
          <span className="text-sm text-slate-500">{currentStep + 1} of {QUESTIONS.length}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 min-h-[400px] max-h-[500px] overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className={`mb-4 ${msg.role === "user" ? "text-right" : ""}`}>
            <div
              className={`inline-block max-w-[85%] px-4 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-slate-100 text-slate-800 rounded-bl-none"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {currentStep < QUESTIONS.length && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          {currentQuestion?.type === "multiselect" ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {currentQuestion.options?.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSelectedOptions((prev) =>
                        prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
                      );
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      selectedOptions.includes(opt)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-slate-700 border-slate-300 hover:border-blue-400"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <button
                onClick={handleNext}
                disabled={selectedOptions.length === 0}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          ) : currentQuestion?.type === "boolean" ? (
            <div className="space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setInputValue("yes");
                    setTimeout(handleNext, 100);
                  }}
                  className="flex-1 py-2.5 rounded-lg font-medium border border-slate-300 hover:bg-green-50 hover:border-green-400 transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={() => {
                    setInputValue("no");
                    setTimeout(handleNext, 100);
                  }}
                  className="flex-1 py-2.5 rounded-lg font-medium border border-slate-300 hover:bg-red-50 hover:border-red-400 transition-colors"
                >
                  No
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNext()}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Type your answer..."
                autoFocus
              />
              <button
                onClick={handleNext}
                disabled={!inputValue.trim() || loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Send"}
              </button>
            </div>
          )}
        </div>
      )}

      {currentStep >= QUESTIONS.length && (
        <div className="text-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
