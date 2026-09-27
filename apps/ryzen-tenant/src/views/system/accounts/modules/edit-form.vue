<script lang="ts" setup>
import type {DataNode} from 'ant-design-vue/es/tree';

import type {Recordable} from '@vben/types';

import type {SystemRoleApi} from '#/api/system/role';

import {computed, nextTick, ref} from 'vue';

import {Tree, useVbenDrawer} from '@vben/common-ui';

import {Spin} from 'ant-design-vue';

import {useVbenForm} from '#/adapter/form';
import {getPermissions, type SystemPermissionApi} from '#/api';
import {patchRole} from '#/api/system/role';
import {getRolePermissions} from '#/api/system/role-permission';
import {$t} from '#/locales';

import {useEditFormSchema} from '../data';

const emits = defineEmits(['success']);

const formData = ref<SystemRoleApi.PatchRoleReq>();

const [Form, formApi] = useVbenForm({
  schema: useEditFormSchema(),
  showDefaultActions: false,
});

const permissions = ref<DataNode[]>([]);
const loadingPermissions = ref(false);



const id = ref();
const [Drawer, drawerApi] = useVbenDrawer<null | SystemRoleApi.GetRolesRes>({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();
    patchRole(id.value, values)
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
        id.value = data.id;
      } else {
        formData.value = undefined;
        id.value = undefined;
      }

      if (permissions.value.length === 0) {
        await loadPermissions();
      }
      // Wait for Vue to flush DOM updates (form fields mounted)
      await nextTick();
      if (data) {
        formApi.setValues(data);
        // 回显已分配权限：Tree 的勾选状态由表单值 modelValue 驱动，直接写入即可
        const rolePermissions = await getRolePermissions({ roleId: data.id });
        await formApi.setFieldValue(
          'permissionIds',
          rolePermissions.map((rp) => rp.permissionId),
        );
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
    const res =  await getPermissions({enabled: true});

    // 初始化权限
    permissions.value = buildPermissionTree(res);
  } finally {
    loadingPermissions.value = false;
  }
}

const getDrawerTitle = computed(() => {
  return $t('common.edit', $t('system.role.title'));
});

function getNodeClass(node: Recordable<any>) {
  const classes: string[] = [];
  if (node.value?.type === 'button') {
    classes.push('inline-flex');
  }

  return classes.join(' ');
}
</script>
<template>
  <Drawer :title="getDrawerTitle">
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
