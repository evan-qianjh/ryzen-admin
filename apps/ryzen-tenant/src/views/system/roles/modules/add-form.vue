<script lang="ts" setup>
// import type { DataNode } from 'ant-design-vue/dist/tree';

// import type { Recordable } from '@vben/types';

import type { SystemRoleApi} from '#/api/system/role';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
// import { IconifyIcon } from '@vben/icons';
//
// import { Spin } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
// import { getMenuList } from '#/api/system/menu';
import { postRole } from '#/api/system/role';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const formData = ref<SystemRoleApi.PostRoleReq>();

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

// const permissions = ref<DataNode[]>([]);
// const loadingPermissions = ref(false);

const [Drawer, drawerApi] = useVbenDrawer<null | SystemRoleApi.PostRoleReq>({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();
    postRole(values)
      .then(() => {
        emits('success');
        drawerApi.close();
      })
      .catch(() => {
        drawerApi.unlock();
      });
  },

  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData();
      formApi.reset();

      if (data) {
        formData.value = data;
      } else {
        formData.value = undefined;
      }

      // if (permissions.value.length === 0) {
      //   await loadPermissions();
      // }
      // Wait for Vue to flush DOM updates (form fields mounted)
      await nextTick();
      if (data) {
        formApi.setValues(data);
      }
    }
  },
});

defineExpose({ drawerApi });

// async function loadPermissions() {
//   loadingPermissions.value = true;
//   try {
//     const res = await getMenuList();
//     permissions.value = res as unknown as DataNode[];
//   } finally {
//     loadingPermissions.value = false;
//   }
// }

const getDrawerTitle = computed(() => {
  return $t('common.create', $t('system.role.title'));
});

// function getNodeClass(node: Recordable<any>) {
//   const classes: string[] = [];
//   if (node.value?.type === 'button') {
//     classes.push('inline-flex');
//   }
//
//   return classes.join(' ');
// }
</script>
<template>
  <Drawer :title="getDrawerTitle">
    <Form>
<!--      <template #permissions="slotProps">-->
<!--        <Spin :spinning="loadingPermissions" :classes="{ root: 'w-full' }">-->
<!--          <Tree-->
<!--            :tree-data="permissions"-->
<!--            multiple-->
<!--            bordered-->
<!--            :default-expanded-level="2"-->
<!--            :get-node-class="getNodeClass"-->
<!--            v-bind="slotProps.componentProps"-->
<!--            value-field="id"-->
<!--            label-field="meta.title"-->
<!--            icon-field="meta.icon"-->
<!--          >-->
<!--            <template #node="{ value }">-->
<!--              <IconifyIcon v-if="value.meta.icon" :icon="value.meta.icon" />-->
<!--              {{ $t(value.meta.title) }}-->
<!--            </template>-->
<!--          </Tree>-->
<!--        </Spin>-->
<!--      </template>-->
    </Form>
  </Drawer>
</template>
<style lang="css" scoped>
:deep(.ant-tree-title) {
  .tree-actions {
    @apply ml-5 hidden;
  }
}

:deep(.ant-tree-title:hover) {
  .tree-actions {
    @apply ml-5 flex flex-auto justify-end;
  }
}
</style>
