import type { ProviderErrorCode } from "@/types";

export class ProviderError extends Error {
  readonly code: ProviderErrorCode;
  readonly status: number;

  constructor(code: ProviderErrorCode, message: string, status: number) {
    super(message);
    this.name = "ProviderError";
    this.code = code;
    this.status = status;
  }
}
