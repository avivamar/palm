import { setRequestLocale } from 'next-intl/server';

export default async function CenteredLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Animated background pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)]"
      />

      {/* Gradient orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 -left-4 -z-10 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 -right-4 -z-10 w-72 h-72 bg-yellow-300/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-8 left-20 -z-10 w-72 h-72 bg-pink-300/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"
      />

      {/* Main content */}
      <main className="relative z-10 w-full max-w-md">
        {props.children}
      </main>
    </div>
  );
}
