import { StatusCodes } from "http-status-codes";

export class PayloadTooLarge extends Error {
  name = "PayloadTooLarge";
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.REQUEST_TOO_LONG;
  }
}
