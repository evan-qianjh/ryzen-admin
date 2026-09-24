import {requestClient} from '#/api/request';

export namespace SystemRoleApi {
  //
  export interface GetRolesReq {
    // TODO delete
    // page?: number;
    // pageSize?: number;
    enabled?: boolean;
    endTime?: string;
    startTime?: string;
    title?: string;
  }
  export interface GetRolesRes {
    id: string;
    title: string;
    enabled: boolean;
  }

  //
  export interface PostRoleReq {
    title?: string;
    enabled?: boolean;
  }

  //
  export interface PatchRoleReq {
    enabled?: boolean;
  }
}

/**
 * 查询角色
 * @param req
 */
export async function getRoles(req: SystemRoleApi.GetRolesReq) {
  return await requestClient.get<SystemRoleApi.GetRolesRes>(
    '/tenant/roles', {params: req}
  )
}

/**
 * 创建角色
 * @param req
 */
export async function postRole(req: SystemRoleApi.PostRoleReq) {
  return await requestClient.post(
    '/tenant/role', req
  );
}

/**
 * 修改角色
 * @param id
 * @param req
 */
export async function patchRole(id: string, req: SystemRoleApi.PatchRoleReq) {
  return await requestClient.patch(
    '/tenant/role/' + id, req
  )
}
