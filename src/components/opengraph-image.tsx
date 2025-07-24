import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Rolitt';
export const size = {
  width: 1200,
  height: 630,
};

type Props = {
  title?: string;
};

export default async function Image({ title = 'Rolitt' }: Props) {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom, #000000, #434343)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 128,
            background: 'white',
            backgroundClip: 'text',
            color: 'transparent',
            marginBottom: 24,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 32,
            color: 'white',
          }}
        >
          Your Premium Shopping Destination
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
