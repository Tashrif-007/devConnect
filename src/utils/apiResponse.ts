export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export class ResponseFormatter {
  static success<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
    };
  }

  static error<T>(error: string, message?: string): ApiResponse<T> {
    return {
      success: false,
      error,
      message,
    };
  }
}
