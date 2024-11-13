const fs = require('fs');
const path = require('path');

const locales = ['en', 'de', 'es', 'ko', 'fr', 'zh', 'ja', 'pt', 'ru', 'hi', 'ar', 'it', 'nl', 'tr', 'vi', 'th', 'swg'];

// Translations for all languages
const translations = {
  en: {
    settings: {
      gallery: "Gallery",
      recentTemplates: "Recent Templates",
      actions: {
        showGallery: "Show Gallery",
        hideGallery: "Hide Gallery",
        refresh: "Refresh"
      },
      renameTemplate: "Rename Template",
      placeholders: {
        templateName: "Enter template name"
      },
      success: {
        templateLoad: "Template loaded successfully",
        templateDelete: "Template deleted successfully",
        templateRename: "Template renamed successfully"
      },
      errors: {
        templateGalleryLoad: "Error loading template gallery",
        templateDelete: "Error deleting template",
        templateRename: "Error renaming template"
      },
      confirmations: {
        deleteTemplate: "Are you sure you want to delete this template? This action cannot be undone."
      }
    },
    common: {
      rename: "Rename",
      copy: "Copy to Clipboard"
    }
  },
  de: {
    settings: {
      gallery: "Galerie",
      recentTemplates: "Kürzlich verwendete Vorlagen",
      actions: {
        showGallery: "Galerie anzeigen",
        hideGallery: "Galerie ausblenden",
        refresh: "Aktualisieren"
      },
      renameTemplate: "Vorlage umbenennen",
      placeholders: {
        templateName: "Vorlagennamen eingeben"
      },
      success: {
        templateLoad: "Vorlage erfolgreich geladen",
        templateDelete: "Vorlage erfolgreich gelöscht",
        templateRename: "Vorlage erfolgreich umbenannt"
      },
      errors: {
        templateGalleryLoad: "Fehler beim Laden der Vorlagengalerie",
        templateDelete: "Fehler beim Löschen der Vorlage",
        templateRename: "Fehler beim Umbenennen der Vorlage"
      },
      confirmations: {
        deleteTemplate: "Sind Sie sicher, dass Sie diese Vorlage löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden."
      }
    },
    common: {
      rename: "Umbenennen",
      copy: "In die Zwischenablage kopieren"
    }
  },
  es: {
    settings: {
      gallery: "Galería",
      recentTemplates: "Plantillas recientes",
      actions: {
        showGallery: "Mostrar galería",
        hideGallery: "Ocultar galería",
        refresh: "Actualizar"
      },
      renameTemplate: "Renombrar plantilla",
      placeholders: {
        templateName: "Introducir nombre de plantilla"
      },
      success: {
        templateLoad: "Plantilla cargada con éxito",
        templateDelete: "Plantilla eliminada con éxito",
        templateRename: "Plantilla renombrada con éxito"
      },
      errors: {
        templateGalleryLoad: "Error al cargar la galería de plantillas",
        templateDelete: "Error al eliminar la plantilla",
        templateRename: "Error al renombrar la plantilla"
      },
      confirmations: {
        deleteTemplate: "¿Está seguro de que desea eliminar esta plantilla? Esta acción no se puede deshacer."
      }
    },
    common: {
      rename: "Renombrar",
      copy: "Copiar al portapapeles"
    }
  },
  fr: {
    settings: {
      gallery: "Galerie",
      recentTemplates: "Modèles récents",
      actions: {
        showGallery: "Afficher la galerie",
        hideGallery: "Masquer la galerie",
        refresh: "Actualiser"
      },
      renameTemplate: "Renommer le modèle",
      placeholders: {
        templateName: "Entrer le nom du modèle"
      },
      success: {
        templateLoad: "Modèle chargé avec succès",
        templateDelete: "Modèle supprimé avec succès",
        templateRename: "Modèle renommé avec succès"
      },
      errors: {
        templateGalleryLoad: "Erreur lors du chargement de la galerie",
        templateDelete: "Erreur lors de la suppression du modèle",
        templateRename: "Erreur lors du renommage du modèle"
      },
      confirmations: {
        deleteTemplate: "Êtes-vous sûr de vouloir supprimer ce modèle ? Cette action ne peut pas être annulée."
      }
    },
    common: {
      rename: "Renommer",
      copy: "Copier dans le presse-papiers"
    }
  },
  zh: {
    settings: {
      gallery: "画廊",
      recentTemplates: "最近的模板",
      actions: {
        showGallery: "显示画廊",
        hideGallery: "隐藏画廊",
        refresh: "刷新"
      },
      renameTemplate: "重命名模板",
      placeholders: {
        templateName: "输入模板名称"
      },
      success: {
        templateLoad: "模板加载成功",
        templateDelete: "模板删除成功",
        templateRename: "模板重命名成功"
      },
      errors: {
        templateGalleryLoad: "加载模板画廊时出错",
        templateDelete: "删除模板时出错",
        templateRename: "重命名模板时出错"
      },
      confirmations: {
        deleteTemplate: "您确定要删除此模板吗？此操作无法撤消。"
      }
    },
    common: {
      rename: "重命名",
      copy: "复制到剪贴板"
    }
  },
  ja: {
    settings: {
      gallery: "ギャラリー",
      recentTemplates: "最近のテンプレート",
      actions: {
        showGallery: "ギャラリーを表示",
        hideGallery: "ギャラリーを非表示",
        refresh: "更新"
      },
      renameTemplate: "テンプレートの名前を変更",
      placeholders: {
        templateName: "テンプレート名を入力"
      },
      success: {
        templateLoad: "テンプレートを正常に読み込みました",
        templateDelete: "テンプレートを正常に削除しました",
        templateRename: "テンプレートの名前を正常に変更しました"
      },
      errors: {
        templateGalleryLoad: "テンプレートギャラリーの読み込みエラー",
        templateDelete: "テンプレートの削除エラー",
        templateRename: "テンプレートの名前変更エラー"
      },
      confirmations: {
        deleteTemplate: "このテンプレートを削除してもよろしいですか？この操作は元に戻せません。"
      }
    },
    common: {
      rename: "名前を変更",
      copy: "クリップボードにコピー"
    }
  },
  ko: {
    settings: {
      gallery: "갤러리",
      recentTemplates: "최근 템플릿",
      actions: {
        showGallery: "갤러리 표시",
        hideGallery: "갤러리 숨기기",
        refresh: "새로고침"
      },
      renameTemplate: "템플릿 이름 변경",
      placeholders: {
        templateName: "템플릿 이름 입력"
      },
      success: {
        templateLoad: "템플릿을 성공적으로 불러왔습니다",
        templateDelete: "템플릿을 성공적으로 삭제했습니다",
        templateRename: "템플릿 이름을 성공적으로 변경했습니다"
      },
      errors: {
        templateGalleryLoad: "템플릿 갤러리 로드 중 오류 발생",
        templateDelete: "템플릿 삭제 중 오류 발생",
        templateRename: "템플릿 이름 변경 중 오류 발생"
      },
      confirmations: {
        deleteTemplate: "이 템플릿을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다."
      }
    },
    common: {
      rename: "이름 변경",
      copy: "클립보드에 복사"
    }
  },
  pt: {
    settings: {
      gallery: "Galeria",
      recentTemplates: "Modelos recentes",
      actions: {
        showGallery: "Mostrar galeria",
        hideGallery: "Ocultar galeria",
        refresh: "Atualizar"
      },
      renameTemplate: "Renomear modelo",
      placeholders: {
        templateName: "Digite o nome do modelo"
      },
      success: {
        templateLoad: "Modelo carregado com sucesso",
        templateDelete: "Modelo excluído com sucesso",
        templateRename: "Modelo renomeado com sucesso"
      },
      errors: {
        templateGalleryLoad: "Erro ao carregar galeria de modelos",
        templateDelete: "Erro ao excluir modelo",
        templateRename: "Erro ao renomear modelo"
      },
      confirmations: {
        deleteTemplate: "Tem certeza que deseja excluir este modelo? Esta ação não pode ser desfeita."
      }
    },
    common: {
      rename: "Renomear",
      copy: "Copiar para área de transferência"
    }
  },
  ru: {
    settings: {
      gallery: "Галерея",
      recentTemplates: "Недавние шаблоны",
      actions: {
        showGallery: "Показать галерею",
        hideGallery: "Скрыть галерею",
        refresh: "Обновить"
      },
      renameTemplate: "Переименовать шаблон",
      placeholders: {
        templateName: "Введите имя шаблона"
      },
      success: {
        templateLoad: "Шаблон успешно загружен",
        templateDelete: "Шаблон успешно удален",
        templateRename: "Шаблон успешно переименован"
      },
      errors: {
        templateGalleryLoad: "Ошибка при загрузке галереи шаблонов",
        templateDelete: "Ошибка при удалении шаблона",
        templateRename: "Ошибка при переименовании шаблона"
      },
      confirmations: {
        deleteTemplate: "Вы уверены, что хотите удалить этот шаблон? Это действие нельзя отменить."
      }
    },
    common: {
      rename: "Переименовать",
      copy: "Копировать в буфер обмена"
    }
  },
  hi: {
    settings: {
      gallery: "गैलरी",
      recentTemplates: "हाल के टेम्पलेट्स",
      actions: {
        showGallery: "गैलरी दिखाएं",
        hideGallery: "गैलरी छिपाएं",
        refresh: "रीफ्रेश करें"
      },
      renameTemplate: "टेम्पलेट का नाम बदलें",
      placeholders: {
        templateName: "टेम्पलेट का नाम दर्ज करें"
      },
      success: {
        templateLoad: "टेम्पलेट सफलतापूर्वक लोड हुआ",
        templateDelete: "टेम्पलेट सफलतापूर्वक हटा दिया गया",
        templateRename: "टेम्पलेट का नाम सफलतापूर्वक बदला गया"
      },
      errors: {
        templateGalleryLoad: "टेम्पलेट गैलरी लोड करने में त्रुटि",
        templateDelete: "टेम्पलेट हटाने में त्रुटि",
        templateRename: "टेम्पलेट का नाम बदलने में त्रुटि"
      },
      confirmations: {
        deleteTemplate: "क्या आप वाकई इस टेम्पलेट को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।"
      }
    },
    common: {
      rename: "नाम बदलें",
      copy: "क्लिपबोर्ड पर कॉपी करें"
    }
  },
  ar: {
    settings: {
      gallery: "المعرض",
      recentTemplates: "القوالب الأخيرة",
      actions: {
        showGallery: "إظهار المعرض",
        hideGallery: "إخفاء المعرض",
        refresh: "تحديث"
      },
      renameTemplate: "إعادة تسمية القالب",
      placeholders: {
        templateName: "أدخل اسم القالب"
      },
      success: {
        templateLoad: "تم تحميل القالب بنجاح",
        templateDelete: "تم حذف القالب بنجاح",
        templateRename: "تمت إعادة تسمية القالب بنجاح"
      },
      errors: {
        templateGalleryLoad: "خطأ في تحميل معرض القوالب",
        templateDelete: "خطأ في حذف القالب",
        templateRename: "خطأ في إعادة تسمية القالب"
      },
      confirmations: {
        deleteTemplate: "هل أنت متأكد أنك تريد حذف هذا القالب؟ لا يمكن التراجع عن هذا الإجراء."
      }
    },
    common: {
      rename: "إعادة تسمية",
      copy: "نسخ إلى الحافظة"
    }
  },
  it: {
    settings: {
      gallery: "Galleria",
      recentTemplates: "Modelli recenti",
      actions: {
        showGallery: "Mostra galleria",
        hideGallery: "Nascondi galleria",
        refresh: "Aggiorna"
      },
      renameTemplate: "Rinomina modello",
      placeholders: {
        templateName: "Inserisci il nome del modello"
      },
      success: {
        templateLoad: "Modello caricato con successo",
        templateDelete: "Modello eliminato con successo",
        templateRename: "Modello rinominato con successo"
      },
      errors: {
        templateGalleryLoad: "Errore durante il caricamento della galleria",
        templateDelete: "Errore durante l'eliminazione del modello",
        templateRename: "Errore durante la rinominazione del modello"
      },
      confirmations: {
        deleteTemplate: "Sei sicuro di voler eliminare questo modello? Questa operazione non può essere annullata."
      }
    },
    common: {
      rename: "Rinomina",
      copy: "Copia nel portapapere"
    }
  }
};

// Deep merge function to preserve existing translations
function deepMerge(target, source) {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (source[key] instanceof Object && key in target) {
        deepMerge(target[key], source[key]);
      } else if (!(key in target)) {
        target[key] = source[key];
      }
    }
  }
  return target;
}

function cleanupFile(locale) {
  const filePath = path.join(__dirname, '..', 'src', 'i18n', 'locales', `${locale}.json`);
  
  try {
    // Read existing translations
    let content = {};
    if (fs.existsSync(filePath)) {
      content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    // Merge new translations with existing ones
    content = deepMerge(content, translations[locale]);

    // Write the merged translations back to file
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
    console.log(`✅ Updated ${locale}.json with new translations`);
  } catch (error) {
    console.error(`❌ Error processing ${locale}.json:`, error);
  }
}

// Process all locale files
locales.forEach(cleanupFile); 