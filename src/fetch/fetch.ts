
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, Method, AxiosPromise } from 'axios'
import { has } from './utils'
import {Config} from '../index'
const CancelToken = axios.CancelToken
const source = CancelToken.source()

export default class Fetch {
  config: Config
  fetchInstance:AxiosInstance

  constructor (config:Config) {
    this.config = config
    this.fetchInstance = axios.create(config)
    this.initIntercept()
  }

  /** 将返回值 转换成 可支持任意类型的promise */
  translateToPromise<T> (instance:AxiosPromise<any>): Promise<T> {
    const p = new Promise<T>((resolve, reject) => {
      instance.then(res => {
        resolve(res as any)
      })
      instance.catch(e => {
        reject(e)
      })
    })
    return p
  }

  get<T> (url: string, params:{ [key: string]: unknown } | string | number, options:{ [key: string]: unknown } = {}) :Promise<T | null> {
    const configs = this.constructArgs('GET', url, params, options)
    const instance = this.fetchInstance(configs)
    return this.translateToPromise<T>(instance)
  }

  post<T> (url: string, params:{ [key: string]: unknown } | string | number, options:{ [key: string]: unknown } = {}):Promise<T | null> {
    const configs = this.constructArgs('POST', url, params, options)
    const instance = this.fetchInstance(configs)
    return this.translateToPromise<T>(instance)
  }

  put<T> (url: string, params:{ [key: string]: unknown } | string | number, options:{ [key: string]: unknown } = {}):Promise<T | null> {
    const configs = this.constructArgs('PUT', url, params, options)
    const instance = this.fetchInstance(configs)
    return this.translateToPromise<T>(instance)
  }

  delete<T> (url: string, params:{ [key: string]: unknown } | string | number, options:{ [key: string]: unknown } = {}):Promise<T | null> {
    const configs = this.constructArgs('DELETE', url, params, options)
    const instance = this.fetchInstance(configs)
    return this.translateToPromise<T>(instance)
  }

  fetch<T> (url: string, params:{ [key: string]: unknown } | string | number, options:{ [key: string]: unknown } = {}):Promise<T | null> {
    const configs = this.constructArgs('GET', url, params, options)
    const instance = this.fetchInstance(configs)
    return this.translateToPromise<T>(instance)
  }

  // 取消请求
  cancel (message:string | undefined):void {
    return source.cancel(message)
  }

  // 判断请求错误是否是取消
  isCancel (err:unknown):boolean {
    return axios.isCancel(err)
  }

  // Vue注入
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  install (Vue:any, options: {version: number } = { version: 2 }): void {
    if (options.version >= 3 || parseFloat(Vue.version) >= 3) {
      Vue.config.globalProperties.$get = this.get.bind(this)
      Vue.config.globalProperties.$post = this.post.bind(this)
      Vue.config.globalProperties.$put = this.put.bind(this)
      Vue.config.globalProperties.$delete = this.delete.bind(this)
      Vue.config.globalProperties.$fetch = this.fetch.bind(this)
      Vue.config.globalProperties.$fetchInstance = this
    } else {
      Vue.prototype.$get = this.get.bind(this)
      Vue.prototype.$post = this.post.bind(this)
      Vue.prototype.$put = this.put.bind(this)
      Vue.prototype.$delete = this.delete.bind(this)
      Vue.prototype.$fetch = this.fetch.bind(this)
      Vue.prototype.$fetchInstance = this
    }
  }

  // this.constructArgs(['GET', url, config, options])
  // 构建参数
  // constructArgs (args:Array<Config | string>): Config {
  constructArgs (method: Method, url:string, params: unknown, options:{[key:string] :unknown} = {}): Config {
    // [{ url, method, options }]
    let config:Config = {}

    config.method = method
    config.url = url
    config.options = options
    if (has('get,delete', config.method?.toLowerCase())) {
      config.params = params
    } else {
      config.data = params
    }

    // 合并用户设置
    config = { ...config, ...config.options }
    // 添加 canceltoken
    config.cancelToken = source.token

    return config
  }

  // 初始化拦截器
  initIntercept () :void{
    /**
   * 请求拦截器
   * 可作用请求前修改请求配置
   * error 函数可全局处理请求错误
   */
    this.fetchInstance.interceptors.request.use(
      (config) => {
        if (this.config.beforeRequest) {
          const conf = this.config.beforeRequest(config, this.config)
          return conf || config
        } else {
          return config
        }
      },
      (error) => {
        if (this.config.requestError) {
          const err = this.config.requestError(error, this.config)
          return err || Promise.reject(error)
        } else {
          return Promise.reject(error)
        }
      }
    )

    /**
   * 返回拦截器
   * 全局处理返回数据验证和数据构造
   * error 全局处理错误问题
   */
    this.fetchInstance.interceptors.response.use(
      (response) => {
        if (this.config.beforeResponse) {
          return this.config.beforeResponse(response, this.config, response.config)
        } else {
          return response
        }
      },
      (error) => {
        if (this.config.responseError) {
          const err = this.config.responseError(error, this.config)
          return err || Promise.reject(error)
        } else {
          return Promise.reject(error)
        }
      }
    )
  }
}
