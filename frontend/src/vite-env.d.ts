/// <reference types="vite/client" />

interface Window {
    google?: any
}

declare module 'lucide-react' {
  import * as React from 'react'
  export const Handshake: React.FC<React.SVGProps<SVGSVGElement>>
  export const BookOpenCheck: React.FC<React.SVGProps<SVGSVGElement>>
  export const Users: React.FC<React.SVGProps<SVGSVGElement>>
  export const Github: React.FC<React.SVGProps<SVGSVGElement>>
  export const Mail: React.FC<React.SVGProps<SVGSVGElement>>
  export const Linkedin: React.FC<React.SVGProps<SVGSVGElement>>
}