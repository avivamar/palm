import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function Home({ params }: PageProps) {
  const { locale } = await params;
  
  // 重定向到 Palm 首页
  redirect(`/${locale}/palm`);
}
