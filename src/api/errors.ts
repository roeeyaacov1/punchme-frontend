export class ApiError extends Error {
  status: number;
  code?: string;
  /** Any further keys the JSON error body carried (e.g. a 429's
   * `next_allowed_at`) — `detail` and `code` are already on the error. */
  extra: Record<string, unknown>;

  constructor(
    status: number,
    message: string,
    code?: string,
    extra: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.extra = extra;
  }

  static async fromResponse(res: Response): Promise<ApiError> {
    let detail = res.statusText;
    let code: string | undefined;
    let extra: Record<string, unknown> = {};
    try {
      const data = await res.json();
      if (typeof data?.detail === "string") detail = data.detail;
      if (typeof data?.code === "string") code = data.code;
      if (data && typeof data === "object") {
        extra = { ...(data as Record<string, unknown>) };
        delete extra.detail;
        delete extra.code;
      }
    } catch {
      // response wasn't JSON — fall back to statusText
    }
    return new ApiError(res.status, detail, code, extra);
  }
}
