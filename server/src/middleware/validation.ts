import type { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation error',
        details: result.error.issues,
      });
      return;
    }
    // For body we can assign directly; for query/params store on res.locals
    if (source === 'body') {
      req.body = result.data;
    } else {
      res.locals[source] = result.data;
    }
    next();
  };
}
