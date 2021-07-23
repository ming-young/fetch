
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, Method, AxiosPromise } from 'axios'
import { has } from './utils'

const CancelToken = axios.CancelToken
const source = CancelToken.source()

export interface Config extends AxiosRequestConfig {
  /** 用户自定义配置, 最终会合并到 原始 config 当中 */
  options?: {[key:string] :unknown}
  /**
   * 请求发送之前的拦截方法, 可以获取指定的配置, 对当前请求自定义修改
   *
   * @memberof Config 合并之后的 config
   * @memberof customConfig 用户自定义的config
   * @return 当前请求最终需要的config
   */
  beforeRequest?: (config: AxiosRequestConfig, customConfig: Config) => Config | null
  /**
   * 请求错误
   * @memberof error 请求抛出的错误
   * @memberof Config 当前请求的 config
   * @return 需要抛出的具体返回值
   */
  requestError?: (error: unknown, config: Config) => unknown
  /**
   * 请求返回之后的拦截方法, 可以修改返回的内容或者配置具体的业务逻辑
   * @memberof response 返回值
   * @memberof Config 合并之后的 config
   * @memberof customConfig 用户自定义的config
   * @return 当前请求最终需要的config
   */
  beforeResponse?: (response: AxiosResponse, customConfig: Config, responseConfig:AxiosRequestConfig) => AxiosResponse
  /**
   * 请求错误
   * @memberof error 请求返回错误
   * @memberof config 当前请求的 config
   * @return 需要抛出的具体返回值
   */
  responseError?: (error: unknown, config: Config) => unknown
}

// AxiosRequestConfig

export default class Fetch {
  config: Config
  fetchInstance:AxiosInstance

  constructor (config:Config) {
    this.config = config
    this.fetchInstance = axios.create(config)
    this.initIntercept()
  }

  get<T> (url: string, params:{ [key: string]: unknown } | string | number, options:{ [key: string]: unknown } = {}) :AxiosPromise<T> {
    const configs = this.constructArgs('GET', url, params, options)
    return this.fetchInstance(configs)
  }

  post<T> (url: string, params:{ [key: string]: unknown } | string | number, options:{ [key: string]: unknown } = {}):AxiosPromise<T | null> {
    debugger
    const configs = this.constructArgs('POST', url, params, options)
    return this.fetchInstance(configs)
  }

  put (url: string, params:{ [key: string]: unknown } | string | number, options:{ [key: string]: unknown } = {}):AxiosPromise<unknown> {
    const configs = this.constructArgs('PUT', url, params, options)
    return this.fetchInstance(configs)
  }

  delete (url: string, params:{ [key: string]: unknown } | string | number, options:{ [key: string]: unknown } = {}):AxiosPromise<unknown> {
    const configs = this.constructArgs('DELETE', url, params, options)
    return this.fetchInstance(configs)
  }

  fetch (url: string, params:{ [key: string]: unknown } | string | number, options:{ [key: string]: unknown } = {}):AxiosPromise<unknown> {
    const configs = this.constructArgs('GET', url, params, options)
    return this.fetchInstance(configs)
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
