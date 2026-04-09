import html2pdf from 'html2pdf.js';
import { api } from '@/lib/api';
import { createZugferdPdf } from '@/lib/zugferd';
import { TITLE_KEYS, ACADEMIC_TITLE_KEYS, TITLE_STORAGE_VALUES, ACADEMIC_STORAGE_VALUES } from '@/constants/titleMappings';
import { TITLE_TRANSLATIONS, ACADEMIC_TRANSLATIONS } from '@/constants/languageMappings';
import { BUSINESS_KEYS, BUSINESS_STORAGE_VALUES, BUSINESS_TRANSLATIONS } from '@/constants/businessMappings';

const DATE_FMT = new Intl.DateTimeFormat('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' });
const formatDate = (date) => DATE_FMT.format(new Date(date));

export const getTranslatedTitle = (storedTitle, language) => {
  const titleKey = Object.entries(TITLE_STORAGE_VALUES)
    .find(([_, value]) => value === storedTitle)?.[0];
  if (!titleKey || titleKey === TITLE_KEYS.NEUTRAL) return '';
  const translations = TITLE_TRANSLATIONS[language] || TITLE_TRANSLATIONS['de'];
  return translations[titleKey] || storedTitle;
};

export const getTranslatedAcademicTitle = (storedTitle, language) => {
  const academicKey = Object.entries(ACADEMIC_STORAGE_VALUES)
    .find(([_, value]) => value === storedTitle)?.[0];
  if (!academicKey || academicKey === ACADEMIC_TITLE_KEYS.NONE) return '';
  const translations = ACADEMIC_TRANSLATIONS[language] || ACADEMIC_TRANSLATIONS['en'];
  return translations[academicKey] || storedTitle;
};

const getTranslatedBusinessField = (storedValue, fieldKey, language) => {
  const businessKey = Object.entries(BUSINESS_STORAGE_VALUES)
    .find(([_, value]) => value === storedValue)?.[0]
    || Object.entries(BUSINESS_STORAGE_VALUES)
      .find(([_, value]) => storedValue.includes(value))?.[0]
    || fieldKey;
  const translations = BUSINESS_TRANSLATIONS[language] || BUSINESS_TRANSLATIONS['en'];
  return translations[businessKey] || storedValue;
};

export const formatCustomerName = (customer, language) => {
  const parts = [];
  if (customer.title && customer.title !== TITLE_STORAGE_VALUES[TITLE_KEYS.NEUTRAL]) {
    if (customer.title !== TITLE_STORAGE_VALUES[TITLE_KEYS.DIVERSE]) {
      const translated = getTranslatedTitle(customer.title, language);
      if (translated) parts.push(translated);
    }
  }
  if (customer.zusatz && customer.zusatz !== ACADEMIC_STORAGE_VALUES[ACADEMIC_TITLE_KEYS.NONE]) {
    const translated = getTranslatedAcademicTitle(customer.zusatz, language);
    if (translated) parts.push(translated);
  }
  parts.push(customer.name);
  if (['ja', 'zh'].includes(language)) {
    const honorific = language === 'ja' ? '様' : '先生';
    return parts.join(' ') + honorific;
  }
  return parts.join(' ');
};

const formatCustomerAddress = (customer, language) =>
  [formatCustomerName(customer, language), customer.street, `${customer.postal_code} ${customer.city}`]
    .filter(Boolean)
    .join('<br>');

const formatGreeting = (customer, language, t) => {
  if (customer.firma) return t('invoice.greeting.business');

  const titleKey = Object.entries(TITLE_STORAGE_VALUES)
    .find(([_, value]) => value === customer.title)?.[0];

  const greetingKeyMap = {
    [TITLE_KEYS.MR]: 'mr',
    [TITLE_KEYS.MRS]: 'mrs',
    [TITLE_KEYS.DIVERSE]: 'diverse',
    [TITLE_KEYS.NEUTRAL]: 'neutral',
  };
  const greetingKey = greetingKeyMap[titleKey] || 'neutral';

  const hasAcademicTitle = customer.zusatz &&
    customer.zusatz !== ACADEMIC_STORAGE_VALUES[ACADEMIC_TITLE_KEYS.NONE];
  const greetingPath = `invoice.greeting.${greetingKey}.${hasAcademicTitle ? 'academic' : 'default'}`;
  const greetingTemplate = t(greetingPath);

  const academicTitle = hasAcademicTitle
    ? getTranslatedAcademicTitle(customer.zusatz, language)
    : '';

  const nameParts = customer.name.split(' ');
  const lastName = nameParts[nameParts.length - 1];

  return greetingTemplate
    .replace('{title}', academicTitle)
    .replace('{last_name}', lastName)
    .replace('{full_name}', customer.name);
};

export function computeInvoiceAmounts(items, profile) {
  const netTotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const vatRate = profile.vat_enabled ? (profile.vat_rate || 19) : 0;
  const vatAmount = profile.vat_enabled ? (netTotal * (vatRate / 100)) : 0;
  const totalAmount = netTotal + vatAmount;
  return { netTotal, vatRate, vatAmount, totalAmount };
}

const resolveInvoiceLanguage = (invoiceLanguageSetting, customer) => {
  if (invoiceLanguageSetting !== 'auto') return invoiceLanguageSetting;
  if (['DE', 'AT', 'CH'].includes(customer?.country)) return 'de';
  return 'en';
};

/**
 * Builds the final HTML string from a template + invoice data.
 * Single-pass replacement — all placeholders resolved in one Object.entries loop.
 */
const buildInvoiceHtml = ({ template, profile, customer, items, invoiceDates, invoiceReference, invoicePaid, invoiceLang, t, formatCurrency }) => {
  const customerAddress = formatCustomerAddress(customer, invoiceLang);
  const customerGreeting = formatGreeting(customer, invoiceLang, t);
  const { netTotal, vatRate, vatAmount, totalAmount } = computeInvoiceAmounts(items, profile);

  const startDateStr = invoiceDates.startDate ? formatDate(invoiceDates.startDate) : '';
  const endDateStr = invoiceDates.endDate ? formatDate(invoiceDates.endDate) : '';

  const servicePeriodText = !invoiceDates.showDate
    ? t('invoice.servicePeriod.noDate')
    : invoiceDates.hasDateRange
      ? t('invoice.servicePeriod.range').replace('{startDate}', startDateStr).replace('{endDate}', endDateStr)
      : t('invoice.servicePeriod.single').replace('{date}', startDateStr);

  const vatNoticeHtml = profile.vat_enabled
    ? `<p>${t('invoice.totals.vatNotice.enabled')}</p>`
    : `<p>${t('invoice.totals.vatNotice.disabled')}</p>`;

  const vatRowHtml = profile.vat_enabled
    ? `<tr><td>${t('invoice.totals.vat', { rate: vatRate })}:</td><td>${formatCurrency(vatAmount)}</td></tr>`
    : '';

  const invoiceNumberDate = [
    `${t('invoice.details.number.label')}: ${profile._invoiceNumber}`,
    `${t('invoice.details.date.label')}: ${formatDate(new Date())}`,
  ].join('<br>');

  const referenceSectionHtml = invoiceReference
    ? `<div class="reference-section" style="margin: 24px 0;"><p style="margin: 0;"><strong>Betreff:</strong> ${invoiceReference}</p></div>`
    : '';

  const formattedItems = items.map((item, i) =>
    `<tr><td>${i + 1}</td><td>${item.quantity}</td><td>${item.description}</td><td>${formatCurrency(item.rate)}</td><td>${formatCurrency(item.quantity * item.rate)}</td></tr>`
  ).join('');

  const paymentInstruction = invoicePaid
    ? t('invoice.payment.paid').replace('{amount}', formatCurrency(totalAmount))
    : t('invoice.payment.instruction').replace('{amount}', formatCurrency(totalAmount));

  const contactDetailsHtml = profile.contact_details
    ? profile.contact_details.split('\n').join('<br>')
    : '';

  // Single unified replacement map — every placeholder resolved in one pass
  const replacements = {
    company_name: profile.company_name,
    company_street: profile.company_street,
    company_postalcode: profile.company_postalcode,
    company_city: profile.company_city,
    tax_number_label: getTranslatedBusinessField(BUSINESS_STORAGE_VALUES[BUSINESS_KEYS.TAX_NUMBER], 'taxNumber', invoiceLang),
    tax_id_label: getTranslatedBusinessField(BUSINESS_STORAGE_VALUES[BUSINESS_KEYS.TAX_ID], 'taxId', invoiceLang),
    tax_number: profile.tax_number,
    tax_id: profile.tax_id,
    bank_institute_label: getTranslatedBusinessField(BUSINESS_STORAGE_VALUES[BUSINESS_KEYS.BANK_INSTITUTE], BUSINESS_KEYS.BANK_INSTITUTE, invoiceLang),
    bank_iban_label: getTranslatedBusinessField(BUSINESS_STORAGE_VALUES[BUSINESS_KEYS.BANK_IBAN], BUSINESS_KEYS.BANK_IBAN, invoiceLang),
    bank_bic_label: getTranslatedBusinessField(BUSINESS_STORAGE_VALUES[BUSINESS_KEYS.BANK_BIC], BUSINESS_KEYS.BANK_BIC, invoiceLang),
    bank_institute: profile.bank_institute,
    bank_iban: profile.bank_iban,
    bank_bic: profile.bank_bic,
    customer_address: customerAddress,
    customer_greeting: customerGreeting,
    invoice_number_date: invoiceNumberDate,
    reference_section: referenceSectionHtml,
    paid_status: '',
    greeting: customerGreeting,
    service_period_text: servicePeriodText,
    position_label: t('invoice.items.position'),
    quantity_label: t('invoice.items.quantity'),
    description_label: t('invoice.items.description'),
    unit_price_label: t('invoice.items.rate'),
    total_label: t('invoice.items.total'),
    net_amount_label: t('invoice.totals.netAmount'),
    total_amount_label: t('invoice.totals.totalAmount'),
    payment_instruction: paymentInstruction,
    thank_you_note: t('invoice.closing.thankYou'),
    closing: t('invoice.closing.regards'),
    name_label: t('invoice.banking.name'),
    bank_label: t('invoice.banking.institute'),
    from_label: t('invoice.template.from'),
    billed_to_label: t('invoice.template.billedTo'),
    details_label: t('invoice.template.details'),
    issued_by_label: t('invoice.template.issuedBy'),
    invoice_heading: t('invoice.template.heading'),
    document_label: t('invoice.template.document'),
    invoice_items: formattedItems,
    net_amount: formatCurrency(netTotal),
    vat_row: vatRowHtml,
    vat_notice: vatNoticeHtml,
    total_amount: formatCurrency(totalAmount),
    contact_details: contactDetailsHtml,
  };

  let html = template;
  for (const [key, value] of Object.entries(replacements)) {
    html = html.replaceAll(`{${key}}`, value || '');
  }
  return html;
};

/**
 * Generates an invoice PDF in memory. Does NOT save to disk.
 * Returns { pdfArrayBuffer, fileName } for preview.
 */
export async function generateInvoicePdf({
  profile,
  customer,
  items,
  invoiceDates,
  currentInvoiceNumber,
  invoiceReference,
  invoicePaid,
  invoiceDueDate,
  invoiceLanguageSetting,
  eRechnungEnabled,
  selectedCurrency,
  i18n,
  t,
  formatCurrency,
}) {
  const originalLanguage = i18n.language;
  const invoiceLang = resolveInvoiceLanguage(invoiceLanguageSetting, customer);

  try {
    await i18n.changeLanguage(invoiceLang);

    const template = await api.getInvoiceTemplate();
    const html = buildInvoiceHtml({
      template,
      profile: { ...profile, _invoiceNumber: currentInvoiceNumber },
      customer,
      items,
      invoiceDates,
      invoiceReference,
      invoicePaid,
      invoiceLang,
      t,
      formatCurrency,
    });

    const fileName = `${customer.name}_${currentInvoiceNumber}`;

    // html2pdf's .from(string) sets innerHTML on a <div>, which strips
    // <html>/<head>/<body> tags — losing all <style> and <link> elements.
    // Parse the full document ourselves and build a proper DOM element.
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const container = document.createElement('div');
    // Copy all <style> tags from <head> into the container
    doc.querySelectorAll('head style').forEach(s => container.appendChild(s.cloneNode(true)));
    // Copy body content
    container.innerHTML += doc.body.innerHTML;

    let pdf = await html2pdf()
      .set({
        margin: 10,
        filename: `${fileName}.pdf`,
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { format: 'a4', orientation: 'portrait' },
      })
      .from(container)
      .outputPdf('arraybuffer');

    if (eRechnungEnabled) {
      try {
        pdf = await createZugferdPdf(pdf, {
          invoiceNumber: currentInvoiceNumber,
          date: new Date(),
          profile,
          customer,
          items,
          currency: selectedCurrency,
          dueDate: invoiceDueDate || null,
        });
      } catch (err) {
        console.error('ZUGFeRD embedding failed:', err);
      }
    }

    return { pdfArrayBuffer: pdf, fileName };
  } finally {
    await i18n.changeLanguage(originalLanguage);
  }
}

/**
 * Saves a previously generated PDF to disk.
 * @param {ArrayBuffer} pdfArrayBuffer
 * @param {string} fileName
 * @param {string|null} savePath - pre-resolved save path from settings
 */
export async function saveInvoicePdf(pdfArrayBuffer, fileName, savePath) {
  return api.saveInvoice(pdfArrayBuffer, fileName, savePath || null);
}
