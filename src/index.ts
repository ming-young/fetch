import { AxiosRequestConfig, AxiosResponse } from 'axios'
import Fetch from './fetch/fetch'
// import Config from './fetch/fetch'

export default Fetch


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

