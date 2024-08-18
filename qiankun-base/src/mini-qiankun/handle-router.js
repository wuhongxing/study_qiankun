import { getApps } from "."
import { importHtml } from "./import-html"
import { getNextRoute, getPrevRoute } from "./rewrite-router"

export const handleRouter = async () => {
  const apps = getApps()

  // 卸载上一个应用
  const prevApp = apps.find(item => getPrevRoute().startsWith(item.activeRule))
  if (prevApp) {
    await unmount(prevApp)
  }

  // 2. 匹配子应用
  // 2.1 获取当前的路由路径
  // 2.2 匹配路由
  const app = apps.find(item => getNextRoute().startsWith(item.activeRule))
  if (!app) return

  // console.log(app)
  // 3. 加载子应用
  // // 3.1 请求获取子应用的资源
  // const html = fetch(app.entry).then(res => res.text())
  // const container = document.querySelector(app.container)
  // // 1. 客户端渲染需要通过执行 JavaScript 来生成内容
  // // 2. 浏览器出于安全考虑，不会执行 innerHTML 中的 script
  // container.innerHTML = html
  // 3. 手动加载子应用的 script，执行代码，使用 eval 或者 new Function
  const { template, getExternalScripts, execScripts } = importHtml(app.entry)
  const container = document.querySelector(app.container)
  container.appendChild(template)
  window.__POWERED_BY_QIANKUN__ = true
  const appExports = await execScripts()
  app.bootstrap = appExports.bootstrap
  app.mount = appExports.mount
  app.unmount = appExports.unmount

  // 4. 渲染子应用
  await bootstrap(app)
  await mount(app)
}

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
