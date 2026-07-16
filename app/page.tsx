import TopBar from '@/components/TopBar'
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import Problem from '@/components/Problem'
import HowItWorks from '@/components/HowItWorks'
import WhyNotChatGPT from '@/components/WhyNotChatGPT'
import SocialProof from '@/components/SocialProof'
import Pricing from '@/components/Pricing'
import FAQ from '@/components/FAQ'
import FinalCTA from '@/components/FinalCTA'
import Footer from '@/components/Footer'
import DemoChat from '@/components/DemoChat'

export default function Home() {
  return (
    <main>
      <TopBar />
      <Nav />
      <Hero />
      <SocialProof />
      <Problem />
      <HowItWorks />
      <WhyNotChatGPT />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
      <DemoChat />
    </main>
  )
}
