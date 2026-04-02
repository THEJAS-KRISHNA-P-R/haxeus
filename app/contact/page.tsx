import { Metadata } from 'next';
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: 'Contact | HAXEUS Support',
  description: 'Connect with our team for orders, collaborations, or general inquiries. Direct WhatsApp and Instagram support available.',
};

export default function ContactPage() {
  return (
    <main className="bg-theme min-h-screen pt-32 pb-20 px-6 lg:px-8">
      <ContactForm />
    </main>
  );
}

