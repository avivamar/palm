import { redirect } from 'next/navigation'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function PalmFlowIndexPage({ params }: Props) {
  const { locale } = await params
  // 重定向到第一步
  redirect(`/${locale}/palm/flow/0`)
}