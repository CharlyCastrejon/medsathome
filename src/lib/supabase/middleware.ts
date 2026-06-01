import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register");

  const isFamilyPage = request.nextUrl.pathname.startsWith("/family");

  const isPublicPage = isAuthPage || isFamilyPage;

  if (!user && !isPublicPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const { data: membership } = await supabase
      .from("user_families")
      .select("family_id")
      .eq("user_id", user.id)
      .single();

    if (membership) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    } else {
      const url = request.nextUrl.clone();
      url.pathname = "/family";
      return NextResponse.redirect(url);
    }
  }

  if (user && !isPublicPage && request.nextUrl.pathname.startsWith("/dashboard")) {
    const { data: membership } = await supabase
      .from("user_families")
      .select("family_id")
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      const url = request.nextUrl.clone();
      url.pathname = "/family";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
