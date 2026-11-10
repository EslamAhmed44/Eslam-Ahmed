import React from 'react';
import { getSiteData } from '@/lib/db/client';
import { IntroOverlay } from '@/components/intro/IntroOverlay';
import { Navbar } from '@/components/navigation/Navbar';
import { HeroSection } from '@/components/hero/HeroSection';
import { ProjectsSection } from '@/components/projects/ProjectsSection';
import { AboutSection } from '@/components/about/AboutSection';
import { ExperienceSection } from '@/components/experience/ExperienceSection';
import { ServicesSection } from '@/components/services/ServicesSection';
import { WorkflowSection } from '@/components/workflow/WorkflowSection';
import { ContactSection } from '@/components/contact/ContactSection';
import { Footer } from '@/components/footer/Footer';

export const revalidate = 0; // Dynamic live data reflection

export default async function HomePage() {
  const data = await getSiteData(false);
  const {
    settings,
    projects,
    experiences,
    skillGroups,
    services,
    testimonials,
    socialLinks,
    contactChannels,
  } = data;

  return (
    <div className="relative min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300 overflow-hidden">
      {/* 1. Intro Experience — Press Start (First visit only with skip control) */}
      <IntroOverlay />

      {/* Floating Glass Navigation Bar with Theme & Audio Controls */}
      <Navbar cvUrl={settings.cvUrl} privacyTermsUrl={settings.privacyTermsUrl} />

      <main id="main-content">
        {/* 2. Hero Section: Islam Ahmed — Graphic & Motion Graphic Designer */}
        <HeroSection
          designerName={settings.designerName}
          designerNameAr={settings.designerNameAr}
          heroHeadline={settings.heroHeadline}
          heroHeadlineAr={settings.heroHeadlineAr}
          rotatingRoles={settings.rotatingRoles}
          rotatingRolesAr={settings.rotatingRolesAr}
          whatsappUrl={settings.whatsappUrl}
          socialLinks={socialLinks}
          profileImage={settings.ogImageUrl || '/images/islam-ahmed.jpg'}
        />

        {/* 3. Selected Work: Mixed Editorial Gallery with Interactive Internal Modal */}
        <ProjectsSection projects={projects} />

        {/* 4. About Me: Brand Story, "Gravity in Motion" Philosophy & Skills */}
        <AboutSection
          shortBio={settings.shortBio}
          shortBioAr={settings.shortBioAr}
          longBio={settings.longBio}
          longBioAr={settings.longBioAr}
          stats={settings.stats}
        />

        {/* 4b. Career & Development Timeline (Starting from 2025) */}
        <ExperienceSection experiences={experiences} />

        {/* 5. Services: Creative Numbered List with Expandable Tools & CTA */}
        <ServicesSection services={services} />

        {/* 6. Workflow: 01 Brief ➔ 02 Research ➔ 03 Concept ➔ 04 Design ➔ 05 Delivery */}
        <WorkflowSection />

        {/* 7. Contact: Direct WhatsApp, Prepared Email, and Verified Socials (NO fake form) */}
        <ContactSection
          email={settings.contactEmail}
          whatsappUrl={settings.whatsappUrl}
          linkedinUrl={settings.linkedinUrl}
          contactChannels={contactChannels}
        />
      </main>

      {/* 8. Footer: Monumental Editorial Statement & Verified Links */}
      <Footer
        socialLinks={socialLinks}
        contactEmail={settings.contactEmail}
        whatsappUrl={settings.whatsappUrl}
        linkedinUrl={settings.linkedinUrl}
      />
    </div>
  );
}
