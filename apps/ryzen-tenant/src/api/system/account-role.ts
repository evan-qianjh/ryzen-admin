import { requestClient } from "#/api/request";

export namespace SystemAccountRoleApi {
  export interface GetAccountRolesReq {
    accountId: string;
  }

  export interface GetAccountRoleRes {
    id: string;
    roleId: string;
  }

  export interface PostAccountRoleReq {
    accountId: string;
    roleId: string;
  }
}

export async function getAccountRoles(req: SystemAccountRoleApi.GetAccountRolesReq) {
  return await requestClient.get<SystemAccountRoleApi.GetAccountRoleRes[]>(
    '/tenant/account-roles',{ params: req }
  )
}

export async function postAccountRole(req: SystemAccountRoleApi.PostAccountRoleReq) {
  return await requestClient.post(
    '/tenant/account-role', req
  )
}

export async function deleteAccountRole(id: string) {
  return await requestClient.delete(
    '/tenant/account-role/' + id,
  )
}
