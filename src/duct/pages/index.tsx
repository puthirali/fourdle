import type { DuctPageComponent, PageMeta } from "@duct-ui/router"
import App from "@components/App"

export function getLayout() {
  return 'default.html'
}

export function getPageMeta(): PageMeta {
  return {
    title: '4 * wordle',
    description: '4 * wordle - Four simultaneous Wordle games',
    scripts: ['/src/duct/pages/index.tsx']
  }
}

const HomePage: DuctPageComponent = ({ meta, path, env }) => {
  return <App />
}

export default HomePage
