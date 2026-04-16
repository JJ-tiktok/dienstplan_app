import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/png';

export default async function Icon() {
  const iconPath = path.join(process.cwd(), 'public', 'thomm.png');
  const iconBuffer = await readFile(iconPath);
  const iconBase64 = iconBuffer.toString('base64');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'white',
        }}
      >
        <img
          src={`data:image/png;base64,${iconBase64}`}
          alt="Veranstaltungsplaner Thomm"
          width={32}
          height={32}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
