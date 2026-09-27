import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridColumns } from '#/adapter/vxe-table';
import type { SystemAccountApi } from '#/api';

import { useAccess } from '@vben/access';

import { $t } from '#/locales';

// 新增表单
export function useAddFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'username',
      label: $t('system.account.username'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'nickname',
      label: $t('system.account.nickname'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'email',
      label: $t('system.account.email'),
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
  ];
}

// 修改表单
export function useEditFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'title',
      label: $t('system.account.title'),
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
  ];
}

// 表格搜索表单
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'username',
      label: $t('system.account.username'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('common.enabled'), value: true },
          { label: $t('common.disabled'), value: false },
        ],
      },
      fieldName: 'enabled',
      label: $t('common.enabled'),
    },
  ];
}

// 表格内容
export function useColumns<T = SystemAccountApi.GetAccountsRes>(
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
      field: 'username',
      title: $t('system.account.username'),
      // width: 200,
    },
    {
      field: 'nickname',
      title: $t('system.account.nickname'),
      // width: 200,
    },
    {
      field: 'email',
      title: $t('system.account.email'),
      // width: 200,
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange && hasAccessByCodes(['/system/accounts:enabled']) ? 'CellSwitch' : 'CellTag',
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
          nameTitle: $t('system.account.title'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          { code: 'edit', show: hasAccessByCodes(['/system/accounts:edit']) },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: $t('common.operation'),
      width: 200,
    },
  ];
}
