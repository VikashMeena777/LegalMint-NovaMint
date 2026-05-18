import OpenAI from "openai";

const nimClient = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_NIM_API_KEY || "",
});

const groqClient = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY || "",
});

export interface GenerateDocumentParams {
  templateContent: string;
  businessProfile: Record<string, unknown>;
  documentType: string;
  jurisdictions: string[];
}

export async function generateDocument(params: GenerateDocumentParams): Promise<string> {
  const { templateContent, businessProfile, documentType, jurisdictions } = params;

  const systemPrompt = getSystemPrompt(documentType, jurisdictions);
  const userPrompt = buildUserPrompt(templateContent, businessProfile);

  try {
    const response = await nimClient.chat.completions.create({
      model: process.env.PRIMARY_LLM_MODEL || "meta/llama-3.1-70b-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.1,
      max_tokens: 16384,
    });

    return response.choices[0]?.message?.content || "";
  } catch (nimError) {
    console.error("NVIDIA NIM failed, falling back to Groq:", nimError);

    try {
      const response = await groqClient.chat.completions.create({
        model: process.env.FALLBACK_LLM_MODEL || "llama-3.1-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.1,
        max_tokens: 8192,
      });

      return response.choices[0]?.message?.content || "";
    } catch (groqError) {
      console.error("Groq fallback also failed:", groqError);
      throw new Error("Both NVIDIA NIM and Groq failed to generate document");
    }
  }
}

export async function generateComplianceRoadmap(params: {
  businessProfile: Record<string, unknown>;
  jurisdictions: string[];
}): Promise<string> {
  const { businessProfile, jurisdictions } = params;

  const systemPrompt = `You are LegalMint AI, an Indian compliance mapping specialist. Generate a detailed compliance roadmap for an Indian business based on their profile and applicable jurisdictions.

Output a JSON object with:
- applicableRegulations: Array of Indian regulations that apply
- requirements: Array of specific compliance requirements with category, description, source regulation
- complianceGaps: Array of gaps with severity and remediation
- actionItems: Prioritized action items

Use Indian legal terminology and reference specific sections of Indian acts.`;

  const userPrompt = `Generate a compliance roadmap for the following Indian business:

Business Profile:
${JSON.stringify(businessProfile, null, 2)}

Jurisdictions: ${jurisdictions.join(", ")}

Consider all applicable Indian regulations including DPDP Act 2023, IT Act 2000, Consumer Protection Act 2019, Companies Act 2013, GST Act 2017, Indian Contract Act 1872, and relevant state laws.`;

  try {
    const response = await nimClient.chat.completions.create({
      model: process.env.PRIMARY_LLM_MODEL || "meta/llama-3.1-70b-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.0,
      max_tokens: 8192,
    });

    return response.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Failed to generate compliance roadmap:", error);
    throw error;
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await nimClient.embeddings.create({
      model: process.env.EMBEDDING_MODEL || "nvidia/nv-embedqa-e5-v5:1",
      input: text,
      encoding_format: "float",
    });

    return response.data[0]?.embedding || [];
  } catch (error) {
    console.error("Failed to generate embedding:", error);
    return [];
  }
}

function getSystemPrompt(documentType: string, jurisdictions: string[]): string {
  const base = `You are LegalMint AI, an automated legal document assistant for Indian businesses. You are NOT a lawyer and do NOT provide legal advice. Generate a professionally formatted, jurisdiction-aware legal document for Indian businesses.`;

  const jurisdictionContext = `JURISDICTION: ${jurisdictions.join(", ")} (India)
- Use Indian legal terminology: "Data Principal", "Data Fiduciary", "Advocate", "Private Limited Company"
- Reference specific Indian acts and sections
- Include mandatory disclaimer at the end`;

  const docSpecific = getDocumentSpecificInstructions(documentType);

  return `${base}\n\n${jurisdictionContext}\n\n${docSpecific}`;
}

function getDocumentSpecificInstructions(documentType: string): string {
  const instructions: Record<string, string> = {
    PRIVACY_POLICY: "Generate a DPDP Act 2023 compliant Privacy Policy. Include: data collection, purpose, consent, Data Principal rights, grievance redressal, data retention, cross-border transfer.",
    TERMS_OF_SERVICE: "Generate Terms of Service compliant with Indian Contract Act 1872 and Consumer Protection Act 2019. Include: eligibility, acceptable use, IP, limitation of liability, governing law, grievance redressal.",
    COOKIE_POLICY: "Generate a Cookie Policy compliant with IT Rules 2021. Include: cookie types, purposes, management, consent.",
    EMPLOYMENT_AGREEMENT: "Generate an Employment Agreement compliant with Indian labour laws. Include: compensation, PF/ESI, leave, termination, non-compete (note Section 27 limitation).",
    NDA: "Generate an NDA compliant with Indian Contract Act 1872. Include: definition, obligations, term, remedies under Specific Relief Act 1963.",
    REFUND_POLICY: "Generate a Refund & Cancellation Policy compliant with Consumer Protection (E-Commerce) Rules 2020.",
    GRIEVANCE_POLICY: "Generate a Grievance Redressal Policy compliant with IT Rules 2021 and Consumer Protection Act 2019.",
  };

  return instructions[documentType] || "Generate a professional legal document appropriate for the business type and jurisdiction.";
}

function buildUserPrompt(templateContent: string, businessProfile: Record<string, unknown>): string {
  return `Generate a complete legal document based on the following template and business information.

TEMPLATE:
${templateContent}

BUSINESS INFORMATION:
${JSON.stringify(businessProfile, null, 2)}

Instructions:
1. Fill in all template variables with the business information
2. Remove any conditional blocks that don't apply
3. Generate complete, publication-ready content
4. Include the mandatory legal disclaimer at the end
5. Use Indian legal terminology and cite specific Indian laws where applicable`;
}
