import '../styles/marketing.css';
import { CtaBand } from './CtaBand';
import { Faq } from './Faq';
import { Features } from './Features';
import { Hero } from './Hero';
import { LogoCloud } from './LogoCloud';
import { Metrics } from './Metrics';
import { Pricing } from './Pricing';
import { SiteFooter } from './SiteFooter';
import { SiteNav } from './SiteNav';
import { Testimonials } from './Testimonials';
import { WorkflowSection } from './WorkflowSection';

export function Landing() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <LogoCloud />
        <Features />
        <Metrics />
        <WorkflowSection />
        <Testimonials />
        <Pricing />
        <Faq />
        <CtaBand />
      </main>
      <SiteFooter />
    </>
  );
}
