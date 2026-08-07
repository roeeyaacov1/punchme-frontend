export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }

  static async fromResponse(res: Response): Promise<ApiError> {
    let detail = res.statusText;
    let code: string | undefined;
    try {
      const data = await res.json();
      if (typeof data?.detail === "string") detail = data.detail;
      if (typeof data?.code === "string") code = data.code;
    } catch {
      // response wasn't JSON — fall back to statusText
    }
    return new ApiError(res.status, detail, code);
  }
}
