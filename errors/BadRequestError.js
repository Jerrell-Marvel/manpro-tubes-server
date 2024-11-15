import { StatusCodes } from "http-status-codes";

export class BadRequestError extends Error {
  name = "BadRequestError";
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}
