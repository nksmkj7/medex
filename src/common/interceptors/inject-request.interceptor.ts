import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class InjectRequestInterceptor implements NestInterceptor {
  constructor(private type: Array<'query' | 'params'>) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    request.body['_requestContext'] = {};
    request.body['_requestContext']['method'] = request.method;
    this.type.forEach((type) => {
      request.body['_requestContext'][type] = request[type];
    });
    return next.handle();
  }
}
