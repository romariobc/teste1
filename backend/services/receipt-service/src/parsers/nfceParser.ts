import { parseStringPromise } from 'xml2js';

export interface ParsedReceipt {
  storeName: string;
  storeCnpj: string;
  totalAmount: number;
  purchaseDate: Date;
  receiptNumber: string;
  items: ParsedReceiptItem[];
}

export interface ParsedReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string;
}

/**
 * Parse NFC-e XML and extract receipt data
 *
 * This is a simplified parser for Brazilian NFC-e (Nota Fiscal de Consumidor Eletrônica)
 * In production, you'd need a more robust parser handling all NFC-e variations
 */
export const parseNFCeXML = async (xmlString: string): Promise<ParsedReceipt> => {
  try {
    const parsed = await parseStringPromise(xmlString, {
      explicitArray: false,
      mergeAttrs: true,
      normalize: true,
      normalizeTags: true,
      trim: true,
    });

    // Navigate through XML structure
    // NFC-e structure: nfeProc > NFe > infNFe
    const nfe = parsed.nfeproc?.nfe?.infnfe || parsed.nfe?.infnfe || parsed.infnfe;

    if (!nfe) {
      throw new Error('Invalid NFC-e XML structure');
    }

    // Extract store info (emit = emitente)
    const emit = nfe.emit;
    const storeName = emit.xnome || emit.xfant || 'Store Name Not Found';
    const storeCnpj = emit.cnpj || '';

    // Extract totals (total > ICMSTot)
    const total = nfe.total?.icmstot;
    const totalAmount = parseFloat(total?.vnf || total?.vnfce || '0');

    // Extract date (ide = identificação)
    const ide = nfe.ide;
    const dateStr = ide.dhemi || ide.demi || '';
    const purchaseDate = dateStr ? new Date(dateStr) : new Date();

    // Extract receipt number
    const receiptNumber = ide.nnf || ide.cnf || '';

    // Extract items (det = detalhamento)
    let detList = nfe.det;
    if (!Array.isArray(detList)) {
      detList = detList ? [detList] : [];
    }

    const items: ParsedReceiptItem[] = detList.map((det: any) => {
      const prod = det.prod;
      const imposto = det.imposto;

      return {
        name: prod.xprod || 'Unknown Product',
        quantity: parseFloat(prod.qcom || '1'),
        unitPrice: parseFloat(prod.vuncom || '0'),
        totalPrice: parseFloat(prod.vprod || '0'),
        unit: prod.ucom || 'UN',
      };
    });

    return {
      storeName,
      storeCnpj,
      totalAmount,
      purchaseDate,
      receiptNumber,
      items,
    };
  } catch (error: any) {
    console.error('Error parsing NFC-e XML:', error);
    throw new Error(`Failed to parse NFC-e XML: ${error.message}`);
  }
};

/**
 * Extract access key from QR code data
 * Brazilian NFC-e QR codes typically contain the access key (chave de acesso)
 */
export const extractAccessKey = (qrCodeData: string): string | null => {
  // QR code format varies by state, but usually contains 44-digit access key
  // Example: https://www.fazenda.sp.gov.br/nfce/consultar?p=35210812345678901234550010000123451234567890

  const matches = qrCodeData.match(/(\d{44})/);
  return matches ? matches[1] : null;
};

/**
 * Extract URL from QR code (if it's a full URL)
 */
export const extractURL = (qrCodeData: string): string | null => {
  try {
    const url = new URL(qrCodeData);
    return url.href;
  } catch {
    return null;
  }
};

/**
 * Mock function to simulate fetching XML from URL
 * In production, this would make an HTTP request to the NFC-e portal
 *
 * For testing, we'll return a mock XML structure
 */
export const fetchNFCeXML = async (qrCodeData: string): Promise<string> => {
  // In production, you would:
  // 1. Extract the URL from QR code
  // 2. Make HTTP request to the NFC-e portal
  // 3. Handle authentication/captcha if needed
  // 4. Return the XML content

  // For prototype, return mock XML
  console.log('⚠️  Using mock NFC-e XML for development');

  const mockXML = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc>
  <NFe>
    <infNFe>
      <ide>
        <nnf>123456</nnf>
        <dhEmi>2025-10-31T10:30:00-03:00</dhEmi>
      </ide>
      <emit>
        <CNPJ>12345678000190</CNPJ>
        <xNome>Supermercado Exemplo LTDA</xNome>
        <xFant>SuperMercado Exemplo</xFant>
      </emit>
      <det>
        <prod>
          <xProd>ARROZ BRANCO 5KG</xProd>
          <qCom>2.000</qCom>
          <vUnCom>15.90</vUnCom>
          <vProd>31.80</vProd>
          <uCom>UN</uCom>
        </prod>
      </det>
      <det>
        <prod>
          <xProd>FEIJAO PRETO 1KG</xProd>
          <qCom>3.000</qCom>
          <vUnCom>8.50</vUnCom>
          <vProd>25.50</vProd>
          <uCom>UN</uCom>
        </prod>
      </det>
      <det>
        <prod>
          <xProd>LEITE INTEGRAL 1L</xProd>
          <qCom>4.000</qCom>
          <vUnCom>5.20</vUnCom>
          <vProd>20.80</vProd>
          <uCom>UN</uCom>
        </prod>
      </det>
      <total>
        <ICMSTot>
          <vNF>78.10</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
</nfeProc>`;

  return mockXML;
};
