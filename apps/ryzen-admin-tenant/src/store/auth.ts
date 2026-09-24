import type { Recordable, UserInfo } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { notification } from 'ant-design-vue';
import JSEncrypt from 'jsencrypt';
import { defineStore } from 'pinia';

import { getMessageEncryptorApi, getPermissionsApi, getUserInfoApi, loginApi, logoutApi } from '#/api';
import { $t } from '#/locales';

/**
 * 加密密码
 * @param password 密码
 * @param publicKey  公钥
 * @returns  密文
 */
const encryptPassword = (password: string, publicKey: string) => {
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(publicKey);
  return encryptor.encrypt(password) || '加密失败';
};

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);

  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param params 登录表单数据
   */
  async function authLogin(
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    // 异步处理用户登录操作并获取 accessToken
    let userInfo: null | UserInfo = null;
    try {

      // 密码加密
      const encryptor = await getMessageEncryptorApi();
      params.password = encryptPassword(
        params.password,
        encryptor.publicKey,
      );
      params.keyId = encryptor.keyId;

      loginLoading.value = true;
      const { id, accessToken, refreshToken } = await loginApi(params);

      // 如果成功获取到 accessToken
      if (accessToken) {
        accessStore.setToken(id, accessToken, refreshToken);

        // 获取用户信息并存储到 accessStore 中
        const [fetchUserInfoResult, fetchAccessCodesResult] = await Promise.all([
          fetchUserInfo(),
          fetchAccessCodes(),
        ]);

        userInfo = fetchUserInfoResult;

        userStore.setUserInfo(userInfo);
        accessStore.setAccessCodes(fetchAccessCodesResult);

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          onSuccess
            ? await onSuccess?.()
            : await router.push(
                userInfo.homePath || preferences.app.defaultHomePath,
              );
        }

        if (userInfo?.realName) {
          notification.success({
            description: `${$t('authentication.loginSuccessDesc')}:${userInfo?.realName}`,
            duration: 3,
            message: $t('authentication.loginSuccess'),
          });
        }
      }
    } finally {
      loginLoading.value = false;
    }

    return {
      userInfo,
    };
  }

  async function logout(redirect: boolean = true) {
    try {
      await logoutApi(accessStore.tokenId);
    } catch {
      // 不做任何处理
    }
    resetAllStores();
    accessStore.setLoginExpired(false);

    // 回登录页带上当前路由地址
    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          }
        : {},
    });
  }

  async function fetchUserInfo() {
    const userInfo = await getUserInfoApi();
    userStore.setUserInfo(userInfo);
    return userInfo;
  }

  async function fetchAccessCodes() {
    const permissions = await getPermissionsApi();
    const accessCodes = permissions.map(item => item.symbol);
    accessStore.setAccessCodes(accessCodes)
    return accessCodes;
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    fetchAccessCodes,
    loginLoading,
    logout,
  };
});
