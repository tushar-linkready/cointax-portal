"use client";

import Link from "next/link";
import {
  ClipboardList,
  Users,
  UserCog,
  Building2,
  ShieldCheck,
  Bell,
  Check,
} from "lucide-react";

const features = [
  {
    icon: ClipboardList,
    title: "Task Management",
    description:
      "Track ITR, GST, TDS filings and more. Organize work with deadlines, priorities, and status updates.",
  },
  {
    icon: Users,
    title: "Client Portal",
    description:
      "Clients can raise requests, upload documents, and track the progress of their filings in real time.",
  },
  {
    icon: UserCog,
    title: "Team Collaboration",
    description:
      "Assign tasks to team members, track progress, and ensure nothing falls through the cracks.",
  },
  {
    icon: Building2,
    title: "Multi-tenant",
    description:
      "Each firm gets their own isolated workspace with separate data, users, and configurations.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance Ready",
    description:
      "Pre-built categories for Indian CA compliance including ITR, GST, TDS, ROC, and audit workflows.",
  },
  {
    icon: Bell,
    title: "Real-time Updates",
    description:
      "Instant notifications and status tracking keep your team and clients always in the loop.",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "499",
    popular: false,
    features: [
      "Up to 50 clients",
      "3 team members",
      "Email support",
    ],
  },
  {
    name: "Pro",
    price: "999",
    popular: true,
    features: [
      "Unlimited clients",
      "Unlimited team",
      "Priority support",
      "Custom branding",
      "API access",
    ],
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section
        className="relative py-24 px-6 md:py-32"
        style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #102a43 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Streamline Your CA Practice
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            The modern client portal for CA &amp; CS firms in India. Manage
            tasks, clients, and compliance &mdash; all in one place.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-block rounded-lg bg-[#1e3a5f] border-2 border-white px-8 py-3 text-base font-semibold text-white shadow-lg hover:bg-[#162d4a] transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="inline-block rounded-lg border-2 border-white px-8 py-3 text-base font-semibold text-white hover:bg-white/10 transition-colors"
            >
              See Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900">
            Everything your firm needs
          </h2>
          <p className="mt-4 text-center text-gray-500 max-w-xl mx-auto">
            Built specifically for Indian CA and CS firms to simplify
            day-to-day operations.
          </p>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#1e3a5f]/10 mb-4">
                    <Icon className="w-6 h-6 text-[#1e3a5f]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-center text-gray-500 max-w-lg mx-auto">
            Choose the plan that fits your firm. No hidden fees.
          </p>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 border-2 ${
                  plan.popular
                    ? "border-teal-500 shadow-xl"
                    : "border-gray-200 shadow-sm"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full">
                    Popular
                  </span>
                )}
                <h3 className="text-xl font-bold text-gray-900">
                  {plan.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-[#1e3a5f]">
                    &#8377;{plan.price}
                  </span>
                  <span className="text-gray-500 text-sm">/month</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <Check className="w-4 h-4 text-teal-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`mt-8 block text-center rounded-lg px-6 py-3 text-sm font-semibold transition-colors ${
                    plan.popular
                      ? "bg-[#1e3a5f] text-white hover:bg-[#162d4a]"
                      : "border-2 border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white"
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-white font-semibold text-lg">
              Cointax Financial Services LLP
            </p>
            <p className="text-sm mt-1">
              &copy; 2024-2025 Cointax Financial Services LLP. All rights
              reserved.
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="#" className="hover:text-white transition-colors">
              About
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Contact
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
