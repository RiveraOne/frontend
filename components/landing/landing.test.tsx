// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import HeroSection from "./hero-section";
import FeaturesSection from "./features-section";
import HowItWorks from "./how-it-works";
import PricingPreview from "./pricing-preview";
import SocialProof from "./social-proof";
import FAQSection from "./faq-section";
import CTASection from "./cta-section";
import TickerMarquee from "./ticker-marquee";

describe("Landing — smoke renders", () => {
  it("hero renders without crashing and contains key copy + CTAs", () => {
    render(<HeroSection />);
    // Loose match: the brand name should be on the page somewhere.
    expect(document.body.textContent).toMatch(/Metra/i);
    expect(screen.getAllByRole("link").length).toBeGreaterThan(0);
  });

  it("features section renders", () => {
    const { container } = render(<FeaturesSection />);
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it("how-it-works renders", () => {
    const { container } = render(<HowItWorks />);
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it("pricing preview shows both plans with prices", () => {
    render(<PricingPreview />);
    expect(screen.getByText(/\$4\.99/)).toBeInTheDocument();
    expect(screen.getByText(/\$9\.99/)).toBeInTheDocument();
    expect(screen.getByText(/Get Essential/i)).toBeInTheDocument();
    // "Get Pro" button + the "Compare all features" link both exist
    expect(screen.getByText(/Get Pro/i)).toBeInTheDocument();
  });

  it("pricing preview Essential CTA links to /register", () => {
    render(<PricingPreview />);
    const essentialCta = screen.getByText(/Get Essential/i).closest("a");
    expect(essentialCta).toHaveAttribute("href", "/register");
  });

  it("social proof renders", () => {
    const { container } = render(<SocialProof />);
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it("FAQ shows multiple Q&A items", () => {
    render(<FAQSection />);
    expect(screen.getByText(/Common questions/i)).toBeInTheDocument();
    expect(screen.getByText(/connect my bank/i)).toBeInTheDocument();
    expect(screen.getByText(/start free and upgrade/i)).toBeInTheDocument();
    expect(screen.getByText(/financial advice/i)).toBeInTheDocument();
  });

  it("CTA section renders", () => {
    const { container } = render(<CTASection />);
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it("ticker marquee renders", () => {
    const { container } = render(<TickerMarquee />);
    expect(container.firstElementChild).toBeInTheDocument();
  });
});
