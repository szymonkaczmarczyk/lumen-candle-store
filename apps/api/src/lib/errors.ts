export class HttpError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: string,
  ) {
    super(code);
  }
}

export const notFound = (code = "not_found") => new HttpError(404, code);
export const badRequest = (code: string) => new HttpError(400, code);
export const unauthorized = () => new HttpError(401, "unauthorized");
export const forbidden = () => new HttpError(403, "forbidden");
export const conflict = (code: string) => new HttpError(409, code);
