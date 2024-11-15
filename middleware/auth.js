import jwt from "jsonwebtoken";
import { BadRequestError } from "../errors/BadRequestError.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import { ForbiddenError } from "../errors/ForbiddenError.js";

export const authMiddleware = (authRole) => {
  return async (req, res, next) => {
    if (authRole !== "pengguna" && authRole !== "admin") {
      return next(new Error("Invalid role"));
    }

    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return next(new BadRequestError("Authorization header must be provided"));
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return next(new UnauthorizedError("Token not provided"));
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);

      if (payload.role !== authRole) {
        next(new ForbiddenError("You don't have permission"));
      }

      req.user = {
        penggunaId: payload.pengguna_id,
        role: payload.role,
      };

      console.log(req.user);
      next();
    } catch (err) {
      throw new UnauthorizedError("Invalid token");
    }
  };
};
