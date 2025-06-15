export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleApiError = (error: unknown): string => {
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Une erreur inattendue s\'est produite';
};

export const logError = (error: unknown, context?: string) => {
  const message = handleApiError(error);
  console.error(`[${context ?? 'App'}] Error:`, message, error);
};
