import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function updateSession(request) {
   let supabaseResponse = NextResponse.next({
      request,
   })

   const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_HOST,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
         cookies: {
            getAll() {
               return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
               cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
               supabaseResponse = NextResponse.next({
                  request,
               })
               cookiesToSet.forEach(({ name, value, options }) =>
                  supabaseResponse.cookies.set(name, value, options)
               )
            },
         },
      }
   )

   // IMPORTANT: Avoid writing any logic between createServerClient and
   // supabase.auth.getUser(). A simple mistake could make it very hard to debug
   // issues with users being randomly logged out.

   const {
      data: { user },
   } = await supabase.auth.getUser()

   if (
      !user &&
      !request.nextUrl.pathname.startsWith('/login') &&
      !request.nextUrl.pathname.startsWith('/auth') &&
      !request.nextUrl.pathname.startsWith('/register') &&
      !request.nextUrl.pathname.startsWith('/reset-password') &&
      !request.nextUrl.pathname.startsWith('/update-password') &&
      !request.nextUrl.pathname.startsWith('/share')
   ) {
      // no user, potentially respond by redirecting the user to the login page
      const url = request.nextUrl.clone()

      // if(user) {
      //    const {data: publicUser} = await supabase.from("users").select("active_event").eq("id", user.id);
      //    if(publicUser.length !== 0) {
      //       url.pathname = `/register-for-event/${publicUser[0].active_event}?login=true`
      //       return NextResponse.redirect(url)
      //    }
      // }
      
      url.pathname = '/login'
      return NextResponse.redirect(url)
   }

   // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
   // creating a new response object with NextResponse.next() make sure to:
   // 1. Pass the request in it, like so:
   //    const myNewResponse = NextResponse.next({ request })
   // 2. Copy over the cookies, like so:
   //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
   // 3. Change the myNewResponse object to fit your needs, but avoid changing
   //    the cookies!
   // 4. Finally:
   //    return myNewResponse
   // If this is not done, you may be causing the browser and server to go out
   // of sync and terminate the user's session prematurely!

   return supabaseResponse
}