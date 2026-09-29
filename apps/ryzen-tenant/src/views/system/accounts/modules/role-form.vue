<script lang="ts" setup>
import type { SystemAccountApi } from '#/api/system/account';

import { nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { putAccountRoles } from '#/api/system/account';
import { getAccountRoles } from '#/api/system/account-role';
import { getRoles } from '#/api/system/role';
import { $t } from '#/locales';

import { useRoleFormSchema } from '../data';

const emits = defineEmits(['success']);

const [Form, formApi] = useVbenForm({
  schema: useRoleFormSchema(),
  showDefaultActions: false,
});

const id = ref<string>();
const [Drawer, drawerApi] =
  useVbenDrawer<null | SystemAccountApi.GetAccountsRes>({
    async onConfirm() {
      if (!id.value) return;
      const { valid } = await formApi.validate();
      if (!valid) return;
      const values = await formApi.getValues();
      drawerApi.lock();
      putAccountRoles(id.value, { roleIds: values.roleIds ?? [] })
        .then(() => {
          emits('success');
          drawerApi.close();
        })
        .catch(() => {
          drawerApi.unlock();
        });
    },

    async onOpenChange(isOpen) {
      if (!isOpen) return;
      const data = drawerApi.getData();
      formApi.reset();
      id.value = data?.id;
      if (!data) return;

      drawerApi.setState({ loading: true });
      try {
        // 查询所有启用角色用于回显，同时查询该用户已分配的角色
        const [roles, accountRoles] = await Promise.all([
          getRoles({ enabled: true }),
          getAccountRoles({ accountId: data.id }),
        ]);

        // 用角色列表填充 CheckboxGroup 选项
        formApi.updateSchema([
          {
            componentProps: {
              options: roles.map((role) => ({
                label: role.title,
                value: role.id,
              })),
            },
            fieldName: 'roleIds',
          },
        ]);

        // Wait for Vue to flush DOM updates (form fields mounted)
        await nextTick();

        // 勾选已分配的角色
        await formApi.setFieldValue(
          'roleIds',
          accountRoles.map((accountRole) => accountRole.roleId),
        );
      } finally {
        drawerApi.setState({ loading: false });
      }
    },
  });

defineExpose({ drawerApi });
</script>
<template>
  <Drawer :title="$t('system.account.role')">
    <Form />
  </Drawer>
</template>
<style lang="css" scoped></style>
