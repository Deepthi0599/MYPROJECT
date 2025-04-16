declare module 'react-dom/client' {
  import { ReactNode } from 'react'
  import { ReactDOM } from 'react-dom'
  export interface Root {
    render: (element: ReactNode) => void
  }
  export function createRoot(container: Element | DocumentFragment): Root
}
