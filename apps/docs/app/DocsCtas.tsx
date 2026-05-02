'use client';

import Image from 'next/image';
import { Button } from '@dds/emerald';
import styles from './page.module.css';

const openExternalUrl = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

export function DocsCtas() {
  return (
    <div className={styles.ctas}>
      <Button
        className={styles.ctaButton}
        onClick={() =>
          openExternalUrl(
            'https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app'
          )
        }
      >
        <Image
          className={styles.logo}
          src="/vercel.svg"
          alt="Vercel logomark"
          width={16}
          height={16}
        />
        Launch a Preview
      </Button>
      <Button
        variant="outline"
        className={styles.ctaButton}
        onClick={() =>
          openExternalUrl(
            'https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app'
          )
        }
      >
        Read the Docs
      </Button>
    </div>
  );
}
