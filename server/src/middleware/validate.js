import { ZodError } from "zod";
import { HttpError } from "../utils/httpError.js";

export function validate(schemas) {
  return (req, _res, next) => {
    try {
      if (schemas.params) schemas.params.parse(req.params);
      if (schemas.query) schemas.query.parse(req.query);
      if (schemas.body) schemas.body.parse(req.body ?? {});
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(new HttpError(
          400,
          "Request validation failed",
          error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          }))
        ));
      }
      next(error);
    }
  };
}
