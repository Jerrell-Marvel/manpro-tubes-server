import { StatusCodes } from "http-status-codes";

export class ForbiddenError extends Error {
  name = "ForbiddenError";
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.FORBIDDEN;
  }
}
