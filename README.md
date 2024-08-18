## 思路
1. 监听路由变化
2. 匹配子应用
3. 加载子应用
4. 渲染子应用

### 监听路由变化
1. hash 路由
2. history 路由
```js
window.addEventListener("popstate", e => {
    console.log(e)
})
const rawPushState = window.history.pushState
window.history.pushState = (...args) => {
    rawPushState.apply(window.history, ...args)
}

const rawReplaceState = window.history.replaceState
window.history.replaceState = (...args) => {
    rawReplaceState.apply(window.history, ...args)
}
```

### 匹配子应用
```js
const app = apps.find(item => window.location.pathname.startsWith(item.activeRule))
```

### 加载子应用
```js
const { template, getExternalScripts, execScripts } = importHtml(app.entry)
const container = document.querySelector(app.container)
container.appendChild(template)
window.__POWERED_BY_QIANKUN__ = true
const appExports = await execScripts()
app.bootstrap = appExports.bootstrap
app.mount = appExports.mount
app.unmount = appExports.unmount
```
#### import-html
为什么在子应用的入口 js 中导出生命周期？为什么要把子应用打包的模式设置为 umd？
1. 下载 html
2. 下载所有的 script 代码
3. 执行所有的 script 代码
```js
import { fetchResource } from "./fetch-resource"

export const importHtml = async url => {
  const html = await fetchResource(url)
  const template = document.createElement("div")
  template.innerHTML = html

  const scripts = template.querySelectorAll("script")

  // 获取所有 script 标签的代码
  function getExternalScripts() {
    return Promise.all(
      Array.from(scripts).map(script => {
        const src = script.getAttribute("src")
        if (!src) return Promise.resolve(script.innerHTML)
        return fetchResource(src.startsWith("http" ? src : `${url}${src}`))
      })
    )
  }
  // 获取并执行所有的 script 脚本代码
  async function execScripts() {
    const scripts = await getExternalScripts()
    // 手动构造一个 commonJS 模块环境
    const module = { exports: {} }
    const exports = module.exports

    scripts.forEach(code => {
      eval(code)
    })
    /**
     * {
     *  bootstrap, mount, unmount
     * }
     */
    return module.exports
  }
  return {
    template,
    getExternalScripts,
    execScripts
  }
}
```

## 渲染子应用
```js
async function bootstrap(app) {
  app.bootstrap && (await app.bootstrap())
}

async function mount(app) {
  app.mount &&
    (await app.mount({
      container: document.querySelector(app.container)
    }))
}

async function unmount(app) {
  app.unmount &&
    (await app.unmount({
      container: document.querySelector(app.container)
    }))
}

await bootstrap(app)
await mount(app)
}
```

## 问题
### 应用加载后不会卸载
1. 使用快慢指针进行记录，在新应用加载前将旧应用卸载
### 资源无法加载
2. 由于打包之后的 path 的 host 是指向主应用导致的，需要调整。如果是子应用，则将 webpack 的 publicPath 设置为主应用注入的值。
```js
if (window.__POWERED_BY_QIANKUN__) {
  // eslint-disable-next-line no-undef
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}
```

## 尚未研究的两个问题
1. css 隔离
  
方案1：使用 shadow dom

方案2：使用 scoped
  
2. [js 沙箱](https://hijiangtao.github.io/2022/06/11/JavaScript-Sandbox-Mechanism-and-Its-History/)

## 参考资源
[官方文档](https://qiankun.umijs.org/zh/guide)

[手写 qiankun 微应用框架](https://www.bilibili.com/video/BV1H34y117fe/?spm_id_from=333.337.search-card.all.click&vd_source=d4342e5d0abb03322b7a96d6e90d71de)

