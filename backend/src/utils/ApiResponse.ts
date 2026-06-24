class ApiResponse<T> {
  constructor(
    public statusCode: number,
    public data: T,
    public message: string = "Success",
    public readonly success: boolean = statusCode < 400,
  ) {}
}

export default ApiResponse;
