import { StatusCodes } from "http-status-codes";

export class InternalServerError extends Error {
  name = "InternalServerError";
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  }
}
