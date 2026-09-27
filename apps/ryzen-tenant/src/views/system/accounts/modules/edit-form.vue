<script lang="ts" setup>
import type { SystemAccountApi } from '#/api/system/account';

import { nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { patchAccount } from '#/api/system/account';
import { $t } from '#/locales';

import { useEditFormSchema } from '../data';

const emits = defineEmits(['success']);

const formData = ref<SystemAccountApi.PatchAccountReq>();

const [Form, formApi] = useVbenForm({
  schema: useEditFormSchema(),
  showDefaultActions: false,
});

const id = ref();
const [Drawer, drawerApi] =
  useVbenDrawer<null | SystemAccountApi.GetAccountsRes>({
    async onConfirm() {
      const { valid } = await formApi.validate();
      if (!valid) return;
      const values = await formApi.getValues();
      drawerApi.lock();
      patchAccount(id.value, values)
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
  <Drawer :title="$t('common.edit')">
    <Form />
  </Drawer>
</template>
<style lang="css" scoped></style>
