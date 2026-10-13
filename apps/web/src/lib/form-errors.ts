import type { ZodError } from "zod";

const messageKeyByField: Record<string, string> = {
  email: "email",
  "address.postalCode": "postalCode",
  postalCode: "postalCode",
  "address.phone": "phone",
  phone: "phone",
  parcelLockerCode: "lockerCode",
  acceptTerms: "acceptTerms",
  password: "passwordLength",
};

export function fieldErrorsFrom(error: ZodError | { issues: { path: PropertyKey[] | string; code: string }[] }): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = Array.isArray(issue.path) ? issue.path.map(String).join(".") : String(issue.path);
    if (result[path]) continue;
    const isEmpty = issue.code === "too_small" && path !== "password";
    result[path] = isEmpty ? "required" : issue.code === "too_big" ? "tooLong" : (messageKeyByField[path] ?? "required");
  }
  return result;
}
