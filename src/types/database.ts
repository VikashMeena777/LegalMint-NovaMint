export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      AuditLog: {
        Row: {
          action: string
          createdAt: string
          id: string
          ipAddress: string | null
          metadata: Json
          resourceId: string | null
          resourceType: string | null
          userAgent: string | null
          userId: string
        }
        Insert: {
          action: string
          createdAt?: string
          id?: string
          ipAddress?: string | null
          metadata?: Json
          resourceId?: string | null
          resourceType?: string | null
          userAgent?: string | null
          userId: string
        }
        Update: {
          action?: string
          createdAt?: string
          id?: string
          ipAddress?: string | null
          metadata?: Json
          resourceId?: string | null
          resourceType?: string | null
          userAgent?: string | null
          userId?: string
        }
        Relationships: [{ foreignKeyName: "AuditLog_userId_fkey"; columns: ["userId"]; isOneToOne: false; referencedRelation: "User"; referencedColumns: ["id"] }]
      }
      BusinessProfile: {
        Row: {
          analyticsTools: Json
          annualRevenue: number | null
          businessEntity: Database["public"]["Enums"]["BusinessEntity"]
          businessType: Database["public"]["Enums"]["BusinessType"]
          cin: string | null
          collectsPersonalData: boolean
          companyName: string
          cookieTypes: Json
          createdAt: string
          dataProtectionOfficer: boolean
          dataTypesCollected: Json
          description: string | null
          dpoEmail: string | null
          employeeCount: number | null
          foundedYear: number | null
          grievanceOfficerEmail: string | null
          gstin: string | null
          hasApiIntegrations: boolean
          hasGrievanceOfficer: boolean
          hasNewsletter: boolean
          hasPaymentProcessing: boolean
          hasUserAccounts: boolean
          id: string
          incorporatedState: string | null
          llpin: string | null
          onboardingCompleted: boolean
          onboardingStep: number
          operatingStates: Json
          pan: string | null
          paymentMethods: Json
          targetAudience: Database["public"]["Enums"]["TargetAudience"]
          targetAudienceMinAge: number | null
          thirdPartyServices: Json
          updatedAt: string
          userId: string
          usesAnalytics: boolean
          usesCookies: boolean
          usesThirdPartyServices: boolean
          website: string | null
        }
        Insert: {
          analyticsTools?: Json
          annualRevenue?: number | null
          businessEntity?: Database["public"]["Enums"]["BusinessEntity"]
          businessType?: Database["public"]["Enums"]["BusinessType"]
          cin?: string | null
          collectsPersonalData?: boolean
          companyName: string
          cookieTypes?: Json
          createdAt?: string
          dataProtectionOfficer?: boolean
          dataTypesCollected?: Json
          description?: string | null
          dpoEmail?: string | null
          employeeCount?: number | null
          foundedYear?: number | null
          grievanceOfficerEmail?: string | null
          gstin?: string | null
          hasApiIntegrations?: boolean
          hasGrievanceOfficer?: boolean
          hasNewsletter?: boolean
          hasPaymentProcessing?: boolean
          hasUserAccounts?: boolean
          id?: string
          incorporatedState?: string | null
          llpin?: string | null
          onboardingCompleted?: boolean
          onboardingStep?: number
          operatingStates?: Json
          pan?: string | null
          paymentMethods?: Json
          targetAudience?: Database["public"]["Enums"]["TargetAudience"]
          targetAudienceMinAge?: number | null
          thirdPartyServices?: Json
          updatedAt: string
          userId: string
          usesAnalytics?: boolean
          usesCookies?: boolean
          usesThirdPartyServices?: boolean
          website?: string | null
        }
        Update: {
          analyticsTools?: Json
          annualRevenue?: number | null
          businessEntity?: Database["public"]["Enums"]["BusinessEntity"]
          businessType?: Database["public"]["Enums"]["BusinessType"]
          cin?: string | null
          collectsPersonalData?: boolean
          companyName?: string
          cookieTypes?: Json
          createdAt?: string
          dataProtectionOfficer?: boolean
          dataTypesCollected?: Json
          description?: string | null
          dpoEmail?: string | null
          employeeCount?: number | null
          foundedYear?: number | null
          grievanceOfficerEmail?: string | null
          gstin?: string | null
          hasApiIntegrations?: boolean
          hasGrievanceOfficer?: boolean
          hasNewsletter?: boolean
          hasPaymentProcessing?: boolean
          hasUserAccounts?: boolean
          id?: string
          incorporatedState?: string | null
          llpin?: string | null
          onboardingCompleted?: boolean
          onboardingStep?: number
          operatingStates?: Json
          pan?: string | null
          paymentMethods?: Json
          targetAudience?: Database["public"]["Enums"]["TargetAudience"]
          targetAudienceMinAge?: number | null
          thirdPartyServices?: Json
          updatedAt?: string
          userId?: string
          usesAnalytics?: boolean
          usesCookies?: boolean
          usesThirdPartyServices?: boolean
          website?: string | null
        }
        Relationships: [{ foreignKeyName: "BusinessProfile_userId_fkey"; columns: ["userId"]; isOneToOne: false; referencedRelation: "User"; referencedColumns: ["id"] }]
      }
      ComplianceAlert: {
        Row: {
          createdAt: string
          description: string | null
          dismissedAt: string | null
          id: string
          isRead: boolean
          regulationId: string | null
          title: string
          type: Database["public"]["Enums"]["AlertType"]
          userId: string
        }
        Insert: {
          createdAt?: string
          description?: string | null
          dismissedAt?: string | null
          id?: string
          isRead?: boolean
          regulationId?: string | null
          title: string
          type: Database["public"]["Enums"]["AlertType"]
          userId: string
        }
        Update: {
          createdAt?: string
          description?: string | null
          dismissedAt?: string | null
          id?: string
          isRead?: boolean
          regulationId?: string | null
          title?: string
          type?: Database["public"]["Enums"]["AlertType"]
          userId?: string
        }
        Relationships: [{ foreignKeyName: "ComplianceAlert_userId_fkey"; columns: ["userId"]; isOneToOne: false; referencedRelation: "User"; referencedColumns: ["id"] }]
      }
      ComplianceMapping: {
        Row: {
          businessProfileId: string
          complianceRequirementId: string
          createdAt: string
          id: string
          lastReviewedAt: string | null
          notes: string | null
          status: Database["public"]["Enums"]["ComplianceStatus"]
          updatedAt: string
        }
        Insert: {
          businessProfileId: string
          complianceRequirementId: string
          createdAt?: string
          id?: string
          lastReviewedAt?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["ComplianceStatus"]
          updatedAt: string
        }
        Update: {
          businessProfileId?: string
          complianceRequirementId?: string
          createdAt?: string
          id?: string
          lastReviewedAt?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["ComplianceStatus"]
          updatedAt?: string
        }
        Relationships: [
          { foreignKeyName: "ComplianceMapping_businessProfileId_fkey"; columns: ["businessProfileId"]; isOneToOne: false; referencedRelation: "BusinessProfile"; referencedColumns: ["id"] },
          { foreignKeyName: "ComplianceMapping_complianceRequirementId_fkey"; columns: ["complianceRequirementId"]; isOneToOne: false; referencedRelation: "ComplianceRequirement"; referencedColumns: ["id"] }
        ]
      }
      ComplianceReport: {
        Row: {
          aiModel: string | null
          aiTokensUsed: number | null
          createdAt: string
          documentId: string
          frameworksChecked: Json
          id: string
          overallRiskScore: number
          status: string
          userId: string
        }
        Insert: {
          aiModel?: string | null
          aiTokensUsed?: number | null
          createdAt?: string
          documentId: string
          frameworksChecked?: Json
          id?: string
          overallRiskScore: number
          status?: string
          userId: string
        }
        Update: {
          aiModel?: string | null
          aiTokensUsed?: number | null
          createdAt?: string
          documentId?: string
          frameworksChecked?: Json
          id?: string
          overallRiskScore?: number
          status?: string
          userId?: string
        }
        Relationships: [
          { foreignKeyName: "ComplianceReport_documentId_fkey"; columns: ["documentId"]; isOneToOne: false; referencedRelation: "Document"; referencedColumns: ["id"] },
          { foreignKeyName: "ComplianceReport_userId_fkey"; columns: ["userId"]; isOneToOne: false; referencedRelation: "User"; referencedColumns: ["id"] }
        ]
      }
      ComplianceRequirement: {
        Row: {
          applicableToBusinessTypes: Json
          applicableToEntityTypes: Json
          category: Database["public"]["Enums"]["ComplianceCategory"]
          createdAt: string
          description: string | null
          effectiveDate: string | null
          id: string
          isMandatory: boolean
          jurisdictionId: string
          name: string
          penaltyDescription: string | null
          regulationUrl: string | null
          updatedAt: string
        }
        Insert: {
          applicableToBusinessTypes?: Json
          applicableToEntityTypes?: Json
          category: Database["public"]["Enums"]["ComplianceCategory"]
          createdAt?: string
          description?: string | null
          effectiveDate?: string | null
          id?: string
          isMandatory?: boolean
          jurisdictionId: string
          name: string
          penaltyDescription?: string | null
          regulationUrl?: string | null
          updatedAt: string
        }
        Update: {
          applicableToBusinessTypes?: Json
          applicableToEntityTypes?: Json
          category?: Database["public"]["Enums"]["ComplianceCategory"]
          createdAt?: string
          description?: string | null
          effectiveDate?: string | null
          id?: string
          isMandatory?: boolean
          jurisdictionId?: string
          name?: string
          penaltyDescription?: string | null
          regulationUrl?: string | null
          updatedAt?: string
        }
        Relationships: [{ foreignKeyName: "ComplianceRequirement_jurisdictionId_fkey"; columns: ["jurisdictionId"]; isOneToOne: false; referencedRelation: "Jurisdiction"; referencedColumns: ["id"] }]
      }
      Document: {
        Row: {
          aiCompletionTokens: number | null
          aiModel: string | null
          aiPromptTokens: number | null
          businessProfileId: string
          content: string
          createdAt: string
          customizations: Json
          generatedByAI: boolean
          id: string
          publishedAt: string | null
          status: Database["public"]["Enums"]["DocumentStatus"]
          templateId: string | null
          title: string
          updatedAt: string
          userId: string
          version: string
        }
        Insert: {
          aiCompletionTokens?: number | null
          aiModel?: string | null
          aiPromptTokens?: number | null
          businessProfileId: string
          content: string
          createdAt?: string
          customizations?: Json
          generatedByAI?: boolean
          id?: string
          publishedAt?: string | null
          status?: Database["public"]["Enums"]["DocumentStatus"]
          templateId?: string | null
          title: string
          updatedAt: string
          userId: string
          version?: string
        }
        Update: {
          aiCompletionTokens?: number | null
          aiModel?: string | null
          aiPromptTokens?: number | null
          businessProfileId?: string
          content?: string
          createdAt?: string
          customizations?: Json
          generatedByAI?: boolean
          id?: string
          publishedAt?: string | null
          status?: Database["public"]["Enums"]["DocumentStatus"]
          templateId?: string | null
          title?: string
          updatedAt?: string
          userId?: string
          version?: string
        }
        Relationships: [
          { foreignKeyName: "Document_businessProfileId_fkey"; columns: ["businessProfileId"]; isOneToOne: false; referencedRelation: "BusinessProfile"; referencedColumns: ["id"] },
          { foreignKeyName: "Document_templateId_fkey"; columns: ["templateId"]; isOneToOne: false; referencedRelation: "DocumentTemplate"; referencedColumns: ["id"] },
          { foreignKeyName: "Document_userId_fkey"; columns: ["userId"]; isOneToOne: false; referencedRelation: "User"; referencedColumns: ["id"] }
        ]
      }
      DocumentExport: {
        Row: {
          createdAt: string
          documentId: string
          format: Database["public"]["Enums"]["ExportFormat"]
          id: string
          storageUrl: string
          userId: string
        }
        Insert: {
          createdAt?: string
          documentId: string
          format: Database["public"]["Enums"]["ExportFormat"]
          id?: string
          storageUrl: string
          userId: string
        }
        Update: {
          createdAt?: string
          documentId?: string
          format?: Database["public"]["Enums"]["ExportFormat"]
          id?: string
          storageUrl?: string
          userId?: string
        }
        Relationships: [
          { foreignKeyName: "DocumentExport_documentId_fkey"; columns: ["documentId"]; isOneToOne: false; referencedRelation: "Document"; referencedColumns: ["id"] },
          { foreignKeyName: "DocumentExport_userId_fkey"; columns: ["userId"]; isOneToOne: false; referencedRelation: "User"; referencedColumns: ["id"] }
        ]
      }
      DocumentTemplate: {
        Row: {
          applicableJurisdictions: Json
          attorneyReviewed: boolean
          category: string | null
          createdAt: string
          id: string
          isActive: boolean
          name: Database["public"]["Enums"]["DocumentType"]
          requiredBusinessFields: Json
          templateContent: string
          updatedAt: string
          version: string
        }
        Insert: {
          applicableJurisdictions?: Json
          attorneyReviewed?: boolean
          category?: string | null
          createdAt?: string
          id?: string
          isActive?: boolean
          name: Database["public"]["Enums"]["DocumentType"]
          requiredBusinessFields?: Json
          templateContent: string
          updatedAt: string
          version?: string
        }
        Update: {
          applicableJurisdictions?: Json
          attorneyReviewed?: boolean
          category?: string | null
          createdAt?: string
          id?: string
          isActive?: boolean
          name?: Database["public"]["Enums"]["DocumentType"]
          requiredBusinessFields?: Json
          templateContent?: string
          updatedAt?: string
          version?: string
        }
        Relationships: []
      }
      DocumentVersion: {
        Row: {
          changeSummary: string | null
          content: string
          createdAt: string
          createdBy: string
          documentId: string
          id: string
          versionNumber: number
        }
        Insert: {
          changeSummary?: string | null
          content: string
          createdAt?: string
          createdBy: string
          documentId: string
          id?: string
          versionNumber: number
        }
        Update: {
          changeSummary?: string | null
          content?: string
          createdAt?: string
          createdBy?: string
          documentId?: string
          id?: string
          versionNumber?: number
        }
        Relationships: [{ foreignKeyName: "DocumentVersion_documentId_fkey"; columns: ["documentId"]; isOneToOne: false; referencedRelation: "Document"; referencedColumns: ["id"] }]
      }
      Jurisdiction: {
        Row: {
          code: string
          consumerProtectionLaw: string | null
          createdAt: string
          dataProtectionLaw: string | null
          ecommerceLaw: string | null
          employmentLaw: string | null
          id: string
          keyRegulations: Json
          name: string
          region: string | null
          updatedAt: string
        }
        Insert: {
          code: string
          consumerProtectionLaw?: string | null
          createdAt?: string
          dataProtectionLaw?: string | null
          ecommerceLaw?: string | null
          employmentLaw?: string | null
          id?: string
          keyRegulations?: Json
          name: string
          region?: string | null
          updatedAt: string
        }
        Update: {
          code?: string
          consumerProtectionLaw?: string | null
          createdAt?: string
          dataProtectionLaw?: string | null
          ecommerceLaw?: string | null
          employmentLaw?: string | null
          id?: string
          keyRegulations?: Json
          name?: string
          region?: string | null
          updatedAt?: string
        }
        Relationships: []
      }
      OnboardingAnswer: {
        Row: {
          answer: string
          businessProfileId: string
          createdAt: string
          id: string
          question: string
          questionKey: string
          stepNumber: number
        }
        Insert: {
          answer: string
          businessProfileId: string
          createdAt?: string
          id?: string
          question: string
          questionKey: string
          stepNumber: number
        }
        Update: {
          answer?: string
          businessProfileId?: string
          createdAt?: string
          id?: string
          question?: string
          questionKey?: string
          stepNumber?: number
        }
        Relationships: [{ foreignKeyName: "OnboardingAnswer_businessProfileId_fkey"; columns: ["businessProfileId"]; isOneToOne: false; referencedRelation: "BusinessProfile"; referencedColumns: ["id"] }]
      }
      Subscription: {
        Row: {
          cancelAtPeriodEnd: boolean
          cashfreeCustomerId: string | null
          cashfreeSubscriptionId: string | null
          createdAt: string
          currentPeriodEnd: string | null
          currentPeriodStart: string | null
          id: string
          plan: Database["public"]["Enums"]["SubscriptionPlan"]
          status: Database["public"]["Enums"]["SubscriptionStatus"]
          trialEndsAt: string | null
          updatedAt: string
          userId: string
        }
        Insert: {
          cancelAtPeriodEnd?: boolean
          cashfreeCustomerId?: string | null
          cashfreeSubscriptionId?: string | null
          createdAt?: string
          currentPeriodEnd?: string | null
          currentPeriodStart?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["SubscriptionPlan"]
          status?: Database["public"]["Enums"]["SubscriptionStatus"]
          trialEndsAt?: string | null
          updatedAt: string
          userId: string
        }
        Update: {
          cancelAtPeriodEnd?: boolean
          cashfreeCustomerId?: string | null
          cashfreeSubscriptionId?: string | null
          createdAt?: string
          currentPeriodEnd?: string | null
          currentPeriodStart?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["SubscriptionPlan"]
          status?: Database["public"]["Enums"]["SubscriptionStatus"]
          trialEndsAt?: string | null
          updatedAt?: string
          userId?: string
        }
        Relationships: [{ foreignKeyName: "Subscription_userId_fkey"; columns: ["userId"]; isOneToOne: false; referencedRelation: "User"; referencedColumns: ["id"] }]
      }
      User: {
        Row: {
          createdAt: string
          email: string
          emailVerified: string | null
          id: string
          image: string | null
          name: string | null
          passwordHash: string | null
          phone: string | null
          phoneVerified: string | null
          role: Database["public"]["Enums"]["UserRole"]
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          email: string
          emailVerified?: string | null
          id?: string
          image?: string | null
          name?: string | null
          passwordHash?: string | null
          phone?: string | null
          phoneVerified?: string | null
          role?: Database["public"]["Enums"]["UserRole"]
          updatedAt: string
        }
        Update: {
          createdAt?: string
          email?: string
          emailVerified?: string | null
          id?: string
          image?: string | null
          name?: string | null
          passwordHash?: string | null
          phone?: string | null
          phoneVerified?: string | null
          role?: Database["public"]["Enums"]["UserRole"]
          updatedAt?: string
        }
        Relationships: []
      }
      Violation: {
        Row: {
          createdAt: string
          description: string
          excerpt: string | null
          id: string
          reportId: string
          severity: string
          suggestion: string
          title: string
        }
        Insert: {
          createdAt?: string
          description: string
          excerpt?: string | null
          id?: string
          reportId: string
          severity: string
          suggestion: string
          title: string
        }
        Update: {
          createdAt?: string
          description?: string
          excerpt?: string | null
          id?: string
          reportId?: string
          severity?: string
          suggestion?: string
          title?: string
        }
        Relationships: [{ foreignKeyName: "Violation_reportId_fkey"; columns: ["reportId"]; isOneToOne: false; referencedRelation: "ComplianceReport"; referencedColumns: ["id"] }]
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: {
      AlertType: "NEW_REGULATION" | "REGULATION_UPDATE" | "DEADLINE_REMINDER" | "DOCUMENT_EXPIRY" | "COMPLIANCE_SCORE_DROP"
      BusinessEntity: "PROPRIETORSHIP" | "PARTNERSHIP" | "LLP" | "PRIVATE_LIMITED" | "PUBLIC_LIMITED" | "OPC" | "SECTION_8" | "HUF" | "OTHER"
      BusinessType: "SAAS" | "ECOMMERCE" | "MARKETPLACE" | "CONTENT" | "FINTECH" | "HEALTHCARE" | "EDTECH" | "MANUFACTURING" | "RETAIL" | "SERVICES" | "AGENCY" | "OTHER"
      ComplianceCategory: "PRIVACY" | "CONSUMER" | "EMPLOYMENT" | "TAX" | "GST" | "CORPORATE" | "LABOUR" | "SECTOR_SPECIFIC" | "ENVIRONMENT" | "IP" | "OTHER"
      ComplianceStatus: "COMPLIANT" | "NON_COMPLIANT" | "IN_PROGRESS" | "NOT_APPLICABLE"
      DocumentStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED"
      DocumentType: "PRIVACY_POLICY" | "TERMS_OF_SERVICE" | "COOKIE_POLICY" | "EMPLOYMENT_AGREEMENT" | "NDA" | "VENDOR_AGREEMENT" | "REFUND_POLICY" | "GRIEVANCE_POLICY" | "LLP_AGREEMENT" | "FOUNDERS_AGREEMENT" | "CONTRACTOR_AGREEMENT" | "CUSTOM"
      ExportFormat: "PDF" | "DOCX" | "HTML" | "MARKDOWN"
      SubscriptionPlan: "FREE" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE"
      SubscriptionStatus: "ACTIVE" | "PAST_DUE" | "CANCELLED" | "TRIALING" | "EXPIRED"
      TargetAudience: "B2B" | "B2C" | "BOTH"
      UserRole: "USER" | "ADMIN"
    }
    CompositeTypes: { [_ in never]: never }
  }
}
