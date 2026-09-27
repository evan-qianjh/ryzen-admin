<script lang="ts" setup>
import type {DataNode} from 'ant-design-vue/es/tree';

import type {Recordable} from '@vben/types';

import {computed, nextTick, ref} from 'vue';

import {Tree, useVbenDrawer} from '@vben/common-ui';

import {Spin} from 'ant-design-vue';

import {useVbenForm} from '#/adapter/form';
import {postAccount, type SystemAccountApi } from '#/api';
import {$t} from '#/locales';

import {useAddFormSchema} from '../data';

const emits = defineEmits(['success']);

const formData = ref<SystemAccountApi.PostAccountReq>();

const [Form, formApi] = useVbenForm({
  schema: useAddFormSchema(),
  showDefaultActions: false,
});

const permissions = ref<DataNode[]>([]);
const loadingPermissions = ref(false);



const [Drawer, drawerApi] = useVbenDrawer<null | SystemAccountApi.PostAccountReq>({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();
    postAccount(values)
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

      // Wait for Vue to flush DOM updates (form fields mounted)
      await nextTick();
      if (data) {
        formApi.setValues(data);
      }
    }
  },
});

defineExpose({ drawerApi });


const getDrawerTitle = computed(() => {
  return $t('common.create', $t('system.account.title'));
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
</style>
