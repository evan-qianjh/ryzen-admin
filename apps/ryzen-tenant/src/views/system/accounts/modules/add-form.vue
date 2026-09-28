<script lang="ts" setup>
import type { SystemAccountApi } from '#/api';

import { nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { postAccount } from '#/api';
import { $t } from '#/locales';

import { useAddFormSchema } from '../data';

const emits = defineEmits(['success']);

const formData = ref<SystemAccountApi.PostAccountReq>();

const [Form, formApi] = useVbenForm({
  schema: useAddFormSchema(),
  showDefaultActions: false,
});

const [Drawer, drawerApi] =
  useVbenDrawer<null | SystemAccountApi.PostAccountReq>({
    async onConfirm() {
      const { valid } = await formApi.validate();
      if (!valid) return;
      const values = await formApi.getValues<SystemAccountApi.PostAccountReq>();
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

        formData.value = data ?? undefined;

        // Wait for Vue to flush DOM updates (form fields mounted)
        await nextTick();
        if (data) {
          formApi.setValues(data);
        }
      }
    },
  });

defineExpose({ drawerApi });
</script>
<template>
  <Drawer :title="$t('common.create')">
    <Form />
  </Drawer>
</template>
<style lang="css" scoped></style>
