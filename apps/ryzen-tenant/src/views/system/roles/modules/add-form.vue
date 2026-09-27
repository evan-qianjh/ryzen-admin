<script lang="ts" setup>
import type { DataNode } from 'ant-design-vue/es/tree';

import type { Recordable } from '@vben/types';

import type { SystemPermissionApi } from '#/api';
import type { SystemRoleApi } from '#/api/system/role';

import { nextTick, ref } from 'vue';

import { Tree, useVbenDrawer } from '@vben/common-ui';

import { Spin } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { getPermissions } from '#/api';
import { postRole } from '#/api/system/role';
import { $t } from '#/locales';

import { useAddFormSchema } from '../data';

const emits = defineEmits(['success']);

const formData = ref<SystemRoleApi.PostRoleReq>();

const [Form, formApi] = useVbenForm({
  schema: useAddFormSchema(),
  showDefaultActions: false,
});

const permissions = ref<DataNode[]>([]);
const loadingPermissions = ref(false);

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

      if (permissions.value.length === 0) {
        await loadPermissions();
      }
      // Wait for Vue to flush DOM updates (form fields mounted)
      await nextTick();
      if (data) {
        formApi.setValues(data);
      }
    }
  },
});

defineExpose({ drawerApi });

function buildPermissionTree(
  permissions: SystemPermissionApi.GetPermissionRes[],
): DataNode[] {
  const nodeMap = new Map<string, DataNode>();

  // 先创建所有节点
  permissions.forEach((permission) => {
    nodeMap.set(permission.id, {
      key: permission.id,
      title: permission.title,
    });
  });

  const tree: DataNode[] = [];

  // 再建立父子关系
  permissions.forEach((permission) => {
    const node = nodeMap.get(permission.id)!;

    if (permission.parentId === null) {
      tree.push(node);
      return;
    }

    if (permission.parentId != null) {
      const parent = nodeMap.get(permission.parentId);
      if (parent) {
        parent.children ??= [];
        parent.children.push(node);
      }
    }
  });
  return tree;
}

async function loadPermissions() {
  loadingPermissions.value = true;
  try {
    // const res = await getAllMenusApi();
    const res = await getPermissions({ enabled: true });

    // permissions.value = res as unknown as DataNode[];
    permissions.value = buildPermissionTree(res);
  } finally {
    loadingPermissions.value = false;
  }
}

function getNodeClass(node: Recordable<any>) {
  const classes: string[] = [];
  if (node.value?.type === 'button') {
    classes.push('inline-flex');
  }

  return classes.join(' ');
}
</script>
<template>
  <Drawer :title="$t('common.create')">
    <Form>
      <template #permissionIds="slotProps">
        <Spin :spinning="loadingPermissions" wrapper-class-name="w-full">
          <Tree
            v-bind="slotProps.componentProps"
            :tree-data="permissions"
            multiple
            bordered
            :default-expanded-level="2"
            :get-node-class="getNodeClass"
            value-field="key"
            label-field="title"
            :show-icon="false"
          />
        </Spin>
      </template>
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
