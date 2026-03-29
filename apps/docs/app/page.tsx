import Image from 'next/image';
import { DocsCtas } from './DocsCtas';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className={styles.intro}>
          <p className={styles.kicker}>DDS Emerald</p>
          <h1>Build the docs surface with Emerald tokens and components.</h1>
          <p>
            Start in <code>apps/docs/app/page.tsx</code>, then move shared UI into the component
            package as it hardens. For framework guidance, use{' '}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              Next.js templates
            </a>{' '}
            or the{' '}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              official learning path
            </a>{' '}
            .
          </p>
        </div>
        <DocsCtas />
      </main>
    </div>
  );
}
