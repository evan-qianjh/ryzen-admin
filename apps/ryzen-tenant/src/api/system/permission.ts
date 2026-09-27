import { requestClient } from "#/api/request";

export namespace SystemPermissionApi {

  export interface GetPermissionReq {
    enabled?: boolean;
  }
  export interface GetPermissionRes {
    id: string;
    parentId: null | string;
    type: string;
    title: string;
    symbol: string;
    enabled: boolean;
  }
}

export async function getPermissions(req: SystemPermissionApi.GetPermissionReq) {
  return await requestClient.get<SystemPermissionApi.GetPermissionRes[]>(
    '/tenant/permissions', { params: req}
  )
}
