import { EnvironmentService } from '../environment';
import { AuthGuard } from './auth-guard.service';
import { AuthService } from './auth.service';
import { HTTP_PROVIDER } from './http';
import { REQUEST_PROVIDER } from './request-options';

export const AUTH_PROVIDERS = [
  EnvironmentService,
  AuthGuard,
  AuthService,
  HTTP_PROVIDER,
  REQUEST_PROVIDER
];

export * from './auth.service';
