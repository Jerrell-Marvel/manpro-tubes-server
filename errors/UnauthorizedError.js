import { StatusCodes } from "http-status-codes";

export class UnauthorizedError extends Error {
  name = "UnauthorizedError";
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.UNAUTHORIZED;
  }
}
