export interface LoginResponse {
    refresh: string;
    access: string;
    email: string;
    is_staff?: boolean;
    first_name?: string;
    last_name?: string;
}
