# Fetch-vue

对 axios 做的封装，可以在 vue2.x 和 vue3.x 使用.



## 使用说明

通过  **npm i fetch-vue** 引入。 为了更好的使用拦截器的特性和增加自定义配置能力， 创建独立的文件配置 **fetch-vue**

1. 创建 fetch.js 文件

   ```javascript
   import Fetch from 'fetch-vue'
   
   const fetch = new Fetch({
     baseURL: 'https://httpapi-dev.xxxx.net.cn/ka-budget/',
     timeout: 30000,
     // 请求头
     headers: {
       'content-type': 'application/json;charset=utf-8',
       // 请求接口调用TOKEN
       'X-Amz-Security-Token': ''
     },
     /** 自定义配置, 和 具体请求时 传递的 options 会合并到一起 */
     options: {
       key1: 1,
       key2: 1
     },
     /**
      * 请求之前的拦截
      * @param {object} config 合并之后的配置
      * @param {object} customConfig 用户自定义配置
      */
     beforeRequest (config, customConfig) {
       /** config 中 能够获取到 接口请求时 自定义传入的 options, 在这里可以处理对应的需求 */
       console.log('beforeRequest', config.options, customConfig)
       return config
     },
     /**
      * 请求之前的拦截
      * @param {object} res 返回结果
      * @param {object} confg 合并之后的配置
      */
     beforeResponse (res, confg) {
       /** 这里获取到 请求的信息, 一般在这里开始做业务 */
       console.log('beforeResponse', res, confg)
       if (res.data.code !== 200) {
         Promise.reject(res.data.msg)
       }
       return res
     },
     /**
      * 请求之前的拦截
      * @param {any} e 报错信息
      * @param {object} config 合并之后的配置
      */
     responseError (e, config) {
       console.log('responseError', e, config)
     }
   })
   
   export default fetch
   
   ```

2. 在 main.js 引入使用

   ```javascript
   import Vue from 'vue'
   import fetch from './plugins/fetch'
   /* eslint-disable no-new */
   new Vue({
     el: '#app',
     router,
     components: { App },
     template: '<App/>'
   })
   Vue.use(fetch)
   ```

3. 在组件中使用

   ```javascript
   const data = await fetch.post('user/login',
           {userId: 'ming', password: 'P0tIEdrk4Hy21+rEIiwpLA==', key: 'PURLEwtuvcDXNZjF'},
           {quite: true,
             headers: {
               /** 自定义 header 信息 */
             }})
   
   ```

4. 在 ts 中使用， 做好对应的声明 即可


