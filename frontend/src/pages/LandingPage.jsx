import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import ExampleCards from '../components/ExampleCards';
import TrustSection from '../components/TrustSection';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg selection:bg-accent selection:text-white">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <ExampleCards />
        <TrustSection />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
