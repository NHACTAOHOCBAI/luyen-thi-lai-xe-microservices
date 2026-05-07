export type LoginClient = 'mobile-client' | 'web-client';

export class LoginCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly client: LoginClient,
  ) {}
}
