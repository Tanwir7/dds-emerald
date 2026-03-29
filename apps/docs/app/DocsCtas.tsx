'use client';

import Image from 'next/image';
import { Button } from '@dds/emerald';
import styles from './page.module.css';

export function DocsCtas() {
  return (
    <div className={styles.ctas}>
      <Button asChild className={styles.ctaButton}>
        <a
          href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            className={styles.logo}
            src="/vercel.svg"
            alt="Vercel logomark"
            width={16}
            height={16}
          />
          Launch a Preview
        </a>
      </Button>
      <Button asChild variant="outline" className={styles.ctaButton}>
        <a
          href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Read the Docs
        </a>
      </Button>
    </div>
  );
}
