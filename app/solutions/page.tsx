import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Spotlight } from "@/components/ui/spotlight"

export const metadata: Metadata = {
  title: "Ron AI Solutions | Healthcare AI Platform",
  description:
    "Explore Ron AI's comprehensive healthcare AI solutions that transform clinical workflows, improve patient outcomes, and reduce administrative burden.",
}

export default function SolutionsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900 overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(59, 130, 246, 0.15)" />
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-6xl font-audiowide text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
            Healthcare AI Solutions
          </h1>
          <p className="text-xl md:text-2xl text-center max-w-3xl mx-auto text-slate-600">
            Transforming healthcare delivery with intelligent automation and clinical decision support
          </p>
        </div>
        <div className="absolute inset-0 z-0">
          <Image src="/images/circuit-pattern.png" alt="Circuit Pattern" fill className="object-cover opacity-20" />
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solutions.map((solution, index) => (
              <SolutionCard key={index} {...solution} />
            ))}
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl -z-10 opacity-30" />
      </section>

      {/* Integration Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-audiowide text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
            Seamless Integration
          </h2>
          <div className="bg-white rounded-2xl p-8 border border-blue-200 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-semibold mb-4 text-slate-900">Connect with Your Existing Systems</h3>
                <p className="text-slate-600 mb-6">
                  Ron AI integrates with your existing EHR, practice management, and other healthcare IT systems through
                  secure, standards-based APIs and connectors.
                </p>
                <ul className="space-y-3">
                  {integrations.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="mr-3 mt-1 text-cyan-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <span className="text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative h-[300px] rounded-xl overflow-hidden">
                <Image src="/images/tech-diagram.png" alt="Integration Diagram" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-70"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-audiowide mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
            Ready to Transform Your Healthcare Operations?
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-10">
            Schedule a demo to see how Ron AI can help your organization improve clinical workflows, reduce
            administrative burden, and enhance patient care.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium text-lg transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:scale-105"
          >
            Request a Demo
          </Link>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-white to-transparent -z-10" />
      </section>
    </main>
  )
}

// Solution Card Component
function SolutionCard({
  title,
  description,
  icon,
  features,
}: {
  title: string
  description: string
  icon: string
  features: string[]
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-blue-200 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="w-16 h-16 mb-6 relative">
        <Image src={icon || "/placeholder.svg"} alt={title} width={64} height={64} className="object-contain" />
        <div className="absolute -inset-1 bg-blue-500/20 rounded-full blur-md -z-10" />
      </div>
      <h3 className="text-2xl font-semibold mb-3 text-slate-900">{title}</h3>
      <p className="text-slate-600 mb-6">{description}</p>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <div className="mr-2 mt-1 text-cyan-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <span className="text-slate-700 text-sm">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Data
const solutions = [
  {
    title: "Prior Authorization Automation",
    description:
      "Streamline and automate the prior authorization process to reduce administrative burden and accelerate care delivery.",
    icon: "/images/prior-auth-glow.svg",
    features: [
      "Automated documentation gathering",
      "Real-time status tracking",
      "ML-powered approval prediction",
      "Payer-specific requirement handling",
    ],
  },
  {
    title: "Clinical Documentation",
    description:
      "Enhance clinical documentation with AI-powered assistance that improves accuracy, completeness, and efficiency.",
    icon: "/images/automation-glow.svg",
    features: [
      "Ambient clinical intelligence",
      "Automated note generation",
      "Coding suggestions",
      "Documentation completeness checks",
    ],
  },
  {
    title: "Patient Communication",
    description: "Engage patients with personalized, timely communication that improves adherence and outcomes.",
    icon: "/images/communication-glow.svg",
    features: [
      "Personalized outreach",
      "Appointment reminders",
      "Care plan adherence monitoring",
      "Multilingual support",
    ],
  },
  {
    title: "SDOH Integration",
    description: "Identify and address social determinants of health to provide holistic, patient-centered care.",
    icon: "/images/sdoh-glow.svg",
    features: ["SDOH risk assessment", "Community resource matching", "Referral management", "Outcome tracking"],
  },
  {
    title: "Interoperability Hub",
    description:
      "Connect disparate healthcare systems and data sources to create a unified view of patient information.",
    icon: "/images/interop-glow.svg",
    features: [
      "FHIR-compliant integration",
      "Secure data exchange",
      "Legacy system connectivity",
      "Real-time data synchronization",
    ],
  },
  {
    title: "Proactive Care Management",
    description: "Identify at-risk patients and intervene proactively to prevent adverse events and improve outcomes.",
    icon: "/images/proactive-glow.svg",
    features: [
      "Predictive risk modeling",
      "Care gap identification",
      "Intervention recommendations",
      "Outcome tracking and analysis",
    ],
  },
]

const integrations = [
  "Epic, Cerner, Allscripts, and other major EHR systems",
  "Practice management and billing systems",
  "FHIR and HL7 interfaces",
  "Secure cloud and on-premises deployment options",
  "Custom API development for specialized systems",
]

