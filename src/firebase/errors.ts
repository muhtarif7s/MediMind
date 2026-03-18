'use client';
import { getAuth, type User } from 'firebase/auth';

/**
 * Base error class for all application-level errors.
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly timestamp: string;
  public readonly category: string;

  constructor(message: string, code: string = 'app/unknown', category: string = 'General') {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.category = category;
    this.timestamp = new Date().toISOString();
  }
}

export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

interface FirebaseAuthToken {
  name: string | null;
  email: string | null;
  email_verified: boolean;
  phone_number: string | null;
  sub: string;
  firebase: {
    identities: Record<string, string[]>;
    sign_in_provider: string;
    tenant: string | null;
  };
}

interface FirebaseAuthObject {
  uid: string;
  token: FirebaseAuthToken;
}

interface SecurityRuleRequest {
  auth: FirebaseAuthObject | null;
  method: string;
  path: string;
  resource?: {
    data: any;
  };
}

function buildAuthObject(currentUser: User | null): FirebaseAuthObject | null {
  if (!currentUser) return null;
  return {
    uid: currentUser.uid,
    token: {
      name: currentUser.displayName,
      email: currentUser.email,
      email_verified: currentUser.emailVerified,
      phone_number: currentUser.phoneNumber,
      sub: currentUser.uid,
      firebase: {
        identities: currentUser.providerData.reduce((acc, p) => {
          if (p.providerId) acc[p.providerId] = [p.uid];
          return acc;
        }, {} as Record<string, string[]>),
        sign_in_provider: currentUser.providerData[0]?.providerId || 'custom',
        tenant: currentUser.tenantId,
      },
    },
  };
}

function buildRequestObject(context: SecurityRuleContext): SecurityRuleRequest {
  let authObject: FirebaseAuthObject | null = null;
  try {
    const firebaseAuth = getAuth();
    if (firebaseAuth.currentUser) {
      authObject = buildAuthObject(firebaseAuth.currentUser);
    }
  } catch {}

  return {
    auth: authObject,
    method: context.operation,
    path: `/databases/(default)/documents/${context.path}`,
    resource: context.requestResourceData ? { data: context.requestResourceData } : undefined,
  };
}

export class FirestorePermissionError extends AppError {
  public readonly request: SecurityRuleRequest;

  constructor(context: SecurityRuleContext) {
    const requestObject = buildRequestObject(context);
    super(
      `Permission denied at ${context.path}: ${JSON.stringify(requestObject, null, 2)}`,
      'firestore/permission-denied',
      'Database'
    );
    this.name = 'FirestorePermissionError';
    this.request = requestObject;
  }
}
