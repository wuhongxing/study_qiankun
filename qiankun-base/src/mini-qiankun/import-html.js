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
