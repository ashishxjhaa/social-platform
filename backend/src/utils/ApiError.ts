class ApiError extends Error {
  constructor(
    public statusCode: number,
    message = "Something went wrong",
  ) {
    super(message);

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
