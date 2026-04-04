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
const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919746283912";

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
  const previewText = `Your gear is locked in. Order #${finalDisplayId}`;
  const firstName = shippingAddress?.name?.split(' ')[0] || "there";

  const orderDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={mainText}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logoText}>HAXEUS</Heading>
            <Text style={tagline}>ORDER CONFIRMED</Text>
          </Section>

          <Section style={content}>
            <Section style={hero}>
              <Text style={h1}>HEY {firstName.toUpperCase()}, WELCOME TO THE MOVEMENT.</Text>
              <Text style={manifesto}>
                Your order has been locked in. We're currently processing your order.
              </Text>
            </Section>

            <Section style={orderTrackerMeta}>
              <Column>
                <Text style={metaKey}>ORDER NO.</Text>
                <Text style={metaValue}>#{finalDisplayId}</Text>
              </Column>
              <Column align="right">
                <Text style={metaKey}>DATE</Text>
                <Text style={metaValue}>{orderDate}</Text>
              </Column>
            </Section>

            <Section style={orderSection}>
              <Text style={sectionTitle}>Invoice details</Text>
              {orderItems.map((item, index) => (
                <Row key={index} style={itemRow}>
                  <Column style={{ verticalAlign: "top", width: "70%" }}>
                    <Text style={itemName}>{item.name}</Text>
                    <Text style={itemSub}>Size: {item.size} • Qty: {item.quantity}</Text>
                  </Column>
                  <Column align="right" style={{ verticalAlign: "top", width: "30%" }}>
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
                  <Text style={totalLabel}>Total Target</Text>
                </Column>
                <Column align="right">
                  <Text style={totalValue}>₹{total.toLocaleString()}</Text>
                </Column>
              </Row>
            </Section>

            <Section style={dataDenseBox}>
              <Row>
                <Column style={{ width: "50%", paddingRight: "10px", verticalAlign: "top" }}>
                  <Text style={sectionTitle}>Destination</Text>
                  <Text style={addressText}>
                    <strong>{shippingAddress.name}</strong><br />
                    {shippingAddress.addressLine1}<br />
                    {shippingAddress.city} — {shippingAddress.pincode}
                  </Text>
                </Column>
                <Column style={{ width: "50%", paddingLeft: "10px", verticalAlign: "top" }}>
                  <Text style={sectionTitle}>Delivery Specs</Text>
                  <Text style={estimateText}>
                    <strong>ETA:</strong> 7 - 14 Days
                  </Text>
                  <Text style={addressText}>
                    Track your live progress anytime by logging into your profile and checking the Orders page.
                  </Text>
                </Column>
              </Row>
            </Section>

            <Section style={viewMoreSection}>
              <Text style={{ textAlign: "center" as const, margin: "0" }}>
                <Link href={`${baseUrl}/orders/${orderId}`} style={textLink}>
                  View more info & order status →
                </Link>
              </Text>
            </Section>

            <Section style={socialSection}>
              <Row>
                <Column align="center" style={{ width: "50%", padding: "0 8px" }}>
                  <Link href={`https://wa.me/${whatsappNumber}`} style={socialBox}>
                    WHATSAPP SUPPORT
                  </Link>
                </Column>
                <Column align="center" style={{ width: "50%", padding: "0 8px" }}>
                  <Link href="https://instagram.com/haxeus" style={socialBox}>
                    INSTAGRAM
                  </Link>
                </Column>
              </Row>
            </Section>

            <Section style={footer}>
              <Text style={footerCopyright}>© {new Date().getFullYear()} HAXEUS. ALL RIGHTS RESERVED.</Text>
              <Text style={footerMeta}>This transmission was generated by the HAXEUS mainframe for your records.</Text>
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

const logoText = {
  color: "#ef3939",
  fontSize: "28px",
  fontWeight: "900",
  letterSpacing: "6px",
  margin: "0",
  fontStyle: "italic",
};

const tagline = {
  color: "#666",
  fontSize: "10px",
  letterSpacing: "4px",
  margin: "8px 0 0",
  textTransform: "uppercase" as const,
  fontWeight: "bold",
};

const content = {
  padding: "0",
};

const hero = {
  textAlign: "left" as const,
  padding: "0 0 24px",
};

const h1 = {
  color: "#ffffff",
  fontSize: "22px",
  fontWeight: "800",
  margin: "0 0 12px",
  letterSpacing: "-0.5px",
};

const manifesto = {
  color: "#999",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0",
};

const orderTrackerMeta = {
  backgroundColor: "#161616",
  padding: "16px 24px",
  borderTop: "2px solid #ef3939",
  borderRadius: "4px 4px 0 0",
  marginTop: "16px",
};

const metaKey = {
  color: "#666",
  fontSize: "10px",
  fontWeight: "800",
  letterSpacing: "2px",
  margin: "0 0 4px",
};

const metaValue = {
  color: "#ef3939",
  fontSize: "16px",
  fontWeight: "800",
  margin: "0",
  letterSpacing: "1px",
};

const orderSection = {
  backgroundColor: "#111",
  padding: "24px",
  borderTop: "1px solid #222",
  borderLeft: "1px solid #1a1a1a",
  borderRight: "1px solid #1a1a1a",
  borderBottom: "1px solid #1a1a1a",
};

const sectionTitle = {
  color: "#444",
  fontSize: "10px",
  textTransform: "uppercase" as const,
  letterSpacing: "2px",
  margin: "0 0 16px",
  fontWeight: "800",
};

const itemRow = {
  paddingBottom: "16px",
};

const itemName = {
  color: "#fff",
  fontSize: "14px",
  fontWeight: "700",
  margin: "0 0 6px",
  textTransform: "uppercase" as const,
};

const itemSub = {
  color: "#666",
  fontSize: "12px",
  margin: "0",
  fontWeight: "600",
};

const itemPrice = {
  color: "#fff",
  fontSize: "14px",
  fontWeight: "700",
  margin: "0",
};

const hr = {
  borderTop: "1px dashed #333",
  margin: "16px 0",
};

const summaryRow = {
  paddingBottom: "8px",
};

const summaryLabel = {
  color: "#888",
  fontSize: "13px",
  fontWeight: "600",
};

const summaryValue = {
  color: "#fff",
  fontSize: "13px",
  fontWeight: "600",
};

const freeLabel = {
  color: "#4ade80",
  fontSize: "13px",
  fontWeight: "800",
};

const discountLabel = {
  color: "#4ade80",
  fontSize: "13px",
  fontWeight: "600",
};

const discountValue = {
  color: "#4ade80",
  fontSize: "13px",
  fontWeight: "800",
};

const summaryHr = {
  borderTop: "1px solid #333",
  margin: "16px 0 0",
};

const totalLabel = {
  color: "#fff",
  fontSize: "18px",
  fontWeight: "800",
  textTransform: "uppercase" as const,
};

const totalValue = {
  color: "#ef3939",
  fontSize: "20px",
  fontWeight: "900",
};

const dataDenseBox = {
  backgroundColor: "#111",
  borderRadius: "0 0 4px 4px",
  padding: "24px",
  borderLeft: "1px solid #1a1a1a",
  borderRight: "1px solid #1a1a1a",
  borderBottom: "1px solid #1a1a1a",
  marginBottom: "32px",
};

const addressText = {
  color: "#888",
  fontSize: "13px",
  lineHeight: "1.6",
  margin: "0",
};

const estimateText = {
  color: "#fff",
  fontSize: "13px",
  margin: "0 0 8px",
};

const viewMoreSection = {
  margin: "0 0 32px",
  textAlign: "center" as const,
};

const textLink = {
  color: "#ef3939",
  textDecoration: "underline",
  fontWeight: "800",
  fontSize: "14px",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
};

const socialSection = {
  margin: "0 0 48px",
};

const socialBox = {
  display: "block",
  backgroundColor: "#161616",
  color: "#fff",
  textDecoration: "none",
  padding: "16px 0",
  fontSize: "11px",
  fontWeight: "800",
  letterSpacing: "2px",
  border: "1px solid #333",
  borderRadius: "4px",
  textAlign: "center" as const,
  width: "100%",
};

const footer = {
  textAlign: "center" as const,
  borderTop: "1px dashed #333",
  paddingTop: "32px",
};

const footerCopyright = {
  color: "#ef3939",
  fontSize: "12px",
  fontWeight: "800",
  margin: "0 0 8px",
  letterSpacing: "1px",
};

const footerMeta = {
  color: "#444",
  fontSize: "10px",
  margin: "0",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
};
