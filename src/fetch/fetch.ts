
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, Method } from 'axios'
import { has } from './utils'

const CancelToken = axios.CancelToken
const source = CancelToken.source()

interface Config extends AxiosRequestConfig {
  options?: object
  beforeRequest?: (config: AxiosRequestConfig, customConfig: Config) => Config | null
  requestError?: (error: any, customConfig: Config) => any
  beforeResponse?: (response: AxiosResponse, customConfig: Config, responseConfig:AxiosRequestConfig) => AxiosResponse
  responseError?: (error: any, customConfig: Config) => any
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

  get (url: string, config:object, options:object = {}) {
    const configs = this.constructArgs(['GET', url, config, options])
    return this.fetchInstance(configs)
  }

  post (url: string, config:object, options:object = {}) {

    const configs = this.constructArgs(['POST', url, config, options])
    return this.fetchInstance(configs)
  }

  put (url: string, config:object, options:object = {}) {
    const configs = this.constructArgs(['PUT', url, config, options])
    return this.fetchInstance(configs)
  }

  delete (url: string, config:object, options:object = {}) {
    const configs = this.constructArgs(['DELETE', url, config, options])
    return this.fetchInstance(configs)
  }

  fetch (url: string, config:object, options:object = {}) {
    const configs = this.constructArgs(['GET', url, config, options])
    return this.fetchInstance(configs)
  }

  // 取消请求
  cancel (message:string | undefined) {
    return source.cancel(message)
  }

  // 判断请求错误是否是取消
  isCancel (err:any) {
    return axios.isCancel(err)
  }

  // Vue注入
  install (Vue:any, options: {version: number } = { version: 2 }) {
    if (options.version >= 3) {
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

  // 构建参数
  constructArgs (args:Array<object | string>) {
    // [{ url, method, options }]
    let config:Config = {}

    config.method = args[0] as Method
    config.url = args[1] as string
    config.options = args[3] as object || {}
    if (has('get,delete', config.method?.toLowerCase())) {
      config.params = args[2]
    } else {
      config.data = args[2]
    }

    // 合并用户设置
    config = { ...config, ...config.options }
    // 添加 canceltoken
    config.cancelToken = source.token

    return config
  }

  // 初始化拦截器
  initIntercept () {
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
