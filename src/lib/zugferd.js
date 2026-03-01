import { PDFDocument, PDFName, PDFString, PDFArray, PDFDict, PDFHexString, PDFStream } from 'pdf-lib';

/**
 * Format a Date or date string as YYYYMMDD for CII date format 102.
 */
function formatDateCII(date) {
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().split('T')[0].replace(/-/g, '');
}

/**
 * Format a Date or date string as YYYY-MM-DD for display.
 */
function formatDateDisplay(date) {
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().split('T')[0];
}

/**
 * Escape XML special characters.
 */
function esc(str) {
  if (str == null) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Build CII (Cross Industry Invoice) XML for Factur-X EN16931 profile.
 */
function buildCiiXml({ invoiceNumber, date, profile, customer, items, currency, dueDate }) {
  const currencyCode = currency?.code || 'EUR';
  const fmt = (n) => n.toFixed(2);

  const netTotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const vatRate = profile.vat_enabled ? (profile.vat_rate || 19) : 0;
  const vatAmount = profile.vat_enabled ? (netTotal * (vatRate / 100)) : 0;
  const totalAmount = netTotal + vatAmount;

  // VAT category: S = standard, E = exempt
  const vatCatCode = profile.vat_enabled ? 'S' : 'E';

  // Build line items
  const lines = items.map((item, i) => {
    const lineNet = item.quantity * item.rate;
    return `
        <ram:IncludedSupplyChainTradeLineItem>
            <ram:AssociatedDocumentLineDocument>
                <ram:LineID>${i + 1}</ram:LineID>
            </ram:AssociatedDocumentLineDocument>
            <ram:SpecifiedTradeProduct>
                <ram:Name>${esc(item.description || `Position ${i + 1}`)}</ram:Name>
            </ram:SpecifiedTradeProduct>
            <ram:SpecifiedLineTradeAgreement>
                <ram:NetPriceProductTradePrice>
                    <ram:ChargeAmount>${fmt(item.rate)}</ram:ChargeAmount>
                </ram:NetPriceProductTradePrice>
            </ram:SpecifiedLineTradeAgreement>
            <ram:SpecifiedLineTradeDelivery>
                <ram:BilledQuantity unitCode="HUR">${item.quantity}</ram:BilledQuantity>
            </ram:SpecifiedLineTradeDelivery>
            <ram:SpecifiedLineTradeSettlement>
                <ram:ApplicableTradeTax>
                    <ram:TypeCode>VAT</ram:TypeCode>
                    <ram:CategoryCode>${vatCatCode}</ram:CategoryCode>${profile.vat_enabled ? `
                    <ram:RateApplicablePercent>${vatRate}</ram:RateApplicablePercent>` : ''}
                </ram:ApplicableTradeTax>
                <ram:SpecifiedTradeSettlementLineMonetarySummation>
                    <ram:LineTotalAmount>${fmt(lineNet)}</ram:LineTotalAmount>
                </ram:SpecifiedTradeSettlementLineMonetarySummation>
            </ram:SpecifiedLineTradeSettlement>
        </ram:IncludedSupplyChainTradeLineItem>`;
  }).join('');

  // Seller tax registration
  let sellerTaxReg = '';
  if (profile.tax_id) {
    sellerTaxReg += `
                <ram:SpecifiedTaxRegistration>
                    <ram:ID schemeID="VA">${esc(profile.tax_id)}</ram:ID>
                </ram:SpecifiedTaxRegistration>`;
  }
  if (profile.tax_number) {
    sellerTaxReg += `
                <ram:SpecifiedTaxRegistration>
                    <ram:ID schemeID="FC">${esc(profile.tax_number)}</ram:ID>
                </ram:SpecifiedTaxRegistration>`;
  }

  // Payment means
  let paymentMeans = '';
  if (profile.bank_iban) {
    paymentMeans = `
            <ram:SpecifiedTradeSettlementPaymentMeans>
                <ram:TypeCode>58</ram:TypeCode>
                <ram:PayeePartyCreditorFinancialAccount>
                    <ram:IBANID>${esc(profile.bank_iban)}</ram:IBANID>
                </ram:PayeePartyCreditorFinancialAccount>${profile.bank_bic ? `
                <ram:PayeeSpecifiedCreditorFinancialInstitution>
                    <ram:BICID>${esc(profile.bank_bic)}</ram:BICID>
                </ram:PayeeSpecifiedCreditorFinancialInstitution>` : ''}
            </ram:SpecifiedTradeSettlementPaymentMeans>`;
  }

  // Payment terms
  let paymentTerms = '';
  if (dueDate) {
    paymentTerms = `
            <ram:SpecifiedTradePaymentTerms>
                <ram:Description>Zahlbar bis ${formatDateDisplay(dueDate)}</ram:Description>
                <ram:DueDateDateTime>
                    <udt:DateTimeString format="102">${formatDateCII(dueDate)}</udt:DateTimeString>
                </ram:DueDateDateTime>
            </ram:SpecifiedTradePaymentTerms>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100"
    xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100"
    xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100"
    xmlns:qdt="urn:un:unece:uncefact:data:standard:QualifiedDataType:100">
    <rsm:ExchangedDocumentContext>
        <ram:GuidelineSpecifiedDocumentContextParameter>
            <ram:ID>urn:cen.eu:en16931:2017#compliant#urn:factur-x.eu:1p0:en16931</ram:ID>
        </ram:GuidelineSpecifiedDocumentContextParameter>
    </rsm:ExchangedDocumentContext>
    <rsm:ExchangedDocument>
        <ram:ID>${esc(invoiceNumber)}</ram:ID>
        <ram:TypeCode>380</ram:TypeCode>
        <ram:IssueDateTime>
            <udt:DateTimeString format="102">${formatDateCII(date || new Date())}</udt:DateTimeString>
        </ram:IssueDateTime>
    </rsm:ExchangedDocument>
    <rsm:SupplyChainTradeTransaction>${lines}
        <ram:ApplicableHeaderTradeAgreement>
            <ram:SellerTradeParty>
                <ram:Name>${esc(profile.company_name)}</ram:Name>
                <ram:PostalTradeAddress>
                    <ram:LineOne>${esc(profile.company_street)}</ram:LineOne>
                    <ram:PostcodeCode>${esc(profile.company_postalcode)}</ram:PostcodeCode>
                    <ram:CityName>${esc(profile.company_city)}</ram:CityName>
                    <ram:CountryID>DE</ram:CountryID>
                </ram:PostalTradeAddress>${sellerTaxReg}
            </ram:SellerTradeParty>
            <ram:BuyerTradeParty>
                <ram:Name>${esc(customer.name)}</ram:Name>
                <ram:PostalTradeAddress>
                    <ram:LineOne>${esc(customer.street)}</ram:LineOne>
                    <ram:PostcodeCode>${esc(customer.postal_code)}</ram:PostcodeCode>
                    <ram:CityName>${esc(customer.city)}</ram:CityName>
                    <ram:CountryID>DE</ram:CountryID>
                </ram:PostalTradeAddress>
            </ram:BuyerTradeParty>
        </ram:ApplicableHeaderTradeAgreement>
        <ram:ApplicableHeaderTradeDelivery/>
        <ram:ApplicableHeaderTradeSettlement>
            <ram:InvoiceCurrencyCode>${currencyCode}</ram:InvoiceCurrencyCode>${paymentMeans}
            <ram:ApplicableTradeTax>
                <ram:CalculatedAmount>${fmt(vatAmount)}</ram:CalculatedAmount>
                <ram:TypeCode>VAT</ram:TypeCode>
                <ram:BasisAmount>${fmt(netTotal)}</ram:BasisAmount>
                <ram:CategoryCode>${vatCatCode}</ram:CategoryCode>${profile.vat_enabled ? `
                <ram:RateApplicablePercent>${vatRate}</ram:RateApplicablePercent>` : ''}
            </ram:ApplicableTradeTax>${paymentTerms}
            <ram:SpecifiedTradeSettlementHeaderMonetarySummation>
                <ram:LineTotalAmount>${fmt(netTotal)}</ram:LineTotalAmount>
                <ram:TaxBasisTotalAmount>${fmt(netTotal)}</ram:TaxBasisTotalAmount>
                <ram:TaxTotalAmount currencyID="${currencyCode}">${fmt(vatAmount)}</ram:TaxTotalAmount>
                <ram:GrandTotalAmount>${fmt(totalAmount)}</ram:GrandTotalAmount>
                <ram:DuePayableAmount>${fmt(totalAmount)}</ram:DuePayableAmount>
            </ram:SpecifiedTradeSettlementHeaderMonetarySummation>
        </ram:ApplicableHeaderTradeSettlement>
    </rsm:SupplyChainTradeTransaction>
</rsm:CrossIndustryInvoice>`;
}

/**
 * Build XMP metadata for PDF/A-3B + Factur-X.
 */
function buildXmpMetadata({ title, author, invoiceNumber }) {
  const now = new Date().toISOString();
  return `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
        xmlns:dc="http://purl.org/dc/elements/1.1/"
        xmlns:pdf="http://ns.adobe.com/pdf/1.3/"
        xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/"
        xmlns:fx="urn:factur-x:pdfa:CrossIndustryDocument:invoice:1p0#">
      <dc:title>
        <rdf:Alt><rdf:li xml:lang="x-default">${esc(title || `Invoice ${invoiceNumber}`)}</rdf:li></rdf:Alt>
      </dc:title>
      <dc:creator>
        <rdf:Seq><rdf:li>${esc(author || 'Slyce Invoice')}</rdf:li></rdf:Seq>
      </dc:creator>
      <dc:date>
        <rdf:Seq><rdf:li>${now}</rdf:li></rdf:Seq>
      </dc:date>
      <pdf:Producer>Slyce Invoice (pdf-lib)</pdf:Producer>
      <pdfaid:part>3</pdfaid:part>
      <pdfaid:conformance>B</pdfaid:conformance>
      <fx:DocumentType>INVOICE</fx:DocumentType>
      <fx:DocumentFileName>factur-x.xml</fx:DocumentFileName>
      <fx:Version>1.0</fx:Version>
      <fx:ConformanceLevel>EN 16931</fx:ConformanceLevel>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;
}

/**
 * Create a ZUGFeRD/Factur-X PDF by embedding CII XML into an existing PDF.
 *
 * @param {ArrayBuffer|Uint8Array} pdfBytes - The original PDF
 * @param {Object} invoiceData - Invoice data from the app
 * @returns {Promise<Uint8Array>} - The Factur-X PDF/A-3
 */
export async function createZugferdPdf(pdfBytes, invoiceData) {
  const xmlString = buildCiiXml(invoiceData);
  const xmlBytes = new TextEncoder().encode(xmlString);

  const pdfDoc = await PDFDocument.load(pdfBytes);
  const context = pdfDoc.context;

  // Attach factur-x.xml as an embedded file
  const xmlStream = context.stream(xmlBytes, {
    Type: 'EmbeddedFile',
    Subtype: 'text/xml',
  });
  const xmlStreamRef = context.register(xmlStream);

  const fileSpecDict = context.obj({
    Type: 'Filespec',
    F: PDFString.of('factur-x.xml'),
    UF: PDFHexString.fromText('factur-x.xml'),
    Desc: PDFString.of('Factur-X EN16931 Invoice'),
    AFRelationship: PDFName.of('Alternative'),
    EF: context.obj({
      F: xmlStreamRef,
      UF: xmlStreamRef,
    }),
  });
  const fileSpecRef = context.register(fileSpecDict);

  // Add to catalog's Names/EmbeddedFiles
  const namesArray = PDFArray.withContext(context);
  namesArray.push(PDFHexString.fromText('factur-x.xml'));
  namesArray.push(fileSpecRef);

  const embeddedFilesDict = context.obj({ Names: namesArray });
  const namesDict = context.obj({ EmbeddedFiles: embeddedFilesDict });

  const catalog = pdfDoc.catalog;
  catalog.set(PDFName.of('Names'), context.register(namesDict));

  // AF array on catalog
  const afArray = PDFArray.withContext(context);
  afArray.push(fileSpecRef);
  catalog.set(PDFName.of('AF'), afArray);

  // MarkInfo for PDF/A
  catalog.set(PDFName.of('MarkInfo'), context.obj({ Marked: true }));

  // Set XMP metadata
  const xmp = buildXmpMetadata({
    title: `Invoice ${invoiceData.invoiceNumber}`,
    author: invoiceData.profile?.company_name,
    invoiceNumber: invoiceData.invoiceNumber,
  });
  const xmpBytes = new TextEncoder().encode(xmp);
  const xmpStream = context.stream(xmpBytes, {
    Type: 'Metadata',
    Subtype: 'XML',
    Length: xmpBytes.length,
  });
  const xmpRef = context.register(xmpStream);
  catalog.set(PDFName.of('Metadata'), xmpRef);

  // Set basic document info
  pdfDoc.setTitle(`Invoice ${invoiceData.invoiceNumber}`);
  pdfDoc.setProducer('Slyce Invoice (pdf-lib)');
  pdfDoc.setCreator('Slyce Invoice');

  return await pdfDoc.save();
}
