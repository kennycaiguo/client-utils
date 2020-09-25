import axios from 'axios'
import { getToken } from './token'

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
export function serviceFactory(options, successCallback, failCallback, unauthorizedCallback, forbiddenCallback, notfoundCallback) {
  const {
    baseUrl = '/api-master',
    timeout = 1200000, // 默认 2 分钟
    headers
  } = options
  
  // 创建axios实例
  const service = axios.create({
    baseURL: baseUrl,
    timeout: timeout // 请求超时时间
  })
  
  // request拦截器
  service.interceptors.request.use(
    config => {
      config.headers['Authorization'] = getToken()
      config.headers['Content-Type'] = 'application/json'
      Object.assign(config.headers, headers)
      return config
    },
    error => {
      // Do something with request error
      console.log(error) // for debug
      Promise.reject(error)
    }
  )
  
  // response 拦截器
  service.interceptors.response.use(
    response => {
      if (response.data.code === '0' || response.data.code === '000000' || response.data.code === 200) {
        successCallback(response)
      } else {
        failCallback(response)
      }
      return response.data
    },
    error => {
      let status = 0
      try {
        status = error.response.status || error.response.data.status
      } catch (e) {
        if (error.toString().indexOf('Error: timeout') !== -1) {
          return Promise.reject(error)
        }
      }
      
      if (status) {
        if (status === 401) {
          unauthorizedCallback(error)
        } else if (status === 403) {
          forbiddenCallback(error)
        } else if (status === 404) {
          notfoundCallback(error)
        } else {
          failCallback(error.response)
        }
      } else {
        failCallback(error.response)
      }
      return Promise.reject(error)
    }
  )
  
  return service
}
