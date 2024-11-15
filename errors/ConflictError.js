import { StatusCodes } from "http-status-codes";

export class ConflictError extends Error {
  name = "ConflictError";
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.CONFLICT;
  }
}
