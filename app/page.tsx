import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Footer from './components/Footer'
import Contact from './components/Contact'
import Pricing from './components/Pricing'
import Features from './components/Features'

export default function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <Features />
      <Pricing />
      <Contact />
      <Footer />
    </div>
  );
}
