import { requestClient } from "#/api/request";

export namespace SystemRolePermissionApi {
  export interface GetRolePermissionsReq {
    roleId: string;
  }

  export interface GetRolePermissionsRes {
    id: string;
    permissionId: string;
  }
}

export async function getRolePermissions(req: SystemRolePermissionApi.GetRolePermissionsReq) {
  return await requestClient.get<SystemRolePermissionApi.GetRolePermissionsRes[]>(
    '/tenant/role-permissions', {params: req}
  )
}
