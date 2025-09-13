// src/auth/jwt-auth.guard.ts

import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';
import { Observable } from 'rxjs'; // Make sure this is imported

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    console.log(`--- JwtAuthGuard RUNNING for route: ${request.method} ${request.url} ---`);
    console.log(`Is this route public? -> ${isPublic}`);

    if (isPublic) {
      console.log('✅ Route is public. Allowing access immediately.');
      return true;
    }

    console.log('Route is NOT public. Proceeding to JWT validation...');
    // IMPORTANT: We log the token here to make sure it's present
    console.log('Authorization Header:', request.headers.authorization);
    
    // Now, we call the original passport-jwt logic
    const result = super.canActivate(context);

    // We need to handle the fact that super.canActivate can return a Promise or Observable
    // We'll log the result if we can.
    Promise.resolve(result).then(can => {
        console.log(`JWT validation result (did it pass?): ${can}`);
    }).catch(err => {
        console.error('💥 ERROR during super.canActivate() validation:', err.message);
    });

    return result;
  }
}