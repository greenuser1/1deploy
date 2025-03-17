import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"
import "./assets/style.css"

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    const xhr = new XMLHttpRequest()
    // Use relative URL for API requests
    xhr.open("GET", "/api/auth/me")
    xhr.withCredentials = true

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        next()
      } else {
        next("/")
      }
    }

    xhr.onerror = () => {
      next("/")
    }

    xhr.send()
  } else {
    next()
  }
})

window.addEventListener("unhandledrejection", (event) => {
  if (event.reason && event.reason.status === 401) {
    router.push("/")
  }
})

const app = createApp(App)

app.config.globalProperties.$debug = (message, data) => {
  console.log(`[DEBUG] ${message}`, data)
}

app.use(router)
app.mount("#app")