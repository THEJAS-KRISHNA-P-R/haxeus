import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
} from "@react-email/components";

interface WelcomeEmailProps {
  customerName?: string;
  discountCode?: string;
}

export const WelcomeEmail = ({
  customerName,
  discountCode = "WELCOME10",
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to the circle. Here's your 10% off code.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Heading style={h1}>HAXEUS</Heading>
        </Section>
        
        <Section style={heroSection}>
          <Heading style={h2}>Welcome to the circle.</Heading>
          <Text style={text}>
            {customerName ? `Hi ${customerName}, ` : ""}You're in. 
            We're building something different, and we're glad you're part of it.
          </Text>
          <Text style={subText}>
            As a welcome, take 10% off your first order.
          </Text>
        </Section>

        <Section style={codeBox}>
          <Text style={codeLabel}>YOUR CODE</Text>
          <Heading style={codeValue}>{discountCode}</Heading>
          <Text style={codeExpiry}>Use at checkout. Valid for 30 days.</Text>
        </Section>

        <Section style={ctaSection}>
          <Button
            style={button}
            href="https://www.haxeus.in/products"
          >
            Shop now
          </Button>
        </Section>

        <Section style={valuesSection}>
            <Section style={valueGrid}>
                <Text style={valueItem}>Limited drops</Text>
                <Text style={valueDivider}>|</Text>
                <Text style={valueItem}>Artistic designs</Text>
                <Text style={valueDivider}>|</Text>
                <Text style={valueItem}>Made in India</Text>
            </Section>
        </Section>

        <Section style={footer}>
          <Text style={footerText}>
            You subscribed at haxeus.in. To unsubscribe, reply to this email.
          </Text>
          <Text style={footerCopyright}>
            © {new Date().getFullYear()} HAXEUS. All rights reserved.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmail;

const main = {
  backgroundColor: "#0a0a0a",
  fontFamily: 'system-ui, -apple-system, sans-serif',
  margin: "0 auto",
};

const container = {
  maxWidth: "400px",
  margin: "0 auto",
  padding: "40px 20px",
  backgroundColor: "#0a0a0a",
};

const headerSection = {
  textAlign: "center" as const,
  marginBottom: "30px",
};

const h1 = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "bold",
  letterSpacing: "4px",
  margin: "0",
  textTransform: "uppercase" as const,
};

const heroSection = {
  textAlign: "center" as const,
  marginBottom: "40px",
};

const h2 = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: "600",
  margin: "0 0 15px 0",
};

const text = {
  color: "#a0a0a0",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 10px 0",
};

const subText = {
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0",
};

const codeBox = {
  backgroundColor: "rgba(255, 255, 255, 0.03)",
  border: "1px dashed #e93a3a",
  borderRadius: "8px",
  padding: "30px",
  textAlign: "center" as const,
  marginBottom: "40px",
};

const codeLabel = {
  color: "#a0a0a0",
  fontSize: "10px",
  letterSpacing: "2px",
  margin: "0 0 10px 0",
  textTransform: "uppercase" as const,
};

const codeValue = {
  color: "#e93a3a",
  fontSize: "32px",
  fontWeight: "800",
  letterSpacing: "2px",
  margin: "0 0 10px 0",
};

const codeExpiry = {
  color: "#606060",
  fontSize: "11px",
  margin: "0",
};

const ctaSection = {
  textAlign: "center" as const,
  marginBottom: "40px",
};

const button = {
  backgroundColor: "#e93a3a",
  borderRadius: "4px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "bold",
  padding: "16px 32px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
};

const valuesSection = {
    borderTop: "1px solid #222",
    paddingTop: "30px",
    marginBottom: "30px",
};

const valueGrid = {
    textAlign: "center" as const,
};

const valueItem = {
    display: "inline-block",
    color: "#808080",
    fontSize: "11px",
    margin: "0 5px",
    textTransform: "uppercase" as const,
};

const valueDivider = {
    display: "inline-block",
    color: "#333",
    fontSize: "11px",
};

const footer = {
  textAlign: "center" as const,
};

const footerText = {
  color: "#606060",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0 0 10px 0",
};

const footerCopyright = {
  color: "#333",
  fontSize: "11px",
  margin: "0",
};
