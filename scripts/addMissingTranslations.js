const fs = require('fs');
const path = require('path');

const locales = ['en', 'de', 'es', 'ko', 'fr', 'zh', 'ja', 'pt', 'ru', 'hi', 'ar', 'it', 'nl', 'tr', 'vi', 'th', 'swg'];
const translationsPath = path.join(__dirname, '../src/i18n/locales');

// Define new translations for all languages
const newTranslations = {
  en: {
    invoice: {
      items: { position: 'Pos.' },
      greeting: {
        diverse: {
          default: 'Hello {full_name}',
          academic: 'Hello {title} {full_name}'
        },
        herr: {
          default: 'Dear Mr. {last_name}',
          academic: 'Dear {title} {last_name}'
        },
        frau: {
          default: 'Dear Mrs. {last_name}',
          academic: 'Dear {title} {last_name}'
        },
        business: 'Dear Sir or Madam',
        neutral: 'Hello {full_name}'
      },
      servicePeriod: {
        range: 'For the service period from {startDate} to {endDate}, I am charging you the following:',
        single: 'For the services on {date}, I am charging you the following:'
      },
      payment: {
        instruction: 'Please transfer the amount of {amount} within the next 7 business days to the following account:'
      },
      banking: {
        name: 'Name',
        institute: 'Institute'
      },
      closing: {
        thankYou: 'Thank you for your business. I look forward to working with you again.',
        regards: 'Kind regards'
      }
    },
    customers: {
      form: {
        titles: {
          neutral: 'Neutral'
        }
      }
    }
  },
  de: {
    invoice: {
      items: { position: 'Pos.' },
      greeting: {
        diverse: {
          default: 'Hallo {full_name}',
          academic: 'Hallo {title} {full_name}'
        },
        herr: {
          default: 'Lieber Herr {last_name}',
          academic: 'Lieber {title} {last_name}'
        },
        frau: {
          default: 'Liebe Frau {last_name}',
          academic: 'Liebe {title} {last_name}'
        },
        business: 'Liebe Damen und Herren',
        neutral: 'Hallo {full_name}'
      },
      servicePeriod: {
        range: 'Für die Dienstzeit von {startDate} bis {endDate}, belaste ich Sie die folgenden:',
        single: 'Für die Dienste am {date}, belaste ich Sie die folgenden:'
      },
      payment: {
        instruction: 'Bitte überweisen Sie den Betrag von {amount} innerhalb von 7 Werktagen auf das folgende Konto:'
      },
      banking: {
        name: 'Name',
        institute: 'Institut'
      },
      closing: {
        thankYou: 'Vielen Dank für Ihr Vertrauen. Ich freue mich, Sie bald wieder zu arbeiten.',
        regards: 'Mit freundlichen Grüßen'
      }
    },
    customers: {
      form: {
        titles: {
          neutral: 'Neutral'
        }
      }
    }
  },
  es: {
    invoice: {
      items: { position: 'Pos.' },
      greeting: {
        diverse: {
          default: 'Hola {full_name}',
          academic: 'Hola {title} {full_name}'
        },
        herr: {
          default: 'Estimado Sr. {last_name}',
          academic: 'Estimado {title} {last_name}'
        },
        frau: {
          default: 'Estimada Sra. {last_name}',
          academic: 'Estimada {title} {last_name}'
        },
        business: 'Estimados Señores y Señoras',
        neutral: 'Hola {full_name}'
      },
      servicePeriod: {
        range: 'Por el período de servicio desde {startDate} hasta {endDate}, le cobro lo siguiente:',
        single: 'Por los servicios del {date}, le cobro lo siguiente:'
      },
      payment: {
        instruction: 'Por favor, transfiera el importe de {amount} dentro de los próximos 7 días hábiles a la siguiente cuenta:'
      },
      banking: {
        name: 'Nombre',
        institute: 'Institución'
      },
      closing: {
        thankYou: 'Gracias por su confianza. Espero seguir trabajando con usted.',
        regards: 'Saludos cordiales'
      }
    },
    customers: {
      form: {
        titles: {
          neutral: 'Neutral'
        }
      }
    }
  },
  fr: {
    invoice: {
      items: { position: 'Pos.' },
      greeting: {
        diverse: {
          default: 'Bonjour {full_name}',
          academic: 'Bonjour {title} {full_name}'
        },
        herr: {
          default: 'Cher M. {last_name}',
          academic: 'Cher {title} {last_name}'
        },
        frau: {
          default: 'Chère Mme {last_name}',
          academic: 'Chère {title} {last_name}'
        },
        business: 'Madame, Monsieur',
        neutral: 'Bonjour {full_name}'
      },
      servicePeriod: {
        range: 'Pour la période de service du {startDate} au {endDate}, je vous facture ce qui suit :',
        single: 'Pour les services du {date}, je vous facture ce qui suit :'
      },
      payment: {
        instruction: 'Veuillez transférer le montant de {amount} dans les 7 jours ouvrables sur le compte suivant :'
      },
      banking: {
        name: 'Nom',
        institute: 'Établissement'
      },
      closing: {
        thankYou: 'Je vous remercie de votre confiance et me réjouis de notre future collaboration.',
        regards: 'Cordialement'
      }
    },
    customers: {
      form: {
        titles: {
          neutral: 'Neutre'
        }
      }
    }
  },
  it: {
    invoice: {
      items: { position: 'Pos.' },
      greeting: {
        diverse: {
          default: 'Ciao {full_name}',
          academic: 'Gentile {title} {full_name}'
        },
        herr: {
          default: 'Egregio Sig. {last_name}',
          academic: 'Egregio {title} {last_name}'
        },
        frau: {
          default: 'Gentile Sig.ra {last_name}',
          academic: 'Gentile {title} {last_name}'
        },
        business: 'Spettabili Signori',
        neutral: 'Gentile {full_name}'
      },
      servicePeriod: {
        range: 'Per il periodo di servizio dal {startDate} al {endDate}, addebito quanto segue:',
        single: 'Per i servizi del {date}, addebito quanto segue:'
      },
      payment: {
        instruction: 'La prego di trasferire l\'importo di {amount} entro 7 giorni lavorativi sul seguente conto:'
      },
      banking: {
        name: 'Nome',
        institute: 'Istituto'
      },
      closing: {
        thankYou: 'Grazie per la fiducia. Non vedo l\'ora di collaborare nuovamente con Lei.',
        regards: 'Cordiali saluti'
      }
    },
    customers: {
      form: {
        titles: {
          neutral: 'Neutro'
        }
      }
    }
  },
  nl: {
    invoice: {
      items: { position: 'Pos.' },
      greeting: {
        diverse: {
          default: 'Hallo {full_name}',
          academic: 'Hallo {title} {full_name}'
        },
        herr: {
          default: 'Geachte heer {last_name}',
          academic: 'Geachte {title} {last_name}'
        },
        frau: {
          default: 'Geachte mevrouw {last_name}',
          academic: 'Geachte {title} {last_name}'
        },
        business: 'Geachte dames en heren',
        neutral: 'Hallo {full_name}'
      },
      servicePeriod: {
        range: 'Voor de dienstperiode van {startDate} tot {endDate} breng ik u het volgende in rekening:',
        single: 'Voor de diensten op {date} breng ik u het volgende in rekening:'
      },
      payment: {
        instruction: 'Gelieve het bedrag van {amount} binnen 7 werkdagen over te maken naar het volgende rekeningnummer:'
      },
      banking: {
        name: 'Naam',
        institute: 'Bank'
      },
      closing: {
        thankYou: 'Bedankt voor uw vertrouwen. Ik kijk uit naar onze verdere samenwerking.',
        regards: 'Met vriendelijke groet'
      }
    },
    customers: {
      form: {
        titles: {
          neutral: 'Neutraal'
        }
      }
    }
  },
  swg: {
    invoice: {
      items: { position: 'Pos.' },
      greeting: {
        diverse: {
          default: 'Griaß di {full_name}',
          academic: 'Griaß di {title} {full_name}'
        },
        herr: {
          default: 'Liabr Herr {last_name}',
          academic: 'Liabr {title} {last_name}'
        },
        frau: {
          default: 'Liabe Frau {last_name}',
          academic: 'Liabe {title} {last_name}'
        },
        business: 'Liabe Leit',
        neutral: 'Griaß di {full_name}'
      },
      servicePeriod: {
        range: 'Für d\'Arbat vom {startDate} bis {endDate} kriagscht jetzt des do:',
        single: 'Für d\'Arbat am {date} kriagscht jetzt des do:'
      },
      payment: {
        instruction: 'Bitte überweis mr den Betrag von {amount} innerhalb von 7 Werkdäg auf des Konto:'
      },
      banking: {
        name: 'Name',
        institute: 'Bank'
      },
      closing: {
        thankYou: 'Vielen Dank für dei Vertraua. I freu mi auf d\'weitere Zammarbeit.',
        regards: 'Ade und bleib gsund'
      }
    },
    customers: {
      form: {
        titles: {
          neutral: 'Neutral'
        }
      }
    }
  },
  zh: {
    invoice: {
      items: { position: '序号' },
      greeting: {
        diverse: {
          default: '您好，{full_name}',
          academic: '您好，{title} {full_name}'
        },
        herr: {
          default: '{last_name}先生',
          academic: '{title} {last_name}先生'
        },
        frau: {
          default: '{last_name}女士',
          academic: '{title} {last_name}女士'
        },
        business: '尊敬的先生/女士',
        neutral: '您好，{full_name}'
      },
      servicePeriod: {
        range: '服务期间从{startDate}至{endDate}，收费明细如下：',
        single: '{date}的服务收费明细如下：'
      },
      payment: {
        instruction: '请在7个工作日内将金额{amount}转入以下账户：'
      },
      banking: {
        name: '姓名',
        institute: '银行'
      },
      closing: {
        thankYou: '感谢您的惠顾。期待与您继续合作。',
        regards: '此致'
      }
    },
    customers: {
      form: {
        titles: {
          neutral: '中性'
        }
      }
    }
  },
  ja: {
    invoice: {
      items: { position: '番号' },
      greeting: {
        diverse: {
          default: '{full_name}様',
          academic: '{title} {full_name}様'
        },
        herr: {
          default: '{last_name}様',
          academic: '{title} {last_name}様'
        },
        frau: {
          default: '{last_name}様',
          academic: '{title} {last_name}様'
        },
        business: '御中',
        neutral: '{full_name}様'
      },
      servicePeriod: {
        range: '{startDate}から{endDate}までのサービス期間について、下記の料金を請求させていただきます：',
        single: '{date}のサービスについて、下記の料金を請求させていただきます：'
      },
      payment: {
        instruction: '請求額{amount}を7営業日以内に下記の口座にお振込みください：'
      },
      banking: {
        name: '名義',
        institute: '金融機関'
      },
      closing: {
        thankYou: 'いつもお引き立ていただき、ありがとうございます。今後ともよろしくお願いいたします。',
        regards: '敬具'
      }
    },
    customers: {
      form: {
        titles: {
          neutral: '中性'
        }
      }
    }
  },
  ko: {
    invoice: {
      items: { position: '번호' },
      greeting: {
        diverse: {
          default: '{full_name}님 안녕하세요',
          academic: '{title} {full_name}님 안녕하세요'
        },
        herr: {
          default: '{last_name}님께',
          academic: '{title} {last_name}님께'
        },
        frau: {
          default: '{last_name}님께',
          academic: '{title} {last_name}님께'
        },
        business: '귀하',
        neutral: '{full_name}님 안녕하세요'
      },
      servicePeriod: {
        range: '{startDate}부터 {endDate}까지의 서비스 기간에 대한 청구 내역입니다:',
        single: '{date}의 서비스에 대한 청구 내역입니다:'
      },
      payment: {
        instruction: '청구 금액 {amount}을(를) 7영업일 이내에 아래 계좌로 입금해 주시기 바랍니다:'
      },
      banking: {
        name: '예금주',
        institute: '은행'
      },
      closing: {
        thankYou: '거래해 주셔서 감사합니다. 앞으로도 좋은 협력 관계를 유지하기를 바랍니다.',
        regards: '감사합니다'
      }
    },
    customers: {
      form: {
        titles: {
          neutral: '중립'
        }
      }
    }
  },
  ar: {
    invoice: {
      items: { position: 'رقم' },
      greeting: {
        diverse: {
          default: 'مرحباً {full_name}',
          academic: 'مرحباً {title} {full_name}'
        },
        herr: {
          default: 'السيد {last_name} المحترم',
          academic: '{title} {last_name} المحترم'
        },
        frau: {
          default: 'السيدة {last_name} المحترمة',
          academic: '{title} {last_name} المحترمة'
        },
        business: 'السادة المحترمون',
        neutral: 'مرحباً {full_name}'
      },
      servicePeriod: {
        range: 'عن فترة الخدمة من {startDate} إلى {endDate}، أود أن أقدم لكم الفاتورة التالية:',
        single: 'عن الخدمات المقدمة بتاريخ {date}، أود أن أقدم لكم الفاتورة التالية:'
      },
      payment: {
        instruction: 'يرجى تحويل المبلغ {amount} خلال 7 أيام عمل إلى الحساب التالي:'
      },
      banking: {
        name: 'الاسم',
        institute: 'البنك'
      },
      closing: {
        thankYou: 'شكراً لثقتكم. نتطلع إلى استمرار تعاوننا.',
        regards: 'مع أطيب التحيات'
      }
    },
    customers: {
      form: {
        titles: {
          neutral: 'محايد'
        }
      }
    }
  },
  pt: {
    invoice: {
      items: { position: 'Pos.' },
      greeting: {
        diverse: {
          default: 'Olá {full_name}',
          academic: 'Olá {title} {full_name}'
        },
        herr: {
          default: 'Prezado Sr. {last_name}',
          academic: 'Prezado {title} {last_name}'
        },
        frau: {
          default: 'Prezada Sra. {last_name}',
          academic: 'Prezada {title} {last_name}'
        },
        business: 'Prezados Senhores e Senhoras',
        neutral: 'Olá {full_name}'
      },
      servicePeriod: {
        range: 'Para o período de serviço de {startDate} a {endDate}, cobro o seguinte:',
        single: 'Para os serviços em {date}, cobro o seguinte:'
      },
      payment: {
        instruction: 'Por favor, transfira o valor de {amount} dentro de 7 dias úteis para a seguinte conta:'
      },
      banking: {
        name: 'Nome',
        institute: 'Banco'
      },
      closing: {
        thankYou: 'Obrigado pela sua confiança. Aguardo ansiosamente nossa próxima colaboração.',
        regards: 'Atenciosamente'
      }
    },
    customers: {
      form: {
        titles: {
          neutral: 'Neutro'
        }
      }
    }
  },
  ru: {
    invoice: {
      items: { position: 'Поз.' },
      greeting: {
        diverse: {
          default: 'Здравствуйте, {full_name}',
          academic: 'Здравствуйте, {title} {full_name}'
        },
        herr: {
          default: 'Уважаемый г-н {last_name}',
          academic: 'Уважаемый {title} {last_name}'
        },
        frau: {
          default: 'Уважаемая г-жа {last_name}',
          academic: 'Уважаемая {title} {last_name}'
        },
        business: 'Уважаемые дамы и господа',
        neutral: 'Здравствуйте, {full_name}'
      },
      servicePeriod: {
        range: 'За период оказания услуг с {startDate} по {endDate} выставляю следующий счет:',
        single: 'За услуги, оказанные {date}, выставляю следующий счет:'
      },
      payment: {
        instruction: 'Пожалуйста, переведите сумму {amount} в течение 7 рабочих дней на следующий счет:'
      },
      banking: {
        name: 'Имя',
        institute: 'Банк'
      },
      closing: {
        thankYou: 'Благодарю за доверие. С нетерпением жду дальнейшего сотрудничества.',
        regards: 'С уважением'
      }
    },
    customers: {
      form: {
        titles: {
          neutral: 'Нейтральный'
        }
      }
    }
  },
  hi: {
    invoice: {
      items: { position: 'क्र.' },
      greeting: {
        diverse: {
          default: 'नमस्ते {full_name}',
          academic: 'नमस्ते {title} {full_name}'
        },
        herr: {
          default: 'श्रीमान {last_name} जी',
          academic: '{title} {last_name} जी'
        },
        frau: {
          default: 'श्रीमती {last_name} जी',
          academic: '{title} {last_name} जी'
        },
        business: 'माननीय महोदय/महोदया',
        neutral: 'नमस्ते {full_name}'
      },
      servicePeriod: {
        range: 'सेवा अवधि {startDate} से {endDate} तक के लिए, मैं निम्नलिखित शुल्क ले रहा/रही हूं:',
        single: '{date} को प्रदान की गई सेवाओं के लिए, मैं निम्नलिखित शुल्क ले रहा/रही हूं:'
      },
      payment: {
        instruction: 'कृपया {amount} की राशि 7 कार्य दिवसों के भीतर निम्नलिखित खाते में स्थानांतरित करें:'
      },
      banking: {
        name: 'नाम',
        institute: 'बैंक'
      },
      closing: {
        thankYou: 'आपके विश्वास के लिए धन्यवाद। आपके साथ भविष्य में काम करने की प्रतीक्षा कर रहा/रही हूं।',
        regards: 'सादर'
      }
    },
    customers: {
      form: {
        titles: {
          neutral: 'तटस्थ'
        }
      }
    }
  },
  tr: {
    invoice: {
      items: { position: 'Pos.' },
      greeting: {
        diverse: {
          default: 'Merhaba {full_name}',
          academic: 'Merhaba {title} {full_name}'
        },
        herr: {
          default: 'Sayın {last_name} Bey',
          academic: 'Sayın {title} {last_name}'
        },
        frau: {
          default: 'Sayın {last_name} Hanım',
          academic: 'Sayın {title} {last_name}'
        },
        business: 'Sayın İlgili',
        neutral: 'Merhaba {full_name}'
      },
      servicePeriod: {
        range: '{startDate} - {endDate} tarihleri arasındaki hizmet dönemi için aşağıdaki tutarı fatura ediyorum:',
        single: '{date} tarihindeki hizmetler için aşağıdaki tutarı fatura ediyorum:'
      },
      payment: {
        instruction: 'Lütfen {amount} tutarını 7 iş günü içinde aşağıdaki hesaba havale ediniz:'
      },
      banking: {
        name: 'İsim',
        institute: 'Banka'
      },
      closing: {
        thankYou: 'Güveniniz için teşekkür ederim. Gelecekte tekrar birlikte çalışmayı dilerim.',
        regards: 'Saygılarımla'
      }
    },
    customers: {
      form: {
        titles: {
          neutral: 'Nötr'
        }
      }
    }
  },
  vi: {
    invoice: {
      items: { position: 'STT' },
      greeting: {
        diverse: {
          default: 'Xin chào {full_name}',
          academic: 'Kính chào {title} {full_name}'
        },
        herr: {
          default: 'Kính gửi ông {last_name}',
          academic: 'Kính gửi {title} {last_name}'
        },
        frau: {
          default: 'Kính gửi bà {last_name}',
          academic: 'Kính gửi {title} {last_name}'
        },
        business: 'Kính gửi Quý khách',
        neutral: 'Xin chào {full_name}'
      },
      servicePeriod: {
        range: 'Cho thời gian dịch vụ từ {startDate} đến {endDate}, tôi tính phí như sau:',
        single: 'Cho dịch vụ ngày {date}, tôi tính phí như sau:'
      },
      payment: {
        instruction: 'Vui lòng chuyển khoản số tiền {amount} trong vòng 7 ngày làm việc vào tài khoản sau:'
      },
      banking: {
        name: 'Tên',
        institute: 'Ngân hàng'
      },
      closing: {
        thankYou: 'Cảm ơn quý khách đã tin tưởng. Rất mong được tiếp tục hợp tác.',
        regards: 'Trân trọng'
      }
    },
    customers: {
      form: {
        titles: {
          neutral: 'Trung tính'
        }
      }
    }
  },
  th: {
    invoice: {
      items: { position: 'ลำดับ' },
      greeting: {
        diverse: {
          default: 'สวัสดี {full_name}',
          academic: 'สวัสดี {title} {full_name}'
        },
        herr: {
          default: 'เรียน คุณ {last_name}',
          academic: 'เรียน {title} {last_name}'
        },
        frau: {
          default: 'เรียน คุณ {last_name}',
          academic: 'เรียน {title} {last_name}'
        },
        business: 'เรียน ท่านผู้มีอุปการคุณ',
        neutral: 'สวัสดี {full_name}'
      },
      servicePeriod: {
        range: 'สำหรับการให้บริการตั้งแต่ {startDate} ถึง {endDate} ขอเรียกเก็บค่าบริการดังนี้:',
        single: 'สำหรับการให้บริการวันที่ {date} ขอเรียกเก็บค่าบริการดังนี้:'
      },
      payment: {
        instruction: 'กรุณาโอนเงินจำนวน {amount} ภายใน 7 วันทำการ ไปยังบัญชีต่อไปนี้:'
      },
      banking: {
        name: 'ชื่อ',
        institute: 'ธนาคาร'
      },
      closing: {
        thankYou: 'ขอบคุณสำหรับความไว้วางใจ หวังว่าจะได้ร่วมงานกันอีกในอนาคต',
        regards: 'ขอแสดงความนับถือ'
      }
    },
    customers: {
      form: {
        titles: {
          neutral: 'เป็นกลาง'
        }
      }
    }
  }
};

// Helper function to deep merge objects
function deepMerge(target, source) {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (source[key] instanceof Object && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {};
        deepMerge(target[key], source[key]);
      } else {
        if (!target[key]) {
          target[key] = source[key];
        }
      }
    }
  }
  return target;
}

function addMissingTranslations() {
  locales.forEach(locale => {
    const filePath = path.join(translationsPath, `${locale}.json`);
    
    try {
      // Read existing translation file
      const content = fs.readFileSync(filePath, 'utf8');
      const translations = JSON.parse(content);
      
      // Get new translations for this locale, fallback to English if not defined
      const newContent = newTranslations[locale] || newTranslations.en;
      
      // Merge new translations with existing ones
      const updatedTranslations = deepMerge(translations, newContent);
      
      // Write back to file with proper formatting
      fs.writeFileSync(
        filePath, 
        JSON.stringify(updatedTranslations, null, 2),
        'utf8'
      );
      
      console.log(`✅ Updated ${locale}.json`);
    } catch (error) {
      console.error(`❌ Error processing ${locale}.json:`, error.message);
    }
  });
}

addMissingTranslations();