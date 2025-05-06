import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${name}=`))
          return cookie ? cookie.split('=')[1] : ''
        },
        set(name: string, value: string, options: any) {
          document.cookie = `${name}=${value}; ${Object.entries(options)
            .map(([key, val]) => `${key}=${val}`)
            .join('; ')}`
        },
        remove(name: string, options: any) {
          document.cookie = `${name}=; ${Object.entries(options)
            .map(([key, val]) => `${key}=${val}`)
            .join('; ')}; expires=Thu, 01 Jan 1970 00:00:00 GMT`
        },
      },
    }
  )
}
