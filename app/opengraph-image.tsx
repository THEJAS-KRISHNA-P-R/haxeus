import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'HAXEUS â€” Premium Artistic T-Shirts';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const SITE_HOST = (() => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://haxeus.in";
    try {
        return new URL(siteUrl).host;
    } catch {
        return "haxeus.in";
    }
})();

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: '#000000',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #000 70%)',
                    }}
                />
                <div
                    style={{
                        fontSize: 120,
                        fontWeight: 900,
                        color: 'white',
                        letterSpacing: '-0.04em',
                        position: 'relative',
                    }}
                >
                    HAXEUS
                </div>
                <div
                    style={{
                        fontSize: 28,
                        color: 'rgba(255,255,255,0.5)',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        marginTop: 16,
                        position: 'relative',
                    }}
                >
                    Premium Artistic T-Shirts
                </div>
                <div
                    style={{
                        position: 'absolute',
                        bottom: 40,
                        fontSize: 18,
                        color: 'rgba(255,255,255,0.3)',
                    }}
                >
                    {SITE_HOST}
                </div>
            </div>
        ),
        { ...size }
    );
}

