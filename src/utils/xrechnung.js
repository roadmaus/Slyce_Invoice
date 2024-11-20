import { formatXRechnungDate } from '@/utils/dateUtils';

export const generateXRechnung = ({
  invoice,
  seller,
  buyer,
  items,
  vatRate,
  vatAmount,
  netTotal,
  totalAmount,
  currency
}) => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ubl:Invoice xmlns:ubl="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
             xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
             xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
    <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:xoev-de:kosit:standard:xrechnung_3.0#conformant#urn:www.xoev.de:kosit:standard:xrechnung_3.0</cbc:CustomizationID>
    <cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>
    <cbc:ID>${invoice.number}</cbc:ID>
    <cbc:IssueDate>${formatXRechnungDate(invoice.date)}</cbc:IssueDate>
    <cbc:DueDate>${formatXRechnungDate(new Date(invoice.date).setDate(new Date(invoice.date).getDate() + 30))}</cbc:DueDate>
    <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
    <cbc:DocumentCurrencyCode>${currency.code}</cbc:DocumentCurrencyCode>
    <cbc:BuyerReference>${buyer.id || buyer.name}</cbc:BuyerReference>

    <!-- Seller Information -->
    <cac:AccountingSupplierParty>
        <cac:Party>
            <cbc:EndpointID schemeID="0204">${seller.vat_number || seller.tax_id}</cbc:EndpointID>
            <cac:PartyName>
                <cbc:Name>${seller.company_name}</cbc:Name>
            </cac:PartyName>
            <cac:PostalAddress>
                <cbc:StreetName>${seller.company_street}</cbc:StreetName>
                <cbc:CityName>${seller.company_city}</cbc:CityName>
                <cbc:PostalZone>${seller.company_postalcode}</cbc:PostalZone>
                <cac:Country>
                    <cbc:IdentificationCode>DE</cbc:IdentificationCode>
                </cac:Country>
            </cac:PostalAddress>
            ${seller.tax_id ? `
            <cac:PartyTaxScheme>
                <cbc:CompanyID>DE${seller.tax_id.replace(/[^0-9]/g, '')}</cbc:CompanyID>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:PartyTaxScheme>
            ` : ''}
            <cac:PartyLegalEntity>
                <cbc:RegistrationName>${seller.company_name}</cbc:RegistrationName>
                ${seller.tax_number ? `<cbc:CompanyID>${seller.tax_number}</cbc:CompanyID>` : ''}
                <cbc:CompanyLegalForm>Other</cbc:CompanyLegalForm>
            </cac:PartyLegalEntity>
            <cac:Contact>
                <cbc:Name>${seller.contact_name || seller.company_name}</cbc:Name>
                <cbc:Telephone>${seller.phone || ''}</cbc:Telephone>
                <cbc:ElectronicMail>${seller.email}</cbc:ElectronicMail>
            </cac:Contact>
        </cac:Party>
    </cac:AccountingSupplierParty>

    <!-- Buyer Information -->
    <cac:AccountingCustomerParty>
        <cac:Party>
            <cbc:EndpointID schemeID="${buyer.endpoint_scheme_id || '0204'}">${
                buyer.firma ? buyer.vat_number : buyer.id
            }</cbc:EndpointID>
            <cac:PartyName>
                <cbc:Name>${buyer.firma ? buyer.company_name : `${buyer.title || ''} ${buyer.name}`.trim()}</cbc:Name>
            </cac:PartyName>
            <cac:PostalAddress>
                <cbc:StreetName>${buyer.street}</cbc:StreetName>
                <cbc:CityName>${buyer.city}</cbc:CityName>
                <cbc:PostalZone>${buyer.postal_code}</cbc:PostalZone>
                <cac:Country>
                    <cbc:IdentificationCode>DE</cbc:IdentificationCode>
                </cac:Country>
            </cac:PostalAddress>
            <cac:PartyLegalEntity>
                <cbc:RegistrationName>${buyer.firma ? buyer.company_name : `${buyer.title || ''} ${buyer.name}`.trim()}</cbc:RegistrationName>
            </cac:PartyLegalEntity>
            ${buyer.contact_person ? `
            <cac:Contact>
                <cbc:Name>${buyer.contact_person}</cbc:Name>
            </cac:Contact>
            ` : ''}
        </cac:Party>
    </cac:AccountingCustomerParty>

    <!-- Payment Instructions -->
    <cac:PaymentMeans>
        <cbc:PaymentMeansCode>30</cbc:PaymentMeansCode>
        <cac:PayeeFinancialAccount>
            <cbc:ID>${seller.bank_account || ''}</cbc:ID>
            <cbc:Name>${seller.company_name}</cbc:Name>
            <cac:FinancialInstitutionBranch>
                <cbc:ID>${seller.bank_bic || ''}</cbc:ID>
            </cac:FinancialInstitutionBranch>
        </cac:PayeeFinancialAccount>
    </cac:PaymentMeans>

    <!-- Payment Terms -->
    <cac:PaymentTerms>
        <cbc:Note>30 days net</cbc:Note>
    </cac:PaymentTerms>

    <!-- Tax Information -->
    <cac:TaxTotal>
        <cbc:TaxAmount currencyID="${currency.code}">${vatAmount.toFixed(2)}</cbc:TaxAmount>
        <cac:TaxSubtotal>
            <cbc:TaxableAmount currencyID="${currency.code}">${netTotal.toFixed(2)}</cbc:TaxableAmount>
            <cbc:TaxAmount currencyID="${currency.code}">${vatAmount.toFixed(2)}</cbc:TaxAmount>
            <cac:TaxCategory>
                <cbc:ID>S</cbc:ID>
                <cbc:Percent>${vatRate}</cbc:Percent>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:TaxCategory>
        </cac:TaxSubtotal>
    </cac:TaxTotal>

    <!-- Invoice Total -->
    <cac:LegalMonetaryTotal>
        <cbc:LineExtensionAmount currencyID="${currency.code}">${netTotal.toFixed(2)}</cbc:LineExtensionAmount>
        <cbc:TaxExclusiveAmount currencyID="${currency.code}">${netTotal.toFixed(2)}</cbc:TaxExclusiveAmount>
        <cbc:TaxInclusiveAmount currencyID="${currency.code}">${totalAmount.toFixed(2)}</cbc:TaxInclusiveAmount>
        <cbc:PayableAmount currencyID="${currency.code}">${totalAmount.toFixed(2)}</cbc:PayableAmount>
    </cac:LegalMonetaryTotal>

    <!-- Invoice Lines -->
    ${items.map((item, index) => `
    <cac:InvoiceLine>
        <cbc:ID>${index + 1}</cbc:ID>
        <cbc:InvoicedQuantity unitCode="H87">${item.quantity}</cbc:InvoicedQuantity>
        <cbc:LineExtensionAmount currencyID="${currency.code}">${(item.quantity * item.rate).toFixed(2)}</cbc:LineExtensionAmount>
        <cac:Item>
            <cbc:Name>${item.description}</cbc:Name>
            <cac:ClassifiedTaxCategory>
                <cbc:ID>S</cbc:ID>
                <cbc:Percent>${vatRate}</cbc:Percent>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:ClassifiedTaxCategory>
        </cac:Item>
        <cac:Price>
            <cbc:PriceAmount currencyID="${currency.code}">${item.rate.toFixed(2)}</cbc:PriceAmount>
        </cac:Price>
    </cac:InvoiceLine>
    `).join('')}
</ubl:Invoice>`;

  return xml;
}; 