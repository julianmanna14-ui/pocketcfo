import TopBar from '@/components/TopBar'
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import Features from '@/components/Features'
import SocialProof from '@/components/SocialProof'

export default function Home() {
  return (
    <main>
      <TopBar />
      <Nav />
      <Hero />
      <HowItWorks />
      <Features />
      <SocialProof />
    </main>
  )
}
