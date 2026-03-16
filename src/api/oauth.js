import request from '@/utils/request';

export const getOAuthProviders = () => request('get', '/oauth/providers');
export const getOAuthAccounts = () => request('get', '/oauth/accounts');
export const unbindOAuth = (provider) => request('post', `/oauth/unbind/${provider}`);
