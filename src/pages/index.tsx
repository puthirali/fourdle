import type { DuctPageComponent, PageMeta } from "@duct-ui/router"
import App from "@components/App"

export function getLayout() {
  return 'default.html'
}

export function getPageMeta(): PageMeta {
  return {
    title: '4 * wordle',
    description: '4 * wordle - Four simultaneous Wordle games',
  }
}

const HomePage: DuctPageComponent = () => {
  return <App />
}

export default HomePage
