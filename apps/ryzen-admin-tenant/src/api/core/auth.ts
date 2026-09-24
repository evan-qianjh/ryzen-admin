import {baseRequestClient, requestClient} from '#/api/request';

export namespace AuthApi {
  export interface getMessageEncryptorResp {
    keyId: string;
    publicKey: string;
  }

  /** 登录接口参数 */
  export interface LoginParams {
    password?: string;
    username?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    id: string;
    accessToken: string;
    refreshToken: string;
  }

  export interface RefreshTokenParams {
    refreshToken?: null | string;
  }

  export interface RefreshTokenResult {
    accessToken: string;
  }

  export interface PermissionsResult {
    id: string;
    symbol: string;
    title: string;
  }
}

export async function getMessageEncryptorApi() {
  return requestClient.get<AuthApi.getMessageEncryptorResp>(
    '/admin/public/message-encryptor',
  );
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  return requestClient.post<AuthApi.LoginResult>('/admin/public/account-token', data);
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi(data: AuthApi.RefreshTokenParams) {
  const resp = await baseRequestClient.post(
    '/admin/public/access-token',
    data,
    {withCredentials: true},
  );
  return resp?.data.result as AuthApi.RefreshTokenResult;
}

/**
 * 退出登录
 */
export async function logoutApi(tokenId: null | string) {
  return requestClient.delete(`/admin/account-token/${tokenId}`, {
    withCredentials: true,
  });
}

/**
 * 获取用户权限码
 */
export async function getPermissionsApi() {
  return await requestClient.get<[]>('/admin/account-permissions') as AuthApi.PermissionsResult [];
}
