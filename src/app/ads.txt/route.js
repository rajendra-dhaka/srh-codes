export function GET() {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const body = publisherId
    ? `google.com, ${publisherId.replace("ca-", "")}, DIRECT, f08c47fec0942fa0\n`
    : "# Add NEXT_PUBLIC_ADSENSE_CLIENT_ID to enable ads.txt\n";

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
