import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface WelcomeEmailProps {
  customerName?: string;
  discountCode: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://haxeus.in";

export const WelcomeEmail = ({
  customerName,
  discountCode,
}: WelcomeEmailProps) => {
  const previewText = "Welcome to HAXEUS. Here's your 10% off code inside.";

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>HAXEUS</Heading>
            <Text style={tagline}>ART YOU CAN WEAR</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Welcome{customerName ? `, ${customerName}` : ""}.</Heading>
            <Text style={text}>
              You're now part of something different. HAXEUS is built for those who refuse to blend in — every drop is a limited piece of wearable art, designed to say something without saying a word.
            </Text>

            <Section style={perksBox}>
              <Text style={perksTitle}>What to expect</Text>
              
              <Section style={perkRow}>
                <Text style={perkItem}>
                  <span style={bullet}>→</span> <strong>Limited drops</strong> — each design has a hard cap. Once it's gone, it's gone.
                </Text>
              </Section>
              
              <Section style={perkRow}>
                <Text style={perkItem}>
                  <span style={bullet}>→</span> <strong>Early access</strong> — subscribers hear about new drops before anyone else.
                </Text>
              </Section>

              <Section style={perkRow}>
                <Text style={perkItem}>
                  <span style={bullet}>→</span> <strong>No spam</strong> — we only email when something real is happening.
                </Text>
              </Section>
            </Section>

            <Section style={discountBox}>
              <Text style={discountTitle}>Your Welcome Gift</Text>
              <Text style={discountMain}>10% OFF</Text>
              <Section style={codeBox}>
                <Text style={codeLabel}>USE CODE</Text>
                <Text style={codeValue}>{discountCode}</Text>
              </Section>
            </Section>

            <Section style={{ textAlign: "center", marginTop: "32px" }}>
              <Link href={`${baseUrl}/products`} style={button}>
                Shop the Collection
              </Link>
            </Section>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              © 2026 HAXEUS. Made with obsession in India.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;

const main = {
  backgroundColor: "#0a0a0a",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 24px",
  maxWidth: "580px",
};

const header = {
  textAlign: "center" as const,
  marginBottom: "40px",
};

const logo = {
  color: "#e93a3a",
  fontSize: "28px",
  fontWeight: "900",
  letterSpacing: "5px",
  margin: "0",
};

const tagline = {
  color: "#444",
  fontSize: "11px",
  letterSpacing: "3px",
  margin: "5px 0 0",
  textTransform: "uppercase" as const,
};

const content = {
  padding: "0",
};

const h1 = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "700",
  margin: "0 0 16px",
};

const text = {
  color: "#666",
  fontSize: "14px",
  margin: "0 0 28px",
  lineHeight: "1.8",
};

const perksBox = {
  backgroundColor: "#111",
  border: "1px solid #1a1a1a",
  borderRadius: "14px",
  padding: "24px",
  marginBottom: "28px",
};

const perksTitle = {
  color: "#444",
  fontSize: "11px",
  textTransform: "uppercase" as const,
  letterSpacing: "2px",
  margin: "0 0 18px",
};

const perkRow = {
  marginBottom: "12px",
};

const perkItem = {
  color: "#666",
  margin: "0",
  fontSize: "14px",
  lineHeight: "1.5",
};

const bullet = {
  color: "#e93a3a",
  marginRight: "8px",
  fontWeight: "bold",
};

const discountBox = {
  textAlign: "center" as const,
  padding: "32px 0",
};

const discountTitle = {
  color: "#4ade80",
  fontSize: "14px",
  fontWeight: "700",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0 0 8px",
};

const discountMain = {
  color: "#ffffff",
  fontSize: "48px",
  fontWeight: "900",
  margin: "0 0 24px",
};

const codeBox = {
  display: "inline-block",
  padding: "16px 32px",
  backgroundColor: "#111",
  border: "1px dashed #e93a3a",
  borderRadius: "8px",
};

const codeLabel = {
  color: "#555",
  fontSize: "10px",
  letterSpacing: "2px",
  margin: "0 0 4px",
};

const codeValue = {
  color: "#e93a3a",
  fontSize: "24px",
  fontWeight: "900",
  letterSpacing: "3px",
  margin: "0",
};

const button = {
  backgroundColor: "#e93a3a",
  color: "#fff",
  padding: "16px 40px",
  borderRadius: "100px",
  textDecoration: "none",
  fontWeight: "700",
  fontSize: "15px",
  letterSpacing: "0.5px",
  display: "inline-block",
};

const footer = {
  marginTop: "40px",
  borderTop: "1px solid #1a1a1a",
  paddingTop: "24px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#333",
  fontSize: "11px",
  margin: "0",
  textTransform: "uppercase" as const,
};
