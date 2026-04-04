import {
  Body,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";

interface OrderConfirmationEmailProps {
  orderId: string;
  displayOrderId?: string;
  orderItems: Array<{ name: string; size: string; quantity: number; price: number }>;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  shippingAddress: { name: string; addressLine1: string; city: string; pincode: string };
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ? `https://${process.env.NEXT_PUBLIC_APP_URL}` : "https://haxeus.in";

export const OrderConfirmationEmail = ({
  orderId,
  displayOrderId,
  orderItems,
  subtotal,
  shipping,
  discount,
  total,
  shippingAddress,
}: OrderConfirmationEmailProps) => {
  const finalDisplayId = displayOrderId || orderId.slice(-8).toUpperCase();
  const previewText = `Order confirmed - HAXEUS #${finalDisplayId}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={mainText}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>HAXEUS</Heading>
            <Text style={tagline}>ORDER CONFIRMED</Text>
          </Section>

          <Section style={content}>
            <Section style={hero}>
               {/* Hero checkmark icon placeholder using inline text styles for robustness */}
               <Text style={heroIcon}>✓</Text>
               <Heading style={h1}>Your order is confirmed</Heading>
               <Text style={h2}>Order #{orderId.slice(-8).toUpperCase()}</Text>
            </Section>

            <Section style={orderSection}>
              <Text style={sectionTitle}>Order details</Text>
              {orderItems.map((item, index) => (
                <Row key={index} style={itemRow}>
                  <Column style={{ verticalAlign: "top" }}>
                    <Text style={itemName}>{item.name}</Text>
                    <Text style={itemSub}>Size: {item.size} | Qty: {item.quantity}</Text>
                  </Column>
                  <Column align="right" style={{ verticalAlign: "top" }}>
                    <Text style={itemPrice}>₹{item.price.toLocaleString()}</Text>
                  </Column>
                </Row>
              ))}

              <Hr style={hr} />

              <Row style={summaryRow}>
                <Column>
                  <Text style={summaryLabel}>Subtotal</Text>
                </Column>
                <Column align="right">
                  <Text style={summaryValue}>₹{subtotal.toLocaleString()}</Text>
                </Column>
              </Row>

              <Row style={summaryRow}>
                <Column>
                  <Text style={summaryLabel}>Shipping</Text>
                </Column>
                <Column align="right">
                  <Text style={shipping === 0 ? freeLabel : summaryValue}>
                    {shipping === 0 ? "FREE" : `₹${shipping.toLocaleString()}`}
                  </Text>
                </Column>
              </Row>

              {discount > 0 && (
                <Row style={summaryRow}>
                  <Column>
                    <Text style={discountLabel}>Discount</Text>
                  </Column>
                  <Column align="right">
                    <Text style={discountValue}>-₹{discount.toLocaleString()}</Text>
                  </Column>
                </Row>
              )}

              <Hr style={summaryHr} />
              
              <Row style={{ paddingTop: "12px" }}>
                <Column>
                  <Text style={totalLabel}>Total Paid</Text>
                </Column>
                <Column align="right">
                  <Text style={totalValue}>₹{total.toLocaleString()}</Text>
                </Column>
              </Row>
            </Section>

            <Section style={addressBox}>
              <Text style={sectionTitle}>Shipping to</Text>
              <Text style={addressText}>
                <strong>{shippingAddress.name}</strong><br />
                {shippingAddress.addressLine1}<br />
                {shippingAddress.city} {shippingAddress.pincode}
              </Text>
            </Section>

            <Section style={estimateBox}>
              <Text style={estimateText}>
                Estimated delivery: 3–5 business days
              </Text>
            </Section>

            <Section style={{ textAlign: "center", margin: "32px 0" }}>
              <Link href={`${baseUrl}/orders/${orderId}`} style={button}>
                Track your order
              </Link>
            </Section>

            <Section style={footer}>
              <Text style={footerContact}>
                Questions? Reply to this email or WhatsApp us at +91 91522 36626
              </Text>
              <Text style={footerCopyright}>© {new Date().getFullYear()} HAXEUS. All rights reserved.</Text>
              <Text style={footerMeta}>You're receiving this because you placed an order on haxeus.in</Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderConfirmationEmail;

const mainText = {
  backgroundColor: "#0a0a0a",
  color: "#ffffff",
  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 24px",
  maxWidth: "600px",
};

const header = {
  textAlign: "center" as const,
  marginBottom: "32px",
};

const logo = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "900",
  letterSpacing: "4px",
  margin: "0",
};

const tagline = {
  color: "#e93a3a",
  fontSize: "10px",
  letterSpacing: "3px",
  margin: "4px 0 0",
  textTransform: "uppercase" as const,
  fontWeight: "bold",
};

const content = {
  padding: "0",
};

const hero = {
  textAlign: "center" as const,
  padding: "24px 0",
};

const heroIcon = {
  fontSize: "48px",
  color: "#e93a3a",
  margin: "0 0 16px",
};

const h1 = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0 0 8px",
};

const h2 = {
  color: "#666",
  fontSize: "14px",
  margin: "0",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
};

const orderSection = {
  backgroundColor: "#111",
  borderRadius: "12px",
  padding: "24px",
  marginTop: "32px",
  border: "1px solid #1a1a1a",
};

const sectionTitle = {
  color: "#444",
  fontSize: "10px",
  textTransform: "uppercase" as const,
  letterSpacing: "2px",
  margin: "0 0 16px",
  fontWeight: "bold",
};

const itemRow = {
  paddingBottom: "12px",
};

const itemName = {
  color: "#fff",
  fontSize: "15px",
  fontWeight: "700",
  margin: "0 0 4px",
};

const itemSub = {
  color: "#666",
  fontSize: "13px",
  margin: "0",
};

const itemPrice = {
  color: "#fff",
  fontSize: "15px",
  fontWeight: "600",
  margin: "0",
};

const hr = {
  borderTop: "1px solid #1a1a1a",
  margin: "20px 0",
};

const summaryRow = {
  paddingBottom: "6px",
};

const summaryLabel = {
  color: "#666",
  fontSize: "14px",
};

const summaryValue = {
  color: "#fff",
  fontSize: "14px",
};

const freeLabel = {
  color: "#4ade80",
  fontSize: "14px",
  fontWeight: "bold",
};

const discountLabel = {
  color: "#4ade80",
  fontSize: "14px",
};

const discountValue = {
  color: "#4ade80",
  fontSize: "14px",
};

const summaryHr = {
  borderTop: "1px solid #1a1a1a",
  margin: "12px 0 0",
};

const totalLabel = {
  color: "#fff",
  fontSize: "16px",
  fontWeight: "700",
};

const totalValue = {
  color: "#e93a3a",
  fontSize: "20px",
  fontWeight: "700",
};

const addressBox = {
  backgroundColor: "#111",
  borderRadius: "12px",
  padding: "24px",
  marginTop: "24px",
  border: "1px solid #1a1a1a",
};

const addressText = {
  color: "#fff",
  fontSize: "14px",
  lineHeight: "1.7",
  margin: "0",
};

const estimateBox = {
  marginTop: "24px",
  textAlign: "center" as const,
};

const estimateText = {
  color: "#4ade80",
  fontSize: "13px",
  fontWeight: "600",
  margin: "0",
};

const button = {
  backgroundColor: "#e93a3a",
  color: "#ffffff",
  padding: "16px 40px",
  borderRadius: "100px",
  textDecoration: "none",
  fontWeight: "700",
  fontSize: "15px",
  display: "inline-block",
};

const footer = {
  marginTop: "48px",
  textAlign: "center" as const,
  borderTop: "1px solid #1a1a1a",
  paddingTop: "32px",
};

const footerContact = {
  color: "#ffffff",
  fontSize: "13px",
  margin: "0 0 16px",
};

const footerCopyright = {
  color: "#333",
  fontSize: "11px",
  margin: "0 0 8px",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
};

const footerMeta = {
  color: "#222",
  fontSize: "10px",
  margin: "0",
};
