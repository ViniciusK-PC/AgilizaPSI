import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface ResetPasswordTemplateProps {
  firstName?: string;
  resetLink: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://191.5.216.22:3000";

export const ResetPasswordTemplate = ({
  firstName = "",
  resetLink,
}: ResetPasswordTemplateProps) => (
  <Html>
    <Head />
    <Preview>Redefina sua senha do AgilizaPSI</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src={`${baseUrl}/static/logo.png`}
          width="32"
          height="32"
          alt="AgilizaPSI"
        />

        <Text style={title}>
          <strong>Olá {firstName}</strong>, redefinição de senha solicitada
        </Text>

        <Section style={section}>
          <Text style={text}>
            Olá <strong>{firstName}</strong>!
          </Text>
          <Text style={text}>
            Recebemos uma solicitação para redefinir a senha da sua conta no AgilizaPSI.
          </Text>
          <Text style={text}>
            Clique no botão abaixo para criar uma nova senha:
          </Text>

          <Button style={button} href={resetLink}>
            Redefinir Senha
          </Button>

          <Text style={text}>
            Ou copie e cole este link no seu navegador:
          </Text>
          <Text style={linkText}>{resetLink}</Text>

          <Text style={text}>
            Este link expirará em 1 hora por motivos de segurança.
          </Text>
          <Text style={text}>
            Se você não solicitou esta redefinição de senha, ignore este email.
          </Text>
        </Section>

        <Text style={footer}>
          AgilizaPSI - Sistema de Gestão de Psicologia
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ResetPasswordTemplate;

const main = {
  backgroundColor: "#ffffff",
  color: "#24292e",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
};

const container = {
  width: "480px",
  margin: "0 auto",
  padding: "20px 0 48px",
};

const title = {
  fontSize: "24px",
  lineHeight: 1.25,
};

const section = {
  padding: "24px",
  border: "solid 1px #dedede",
  borderRadius: "5px",
  textAlign: "center" as const,
};

const text = {
  margin: "0 0 10px 0",
  textAlign: "left" as const,
  fontSize: "14px",
  lineHeight: "1.5",
};

const button = {
  fontSize: "16px",
  backgroundColor: "#28a745",
  color: "#fff",
  lineHeight: 1.5,
  borderRadius: "0.5em",
  padding: "0.75em 1.5em",
  textDecoration: "none",
  display: "inline-block",
  margin: "20px 0",
};

const linkText = {
  fontSize: "12px",
  color: "#0366d6",
  wordBreak: "break-all" as const,
  margin: "10px 0",
};

const footer = {
  color: "#6a737d",
  fontSize: "12px",
  textAlign: "center" as const,
  marginTop: "60px",
};

