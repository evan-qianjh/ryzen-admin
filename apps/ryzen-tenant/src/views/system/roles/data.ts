import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridColumns } from '#/adapter/vxe-table';
import type { SystemRoleApi } from '#/api';

import { useAccess } from '@vben/access';

import { $t } from '#/locales';

// 新增表单
export function useAddFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'title',
      label: $t('system.role.title'),
      rules: 'required',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('common.enabled'), value: true },
          { label: $t('common.disabled'), value: false },
        ],
        optionType: 'button',
      },
      defaultValue: true,
      fieldName: 'enabled',
      label: $t('common.enabled'),
    },
    {
      component: 'Input',
      fieldName: 'permissionIds',
      formItemClass: 'items-start',
      label: $t('system.role.setPermissions'),
      modelPropName: 'modelValue',
    },
  ];
}

// 新增表单
export function useEditFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'title',
      label: $t('system.role.title'),
      rules: 'required',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('common.enabled'), value: true },
          { label: $t('common.disabled'), value: false },
        ],
        optionType: 'button',
      },
      defaultValue: true,
      fieldName: 'enabled',
      label: $t('common.enabled'),
    },
    {
      component: 'Input',
      fieldName: 'permissionIds',
      formItemClass: 'items-start',
      label: $t('system.role.setPermissions'),
      modelPropName: 'modelValue',
    },
  ];
}

// 表格搜索表单
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'title',
      label: $t('common.name'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
      },
      fieldName: 'enabled',
      label: $t('common.enabled'),
    },
  ];
}

// 表格内容
export function useColumns<T = SystemRoleApi.GetRolesRes>(
  onActionClick: OnActionClickFn<T>,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridColumns {
  // useColumns 在 index.vue 的 setup 中调用，此时路由守卫已将 accessCodes 写入 store，可安全判断权限
  const { hasAccessByCodes } = useAccess();
  return [
    {
      field: 'id',
      title: $t('common.id'),
      width: 200,
    },
    {
      field: 'title',
      title: $t('common.name'),
      // width: 200,
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange && hasAccessByCodes(['/system/roles:enabled']) ? 'CellSwitch' : 'CellTag',
        // enabled 字段为 boolean 类型，覆盖渲染器默认的 1/0 选中值
        props: { checkedValue: true, unCheckedValue: false },
      },
      field: 'enabled',
      title: $t('common.enabled'),
      width: 100,
    },
    {
      field: 'createdTime',
      formatter: 'formatDateTime',
      title: $t('common.createdTime'),
      width: 200,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'title',
          nameTitle: $t('system.role.title'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        // 按钮级细粒度控制：show 为 false（或函数返回 false）的按钮会被渲染器过滤掉
        options: [
          { code: 'edit', show: hasAccessByCodes(['/system/roles:edit']) },
          { code: 'delete', show: hasAccessByCodes(['/system/roles:delete']) },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: $t('common.operation'),
      width: 200,
    },
  ];
}
