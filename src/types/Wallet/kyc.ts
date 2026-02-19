export interface KYCApiResponse {
  data: {
    message?: string;
    PENDING?: any;
    edd?: {
      behavior: EDDBehaviorEnum;
      required_documents: string[];
      remaining_attempts: number;
      errors: string[];
    };
    kyc: string[];
  };
}

export enum EDDBehaviorEnum {
  MANUAL_REVIEW = "MANUAL_REVIEW",
  RETRY_KYC = "RETRY_KYC",
  REJECT_KYC = "REJECT_KYC",
  PENDING_KYC = "PENDING_KYC",
}
