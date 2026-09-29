import { requestClient } from '#/api/request';

export namespace SystemAccountApi {
  export interface OffsetPageRes {
    records: GetAccountsReq[];
    index: number;
    size: number;
    pages: number;
    total: number;
  }

  export interface GetAccountsReq {
    pageIndex?: number;
    pageSize?: number;
    enabled?: string;
    username?: string;
  }

  export interface GetAccountsRes {
    id: string;
    username: string;
    nickname: string;
    email: null | string;
    enabled: boolean;
    administrator: boolean;
  }

  //
  export interface PostAccountReq {
    username: string;
    nickname: string;
    email?: string;
    enabled?: string;
  }

  export interface PostAccountRes {
    username: null | string;
    password: null | string;
  }

  export interface PatchAccountReq {
    username?: string;
    nickname?: string;
    enabled?: boolean;
  }

  export interface PutAccountRolesReq {
    roleIds: string[];
  }

  export interface PutAccountPasswordRes {
    username: string;
    nickname: string;
    password: null | string;
  }
}

export async function getAccounts(req: SystemAccountApi.GetAccountsReq) {
  return await requestClient.get<SystemAccountApi.OffsetPageRes>(
    '/tenant/accounts',
    { params: req },
  );
}

export async function postAccount(req: SystemAccountApi.PostAccountReq) {
  return await requestClient.post<SystemAccountApi.PostAccountRes>(
    '/tenant/account',
    req,
  );
}

export async function patchAccount(
  id: string,
  req: SystemAccountApi.PatchAccountReq,
) {
  return await requestClient.patch(`/tenant/account/${id}`, req);
}

export async function putAccountRoles(
  id: string,
  req: SystemAccountApi.PutAccountRolesReq,
) {
  return await requestClient.put(`/tenant/account/${id}/roles`, req);
}
