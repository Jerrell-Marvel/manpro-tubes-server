import { StatusCodes } from "http-status-codes";

export class UnprocessableEntityError extends Error {
  name = "UnprocessableEntity";
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.UNPROCESSABLE_ENTITY;
  }
}
