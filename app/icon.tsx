import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #6d28d9 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '22%',
        }}
      >
        <span
          style={{
            color: '#fbbf24',
            fontSize: 300,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-0.05em',
          }}
        >
          A
        </span>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
