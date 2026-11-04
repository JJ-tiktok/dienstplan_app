import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Icon für „Zum Home-Bildschirm" auf iPhone/iPad. Muss quadratisch sein –
 * das Wappen (500×621) wird mittig auf weißen Grund gesetzt statt verzerrt.
 */
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default async function AppleIcon() {
  const logo = await readFile(path.join(process.cwd(), 'public', 'thomm.png'));
  const src = `data:image/png;base64,${logo.toString('base64')}`;

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
        <img src={src} alt="" width={113} height={140} />
      </div>
    ),
    { ...size }
  );
}
