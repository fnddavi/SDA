export interface User {
    id: string;
    username: string;
    email: string;
    password_hash: string;
    full_name_encrypted: string;
    created_at: Date;
    updated_at: Date;
    last_login?: Date;
    is_active: boolean;
}

export interface CreateUserInput {
    username: string;
    email: string;
    password: string;
    fullName: string;
}

export interface LoginInput {
    username: string;
    password: string;
}

export interface UserProfile {
    id: string;
    username: string;
    email: string;
    fullName: string;
    created_at: Date;
    last_login?: Date;
}

export interface Contact {
    id: string;
    user_id: string;
    name_encrypted: string;
    email_encrypted?: string;
    phone_encrypted?: string;
    address_encrypted?: string;
    notes_encrypted?: string;
    created_at: Date;
    updated_at: Date;
}

export interface CreateContactInput {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
}

export interface ContactProfile {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
    created_at: Date;
    updated_at: Date;
}

export interface UserKeys {
    id: string;
    user_id: string;
    public_key: string;
    private_key_encrypted: string;
    created_at: Date;
    is_active: boolean;
}

export interface AuditLog {
    id: string;
    user_id?: string;
    action: string;
    resource_type?: string;
    resource_id?: string;
    ip_address?: string;
    user_agent?: string;
    created_at: Date;
    details?: any;
}

export interface HybridEncryptedData {
    encryptedData: string;
    encryptedKey: string;
}

export interface AuthResponse {
    success: boolean;
    token?: string;
    user?: UserProfile;
    message?: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
