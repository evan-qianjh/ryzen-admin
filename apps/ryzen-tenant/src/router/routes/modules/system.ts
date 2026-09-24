import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:layout-dashboard',
      order: -1,
      title: $t('page.system.title'),
    },
    name: 'System',
    path: '/system',
    children: [
      {
        name: 'Roles',
        path: 'roles',
        component: () => import('#/views/system/roles/index.vue'),
        meta: {
          icon: 'lucide:area-chart',
          title: $t('page.system.roles'),
          permissions: ['/system/roles'],
        },
      },
      // {
      //   name: 'Permissions',
      //   path: 'permissions',
      //   component: () => import('#/views/system/permissions/index.vue'),
      //   meta: {
      //     icon: 'carbon:workspace',
      //     title: $t('page.system.permissions'),
      //     permissions: ['/system/permissions'],
      //   },
      // },
    ],
  },
];

export default routes;
