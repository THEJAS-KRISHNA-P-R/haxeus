import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const title = searchParams.get('title') || 'HAXEUS'
    const price = searchParams.get('price')
    const category = searchParams.get('category') || 'Streetwear'

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#050505',
            backgroundImage: 'radial-gradient(circle at 25% 25%, #1a1a1a 0%, #050505 100%)',
            position: 'relative'
          }}
        >
          {/* Accent Glow */}
          <div
            style={{
              position: 'absolute',
              top: '-10%',
              right: '-10%',
              width: '400px',
              height: '400px',
              backgroundColor: 'rgba(233, 58, 58, 0.05)',
              borderRadius: '100%',
              filter: 'blur(100px)'
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '60px 80px',
              borderRadius: '40px',
              maxWidth: '80%'
            }}
          >
            <div
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: '#e93a3a',
                letterSpacing: '0.4em',
                marginBottom: 20,
                textTransform: 'uppercase'
              }}
            >
              {category}
            </div>
            
            <div
              style={{
                fontSize: 72,
                fontWeight: 900,
                color: 'white',
                textAlign: 'center',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                marginBottom: 20
              }}
            >
              {title}
            </div>

            {price && (
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.5)',
                  letterSpacing: '0.1em'
                }}
              >
                ₹{price}
              </div>
            )}
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: 60,
              fontSize: 20,
              fontWeight: 700,
              color: 'rgba(255, 255, 255, 0.3)',
              letterSpacing: '0.8em',
              textTransform: 'uppercase'
            }}
          >
            HAXEUS.IN
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630
      }
    )
  } catch (e: any) {
    console.log(`${e.message}`)
    return new Response(`Failed to generate the image`, {
      status: 500
    })
  }
}

