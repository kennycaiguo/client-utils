import Cookie from 'js-cookie'
import { getQueryObject } from './common'

let TokenKey = 'TOKEN'
let urlToken = ''

export function getToken() {
  return urlToken || Cookie.get(TokenKey)
}

/**
 * method set token from url.
 * @param {String} key Token key.
 */
export function setTokenFromUrl(key) {
  TokenKey = key

  // url has token ?
  urlToken = getQueryObject(window.location.href)[TokenKey]
  if (urlToken) {
    const hashIndex = urlToken.indexOf('#')
    if (hashIndex !== -1) {
      urlToken = urlToken.slice(0, hashIndex)
    }
    urlToken = 'Bearer ' + urlToken
    Cookie.set(TokenKey, urlToken)
  }
}

export function removeToken() {
  return Cookie.remove(TokenKey)
}
