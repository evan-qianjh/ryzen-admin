<script lang="ts" setup>
import type { Dayjs } from 'dayjs';

import type { Recordable } from '@vben/types';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { type SystemAccountApi, getAccounts, postAccount, patchAccount} from '#/api';
import { $t } from '#/locales';
import { createDateRangeCodec } from '#/utils/date-range-codec';

import { useColumns, useGridFormSchema } from './data';
import AddForm from './modules/add-form.vue';
import EditForm from './modules/edit-form.vue';

interface SearchFormValues extends Record<string, unknown> {
  createTime?: [Dayjs, Dayjs];
}

const searchCodec = createDateRangeCodec<SearchFormValues>()({
  endField: 'endTime',
  rangeField: 'createTime',
  startField: 'startTime',
});

type SearchSubmitValues = ReturnType<typeof searchCodec.encode>;

const { hasAccessByCodes } = useAccess();

/* 新增表单 */
const [AddFormDrawer, addFormDrawerApi] = useVbenDrawer({
  connectedComponent: AddForm,
  destroyOnClose: true,
});

/* 修改表单 */
const [EditFormDrawer, editFormDrawerApi] = useVbenDrawer({
  connectedComponent: EditForm,
  destroyOnClose: true,
})

/* 表格 */
const [Grid, gridApi] = useVbenVxeGrid({
  // 搜索
  formOptions: {
    codec: searchCodec,
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  // 内容
  gridOptions: {
    columns: useColumns(onActionClick, onStatusChange),
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: true,
    },
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues: SearchSubmitValues) => {
          return await getAccounts({
            pageIndex: page.currentPage,
            pageSize: page.pageSize,
            ...formValues
          });
        },
      },
    },
    rowConfig: {
      keyField: 'id',
    },

    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<SystemAccountApi.GetAccountsRes>,
});

/* action点击 */
function onActionClick(e: OnActionClickParams<SystemAccountApi.GetAccountsRes>) {
  switch (e.code) {
    case 'edit': {
      onEdit(e.row);
      break;
    }
  }
}

/**
 * 将Antd的Modal.confirm封装为promise，方便在异步函数中调用。
 * @param content 提示内容
 * @param title 提示标题
 */
function confirm(content: string, title: string) {
  return new Promise((reslove, reject) => {
    Modal.confirm({
      content,
      onCancel() {
        reject(new Error('已取消'));
      },
      onOk() {
        reslove(true);
      },
      title,
    });
  });
}

/**
 * 状态开关即将改变
 * @param newStatus 期望改变的状态值
 * @param row 行数据
 * @returns 返回false则中止改变，返回其他值（undefined、true）则允许改变
 */
async function onStatusChange(
  newStatus: boolean,
  row: SystemAccountApi.GetAccountsRes,
) {
  const status: Recordable<string> = {
    false: '禁用',
    true: '启用',
  };
  try {
    await confirm(
      `你要将【${row.nickname}】的状态切换为 【${status[String(newStatus)]}】 吗？`,
      `切换状态`,
    );
    await patchAccount(row.id, { enabled: newStatus });
    return true;
  } catch {
    return false;
  }
}

function onEdit(row: SystemAccountApi.GetAccountsRes) {
  editFormDrawerApi.setData(row).open();
}

function onRefresh() {
  gridApi.query();
}

function onCreate() {
  addFormDrawerApi.setData(null).open();
}
</script>
<template>
  <Page auto-content-height>
    <!--  新增表单  -->
    <AddFormDrawer @success="onRefresh" />
    <!--  编辑表单  -->
    <EditFormDrawer @success="onRefresh" />
    <!--  列表  -->
    <Grid>
      <template #toolbar-tools>
        <Button v-if="hasAccessByCodes(['/system/accounts:add'])" type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('page.system.accounts')]) }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
