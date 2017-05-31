import { EnvironmentService } from '../environment';
import { AuthGuard } from './auth-guard.service';
import { AuthService } from './auth.service';
import { HTTP_PROVIDER } from './http';

export const AUTH_PROVIDERS = [
  EnvironmentService,
  AuthGuard,
  AuthService,
  HTTP_PROVIDER,
];

export * from './auth.service';
