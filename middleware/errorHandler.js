import { StatusCodes } from "http-status-codes";
export const errorHandler = (err, req, res, next) => {
  console.log(JSON.stringify(err));

  let customError = {
    success: false,
    name: err.name || "Internal server error",
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message || "Something went wrong try again later",
  };

  if (err.name === "MulterError") {
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  return res.status(customError.statusCode).json(customError);
};
