/**
 * Função para gerar código PIX EMV (formato padrão do Banco Central)
 * @param pixKey - Chave PIX (CPF, CNPJ, email, telefone ou chave aleatória)
 * @param amount - Valor do pagamento
 * @param description - Descrição do pagamento
 * @param merchantName - Nome do recebedor
 * @returns String com o código PIX EMV
 */
export function generatePixCode(
  pixKey: string,
  amount: number,
  description: string,
  merchantName: string
): string {
  // Identificar tipo de chave PIX
  let keyType = "01"; // CPF
  const cleanKey = pixKey.replace(/\D/g, "");
  
  if (pixKey.includes("@")) {
    keyType = "02"; // Email
  } else if (pixKey.startsWith("+") || /^\d{10,11}$/.test(cleanKey)) {
    keyType = "03"; // Telefone
  } else if (cleanKey.length === 14) {
    keyType = "04"; // CNPJ
  } else if (cleanKey.length === 11) {
    keyType = "01"; // CPF
  } else {
    keyType = "05"; // Chave aleatória
  }

  // Formatar valor (sem decimais, apenas centavos)
  const amountInCents = Math.round(amount * 100);
  const amountStr = amountInCents.toString();

  // Construir payload PIX EMV
  const payload = [
    // Payload Format Indicator
    "000201",
    // Merchant Account Information
    `26${String(52 + pixKey.length + merchantName.length).padStart(2, "0")}0014br.gov.bcb.pix${String(pixKey.length).padStart(2, "0")}${pixKey}${String(merchantName.length).padStart(2, "0")}${merchantName}`,
    // Merchant Category Code
    "52040000",
    // Transaction Currency (BRL = 986)
    "5303986",
    // Transaction Amount
    `54${String(amountStr.length).padStart(2, "0")}${amountStr}`,
    // Country Code
    "5802BR",
    // Merchant Name
    `59${String(merchantName.length).padStart(2, "0")}${merchantName}`,
    // Merchant City
    `60${String("BRASIL".length).padStart(2, "0")}BRASIL`,
    // Additional Data Field Template
    `62${String(description.length + 4).padStart(2, "0")}05${String(description.length).padStart(2, "0")}${description}`,
    // CRC16
    "6304",
  ].join("");

  // Calcular CRC16
  const crc = calculateCRC16(payload);
  return payload + crc;
}

/**
 * Calcula CRC16-CCITT para o código PIX
 */
function calculateCRC16(data: string): string {
  const polynomial = 0x1021;
  let crc = 0xffff;

  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc <<= 1;
      }
      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

