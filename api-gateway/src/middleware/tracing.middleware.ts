import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TracingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TracingMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const traceId = req.headers['x-trace-id'] as string || uuidv4();
    if (!req.headers['x-trace-id']) {
      req.headers['x-trace-id'] = traceId;
      this.logger.log(`Generated new trace ID: ${traceId}`, 'TraceID Generation');
    } else {
      this.logger.log(`Using existing trace ID: ${traceId}`, 'TraceID Usage');
    }


    this.logger.log(`Incoming Request - Trace ID: ${traceId}, Method: ${req.method}, URL: ${req.originalUrl}`, 'Request Start');


    res.on('finish', () => {
      this.logger.log(`Request Completed - Trace ID: ${traceId}, Status Code: ${res.statusCode}`, 'Request End');
    });

    next();
  }
}
