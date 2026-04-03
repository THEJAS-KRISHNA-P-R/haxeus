import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from "@react-email/components";

interface OrderConfirmationEmailProps {
  customerName: string;
  orderId: string;
  orderItems: Array<{
    name: string;
    size: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  shippingAddress: {
    name: string;
    addressLine1: string;
    city: string;
    pincode: string;
  };
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://haxeus.in";

export const OrderConfirmationEmail = ({
  customerName,
  orderId,
  orderItems,
  subtotal,
  shipping,
  discount,
  total,
  shippingAddress,
}: OrderConfirmationEmailProps) => {
  const previewText = `Order confirmed - HAXEUS #${orderId.slice(-8).toUpperCase()}`;

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
            <Heading style={h1}>Order Confirmed! 🎉</Heading>
            <Text style={text}>
              Hi {customerName}, your order is confirmed and will be prepared shortly.
            </Text>

            <Section style={orderInfoBox}>
              <Text style={label}>Order Number</Text>
              <Text style={orderNumber}>{orderId.slice(-8).toUpperCase()}</Text>
            </Section>

            <Hr style={hr} />

            <Section>
              {orderItems.map((item, index) => (
                <Row key={index} style={itemRow}>
                  <Column style={{ verticalAlign: "top" }}>
                    <Text style={itemName}>{item.name}</Text>
                    <Text style={itemSub}>
                      Size: {item.size} · Qty: {item.quantity}
                    </Text>
                  </Column>
                  <Column align="right" style={{ verticalAlign: "top" }}>
                    <Text style={itemPrice}>
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </Text>
                  </Column>
                </Row>
              ))}
            </Section>

            <Section style={summaryBox}>
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
                  <Text style={shipping === 0 ? freeShipping : summaryValue}>
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
                  <Text style={totalLabel}>Total</Text>
                </Column>
                <Column align="right">
                  <Text style={totalValue}>₹{total.toLocaleString()}</Text>
                </Column>
              </Row>
            </Section>

            <Section style={addressBox}>
              <Text style={label}>Shipping To</Text>
              <Text style={addressText}>
                {shippingAddress.name}<br />
                {shippingAddress.addressLine1}<br />
                {shippingAddress.city} {shippingAddress.pincode}
              </Text>
            </Section>

            <Section style={{ textAlign: "center", marginTop: "32px" }}>
              <Link href={`${baseUrl}/orders`} style={button}>
                View Your Order
              </Link>
            </Section>

            <Text style={footerLinkText}>
              Need a return or size exchange? Read the{" "}
              <Link href={`${baseUrl}/returns-refunds`} style={link}>
                Returns & Refunds
              </Link>{" "}
              policy.
            </Text>
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

export default OrderConfirmationEmail;

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
  fontSize: "20px",
  fontWeight: "700",
  margin: "0 0 8px",
};

const text = {
  color: "#666",
  fontSize: "14px",
  margin: "0 0 28px",
  lineHeight: "1.6",
};

const orderInfoBox = {
  backgroundColor: "#111",
  border: "1px solid #1a1a1a",
  borderRadius: "12px",
  padding: "16px 20px",
  marginBottom: "24px",
};

const label = {
  color: "#555",
  fontSize: "11px",
  textTransform: "uppercase" as const,
  letterSpacing: "1.5px",
  margin: "0 0 4px",
};

const orderNumber = {
  color: "#e93a3a",
  fontSize: "22px",
  fontWeight: "700",
  margin: "0",
  letterSpacing: "2px",
};

const hr = {
  borderTop: "1px solid #1a1a1a",
  margin: "24px 0",
};

const itemRow = {
  paddingBottom: "14px",
};

const itemName = {
  color: "#ffffff",
  fontWeight: "700",
  margin: "0 0 4px",
  fontSize: "14px",
};

const itemSub = {
  color: "#666",
  fontSize: "12px",
  margin: "0",
};

const itemPrice = {
  color: "#ffffff",
  fontWeight: "600",
  margin: "0",
  fontSize: "14px",
};

const summaryBox = {
  backgroundColor: "#111",
  border: "1px solid #1a1a1a",
  borderRadius: "12px",
  padding: "20px",
  margin: "20px 0",
};

const summaryRow = {
  paddingBottom: "4px",
};

const summaryLabel = {
  color: "#666",
  fontSize: "13px",
};

const summaryValue = {
  color: "#fff",
  fontSize: "13px",
};

const freeShipping = {
  color: "#4ade80",
  fontSize: "13px",
};

const discountLabel = {
  color: "#4ade80",
  fontSize: "13px",
};

const discountValue = {
  color: "#4ade80",
  fontSize: "13px",
};

const summaryHr = {
  borderTop: "1px solid #1a1a1a",
  margin: "12px 0 0",
};

const totalLabel = {
  color: "#fff",
  fontSize: "15px",
  fontWeight: "700",
};

const totalValue = {
  color: "#e93a3a",
  fontSize: "18px",
  fontWeight: "700",
};

const addressBox = {
  backgroundColor: "#111",
  border: "1px solid #1a1a1a",
  borderRadius: "12px",
  padding: "20px",
  marginBottom: "28px",
};

const addressText = {
  color: "#fff",
  margin: "0",
  lineHeight: "1.7",
  fontSize: "14px",
};

const button = {
  backgroundColor: "#e93a3a",
  color: "#fff",
  padding: "14px 36px",
  borderRadius: "100px",
  textDecoration: "none",
  fontWeight: "700",
  fontSize: "14px",
  letterSpacing: "0.5px",
  display: "inline-block",
};

const footerLinkText = {
  color: "#666",
  fontSize: "13px",
  lineHeight: "1.7",
  textAlign: "center" as const,
  margin: "20px 0 0",
};

const link = {
  color: "#e93a3a",
  textDecoration: "underline",
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
