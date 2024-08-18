import { handleRouter } from "./handle-router"

let prevRoute = ""
let nextRoute = window.location.pathname

export const rewriteRouter = () => {
  // hash: window.onhashchange
  // history: history.go、history.back、history.forward 使用 popstate 事件
  // popstate 触发的时候，路由已经完成导航了
  window.addEventListener("popstate", e => {
    prevRoute = nextRoute
    nextRoute = window.location.pathname
    handleRouter()
  })
  const rawPushState = window.history.pushState
  window.history.pushState = (...args) => {
    prevRoute = window.location.pathname
    rawPushState.apply(window.history, ...args)
    nextRoute = window.location.pathname
    handleRouter()
  }

  const rawReplaceState = window.history.replaceState
  window.history.replaceState = (...args) => {
    prevRoute = window.location.pathname
    rawReplaceState.apply(window.history, ...args)
    nextRoute = window.location.pathname
    handleRouter()
  }
}

export const getPrevRoute = () => prevRoute
export const getNextRoute = () => nextRoute
