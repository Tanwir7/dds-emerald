// import type { Metadata } from 'next';
// import {
//     Barlow_Condensed,
//     DM_Sans,
//     JetBrains_Mono,
// } from 'next/font/google';
// import '@dds/emerald-tokens/styles';
// import '@dds/emerald/styles';
// import './globals.css';

// const barlowCondensed = Barlow_Condensed({
//     subsets: ['latin'],
//     weight: ['400', '500', '600', '700', '800', '900'],
//     variable: '--dds-font-display',
//     display: 'swap',
// });

// const dmSans = DM_Sans({
//     subsets: ['latin'],
//     axes: ['opsz'],         // include optical size axis
//     variable: '--dds-font-sans',
//     display: 'swap',
// });

// const jetbrainsMono = JetBrains_Mono({
//     subsets: ['latin'],
//     variable: '--dds-font-mono',
//     display: 'swap',
// });

// export const metadata: Metadata = {
//     title: 'Emerald — DDS Design System',
//     description: 'A precise, open-source design system by Digital Dev Studio.',
// };

// export default function RootLayout({
//     children,
// }: {
//     children: React.ReactNode;
// }) {
//     return (
//         <html
//             lang="en"
//             className={`${barlowCondensed.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
//             suppressHydrationWarning
//         >
//             <body>{children}</body>
//         </html>
//     );
// }
