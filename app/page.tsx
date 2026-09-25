import React from 'react';
import { getSiteData } from '@/lib/db/client';
import { Navbar } from '@/components/navigation/Navbar';
import { HeroSection } from '@/components/hero/HeroSection';
import { AboutSection } from '@/components/about/AboutSection';
import { ExperienceSection } from '@/components/experience/ExperienceSection';
import { SkillsSection } from '@/components/skills/SkillsSection';
import { ProjectsSection } from '@/components/projects/ProjectsSection';
import { ServicesSection } from '@/components/services/ServicesSection';
import { TestimonialsSection } from '@/components/testimonials/TestimonialsSection';
import { ContactSection } from '@/components/contact/ContactSection';
import { Footer } from '@/components/footer/Footer';

export const revalidate = 0; // Dynamic on-demand revalidation for immediate live content reflection

export default async function HomePage() {
  const data = await getSiteData(false);
  const { settings, projects, experiences, skillGroups, services, testimonials, socialLinks, contactChannels } = data;

  return (
    <div className="relative min-h-screen bg-[#07090D] overflow-hidden">
      {/* Floating Glass Navigation Bar */}
      <Navbar cvUrl={settings.cvUrl} privacyTermsUrl={settings.privacyTermsUrl} />

      <main id="main-content">
        {/* Hero Section */}
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

        {/* About & Statistics */}
        <AboutSection
          shortBio={settings.shortBio}
          shortBioAr={settings.shortBioAr}
          longBio={settings.longBio}
          longBioAr={settings.longBioAr}
          stats={settings.stats}
        />

        {/* Career Experience Timeline */}
        <ExperienceSection experiences={experiences} />

        {/* Skills & Software Matrix */}
        <SkillsSection skillGroups={skillGroups} />

        {/* Asymmetric Editorial Projects Showcase */}
        <ProjectsSection projects={projects} />

        {/* Services & Specialized Creative Solutions */}
        <ServicesSection services={services} />

        {/* Client Endorsements & Testimonials */}
        <TestimonialsSection testimonials={testimonials} />

        {/* Get In Touch & Direct Collaboration */}
        <ContactSection
          email={settings.contactEmail}
          whatsappUrl={settings.whatsappUrl}
          linkedinUrl={settings.linkedinUrl}
          contactChannels={contactChannels}
        />
      </main>

      {/* Footer */}
      <Footer
        socialLinks={socialLinks}
        contactEmail={settings.contactEmail}
        whatsappUrl={settings.whatsappUrl}
        linkedinUrl={settings.linkedinUrl}
      />
    </div>
  );
}
