import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { APP_NAME } from '@/lib/branding';

/** Vorschaubild für geteilte Links (WhatsApp, Signal, Facebook …). */
export const alt = `${APP_NAME} – Dienste übernehmen und Termine im Blick behalten`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  const logo = await readFile(path.join(process.cwd(), 'public', 'thomm.png'));
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 64,
          padding: '0 96px',
          background: 'linear-gradient(135deg, #F8FAFC 0%, #DBEAFE 100%)',
        }}
      >
        {/* 500×621 Original, proportional skaliert */}
        <img src={logoSrc} alt="" width={290} height={360} />
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 640 }}>
          <div style={{ fontSize: 68, fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
            {APP_NAME}
          </div>
          <div style={{ marginTop: 28, fontSize: 34, color: '#475569', lineHeight: 1.35 }}>
            Termine im Blick, Dienste mit einem Klick übernehmen.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
