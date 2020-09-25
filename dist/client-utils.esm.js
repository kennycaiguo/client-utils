import Cookie from 'js-cookie';
import axios from 'axios';

/**
 * 获取 url 参数
 * @param {string} url
 * @returns {Object}
 */
function getQueryObject(url) {
  url = url == null ? window.location.href : url;
  const search = url.substring(url.lastIndexOf('?') + 1);
  const obj = {};
  const reg = /([^?&=]+)=([^?&=]*)/g;
  search.replace(reg, (rs, $1, $2) => {
    const name = decodeURIComponent($1);
    let val = decodeURIComponent($2);
    val = String(val);
    obj[name] = val;
    return rs;
  });
  return obj;
}

let TokenKey = 'TOKEN';
let urlToken = '';
function getToken() {
  return urlToken || Cookie.get(TokenKey);
}
/**
 * method set token from url.
 * @param {String} key Token key.
 */

function setTokenFromUrl(key) {
  TokenKey = key; // url has token ?

  urlToken = getQueryObject(window.location.href)[TokenKey];

  if (urlToken) {
    const hashIndex = urlToken.indexOf('#');

    if (hashIndex !== -1) {
      urlToken = urlToken.slice(0, hashIndex);
    }

    urlToken = 'Bearer ' + urlToken;
    Cookie.set(TokenKey, urlToken);
  }
}
function removeToken() {
  return Cookie.remove(TokenKey);
}

/**
 * method service factory.
 * @param {Object} options baseUrl/timeout/headers<object>.
 * @param {Function} successCallback.
 * @param {Function} failCallback.
 * @param {Function} unauthorizedCallback.
 * @param {Function} forbiddenCallback.
 * @param {Function} notfoundCallback.
 * @return {Function} return axios instance.
 */

function serviceFactory(options, successCallback, failCallback, unauthorizedCallback, forbiddenCallback, notfoundCallback) {
  const {
    baseUrl = '/api-master',
    timeout = 1200000,
    // 默认 2 分钟
    headers
  } = options; // 创建axios实例

  const service = axios.create({
    baseURL: baseUrl,
    timeout: timeout // 请求超时时间

  }); // request拦截器

  service.interceptors.request.use(config => {
    config.headers['Authorization'] = getToken();
    config.headers['Content-Type'] = 'application/json';
    Object.assign(config.headers, headers);
    return config;
  }, error => {
    // Do something with request error
    console.log(error); // for debug

    Promise.reject(error);
  }); // response 拦截器

  service.interceptors.response.use(response => {
    if (response.data.code === '0' || response.data.code === '000000' || response.data.code === 200) {
      successCallback(response);
    } else {
      failCallback(response);
    }

    return response.data;
  }, error => {
    let status = 0;

    try {
      status = error.response.status || error.response.data.status;
    } catch (e) {
      if (error.toString().indexOf('Error: timeout') !== -1) {
        return Promise.reject(error);
      }
    }

    if (status) {
      if (status === 401) {
        unauthorizedCallback(error);
      } else if (status === 403) {
        forbiddenCallback(error);
      } else if (status === 404) {
        notfoundCallback(error);
      } else {
        failCallback(error.response);
      }
    } else {
      failCallback(error.response);
    }

    return Promise.reject(error);
  });
  return service;
}

/* common */
var index = {
  getQueryObject,
  serviceFactory,
  setTokenFromUrl,
  getToken,
  removeToken
};

export default index;
