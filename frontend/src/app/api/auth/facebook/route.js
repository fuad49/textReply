import { NextResponse } from 'next/server';

export async function GET(request) {
    const url = new URL(request.url);
    const protocol = url.protocol;
    const host = request.headers.get('host') || url.host;
    const baseUrl = `${protocol}//${host}`;

    const fbAuthUrl = `https://www.facebook.com/v21.0/dialog/oauth?` +
        `client_id=${process.env.FB_APP_ID}` +
        `&redirect_uri=${encodeURIComponent(`${baseUrl}/api/auth/facebook/callback`)}` +
        `&scope=pages_show_list,pages_manage_metadata,pages_messaging,pages_read_engagement`;

    return NextResponse.redirect(fbAuthUrl);
}
