import { Metadata } from 'next';
import ContactForm from "@/components/ContactForm";
import { JoinMovementCTA } from "@/components/JoinMovementCTA";

export const metadata: Metadata = {
  title: 'Contact | HAXEUS Support',
  description: 'Connect with our team for orders, collaborations, or general inquiries. Direct WhatsApp and Instagram support available.',
  openGraph: {
    url: "https://haxeus.in/contact",
    title: "Contact | HAXEUS Support",
    description: "Connect with our team for orders, collaborations, or general inquiries. Direct WhatsApp and Instagram support available.",
    images: ["https://haxeus.in/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | HAXEUS Support",
    description: "Connect with our team for orders, collaborations, or general inquiries. Direct WhatsApp and Instagram support available.",
    images: ["https://haxeus.in/og-image.jpg"],
  },
};

export default function ContactPage() {
  return (
    <>
      <main className="bg-theme min-h-screen pt-32 pb-20 px-6 lg:px-8">
        <ContactForm />
      </main>
      <JoinMovementCTA />
    </>
  );
}

