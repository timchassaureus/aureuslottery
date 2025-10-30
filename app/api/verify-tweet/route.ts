import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ valid: false, reason: 'missing_url' }, { status: 400 });
    }

    const regex = /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/[^\/]+\/status\/\d+/i;
    const isFormatOk = regex.test(url.trim());
    if (!isFormatOk) {
      return NextResponse.json({ valid: false, reason: 'invalid_format' }, { status: 200 });
    }

    // Soft validation without X API (placeholder until API keys are provided)
    // Optionally, try to fetch the URL (may be blocked by X)
    let reachable = false;
    try {
      const res = await fetch(url, { method: 'GET', cache: 'no-store' });
      reachable = res.ok;
    } catch (_) {
      reachable = false;
    }

    return NextResponse.json({ valid: true, reachable });
  } catch (e) {
    return NextResponse.json({ valid: false, reason: 'server_error' }, { status: 500 });
  }
}


