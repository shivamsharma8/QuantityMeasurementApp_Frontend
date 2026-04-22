export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RegisterRequestDto {
  fullName: string;
  email: string;
  password: string; 
}

export interface GoogleLoginRequestDto {
  idToken: string;
}

export interface AuthResponseDto {
  token: string;
  user: UserDto;
}

export interface UserDto {
  id: number;
  name: string;
  email: string;
  role: string;
}
