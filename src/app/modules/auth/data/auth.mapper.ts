import { AuthUser } from '@app/core/models/auth.model';
import { LoginResponseDTO } from '@openapi';

export function toAuthUser(dto: LoginResponseDTO): AuthUser {
  return {
    username: dto.user.username,
    displayName: dto.user.displayName,
  };
}
