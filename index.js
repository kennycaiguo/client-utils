/* common */
import { getQueryObject } from './lib/common'

/* request */
import { serviceFactory } from './lib/request'

/* token */
import { setTokenFromUrl, getToken, removeToken } from './lib/token';

export default {
  getQueryObject,
  serviceFactory,
  setTokenFromUrl,
  getToken,
  removeToken
}
