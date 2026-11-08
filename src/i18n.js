import { LANGUAGES } from './config.js';

export const LOCALES = [
  { id: 'ar', label: 'العربية', dir: 'rtl', htmlLang: 'ar' },
  { id: 'fr', label: 'Français', dir: 'ltr', htmlLang: 'fr' },
  { id: 'rw', label: 'Ikinyarwanda', dir: 'ltr', htmlLang: 'rw' },
];

const DEFAULT_LOCALE = 'ar';
const STORAGE_KEY = 'arabic-code-lab:locale';

function readStoredLocale() {
  try {
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY);
    return LOCALES.some((locale) => locale.id === stored) ? stored : null;
  } catch {
    return null;
  }
}

let currentLocale = readStoredLocale() || DEFAULT_LOCALE;

const MESSAGES = {
  ar: {
    meta: {
      title: 'مفتاح البرمجة | تعلّم البرمجة بالعربية',
      description: 'مفتاح البرمجة: تعلّم C++ وHTML وقواعد البيانات باستخدام كلمات عربية، مع ترجمة فورية وتنفيذ داخل المتصفح.',
    },
    app: {
      name: 'مِفتاح البرمجة',
      tagline: 'تعلّم البرمجة بالكلمات العربية',
      brandMark: 'م',
      brandAria: 'مفتاح البرمجة',
      edition: 'نسخة الصفوف الأولى',
      tabsAria: 'اختر لغة التعلم',
      localeLabel: 'اللغة',
      localeAria: 'لغة الواجهة',
    },
    editor: {
      kicker: 'اكتب هنا',
      sampleLabel: 'المثال',
      editorAria: 'محرر الكود العربي',
      stdinSummary: 'مدخلات البرنامج (اختياري)',
      stdinPlaceholder: 'ضع كل قيمة في سطر مستقل',
      generatedAria: 'الكود المترجم',
      copy: 'نسخ',
      resetSample: 'استعادة المثال',
      resetDatabase: 'إعادة ضبط البيانات',
      showGenerated: 'عرض الكود المترجم',
      hideGenerated: 'إخفاء الكود المترجم',
      shortcut: 'Ctrl + Enter للتشغيل',
      emptyGenerated: '// لا يوجد كود بعد.',
      copySuccess: 'تم النسخ',
      copyFailed: 'تعذّر النسخ',
    },
    output: {
      kicker: 'النتيجة',
      title: 'المخرجات والمعاينة',
      welcomeKicker: 'جاهز للبدء',
      loadingDefault: 'جارٍ التنفيذ...',
      warningTitle: 'ملاحظة',
      errorTitle: 'تعذّر إكمال العملية',
      unexpectedError: 'حدث خطأ غير متوقع.',
      lineColumn: 'السطر {line}، العمود {column}',
      lineOnly: 'السطر {line}',
      technicalDetails: 'تفاصيل تقنية',
      duration: 'مدة التنفيذ: {ms} مللي ثانية',
      exitCode: 'رمز الخروج: {code}',
      binary: '[بيانات ثنائية]',
      noRows: 'لا توجد صفوف.',
      table: 'الجدول',
      currentTables: 'بيانات الجداول الحالية',
      cppErrorTitle: 'تعذّر تنفيذ برنامج C++',
      printedBeforeError: 'ما طُبع قبل الخطأ',
      emptyOutput: 'انتهى البرنامج دون مخرجات.',
      sqlBootstrapErrorTitle: 'تعذّر تجهيز قاعدة البيانات',
      databaseReadyKicker: 'قاعدة البيانات جاهزة',
      databaseReadyTitle: 'بيانات تجريبية بين يديك',
      databaseReadyText: 'اكتب استعلامك بالعربية ثم اضغط «نفّذ الاستعلام». يمكنك إضافة صفوف أو تعديل البيانات، وستبقى التغييرات حتى تعيد الضبط.',
      experimentalTablesTitle: 'جداول قاعدة البيانات التجريبية',
      sqlErrorTitle: 'تعذّر تنفيذ استعلام SQL',
      resultHeadingSingle: 'النتيجة • {rows} صف',
      resultHeadingMultiple: 'النتيجة {index} • {rows} صف',
      successTitle: 'تم تنفيذ الأمر بنجاح',
      affectedRows: 'الصفوف المتأثرة: {count}. يمكنك كتابة استعلام اختر لعرض البيانات.',
      noResults: 'لم يكن للأمر نتائج لعرضها.',
      previewLabel: 'معاينة مباشرة',
      previewNote: 'JavaScript معطّل داخل المعاينة',
      openNewWindow: 'فتح في نافذة جديدة',
      iframeTitle: 'معاينة صفحة HTML',
      transpileErrorTitle: 'تعذّر تحويل الكود العربي',
    },
    reference: {
      kicker: 'مرجع سريع',
      title: 'قاموس الكلمات',
      arabicColumn: 'بالعربية',
      cppKeywords: 'كلمات C++',
      sqlKeywords: 'كلمات SQL',
      cppTarget: 'كود C++',
      sqlTarget: 'كود SQL',
      htmlTags: 'وسوم HTML',
      htmlAttributes: 'سمات HTML',
      htmlTagTarget: 'وسم HTML',
      htmlAttrTarget: 'سمة HTML',
      schemaTitle: 'جداول قاعدة البيانات',
      tipsTitle: 'نصائح سريعة',
      introCpp: 'هذه الكلمات تُفهم داخل محرر C++. الأسماء العربية تتحول تلقائيًا إلى أسماء إنجليزية مناسبة.',
      introHtml: 'استبدل الوسوم الإنجليزية بوسوم عربية واضحة؛ سيبقى الناتج صفحة HTML قياسية.',
      introSql: 'اكتب أوامر SQL بالعربية على الجداول التجريبية. الكلمات هنا هي الأوامر التي يفهمها المحوّل.',
    },
    footer: {
      line: 'مفتاح البرمجة: جسر عربي إلى <bdi dir="ltr">C++</bdi> وHTML وSQL. الكود المترجم قابل للنسخ والتشغيل في بيئة حقيقية.',
      sub: 'يعمل المشغّل التجريبي داخل المتصفح دون إرسال الكود إلى خادم.',
    },
    noscript: 'يحتاج هذا التطبيق إلى JavaScript للترجمة والتنفيذ داخل المتصفح.',
    status: {
      ready: 'جاهز',
      running: 'جارٍ التنفيذ...',
      success: 'تم التشغيل',
      error: 'يوجد خطأ',
      sqlPreparing: 'جارٍ التجهيز...',
      sqlReady: 'قاعدة البيانات جاهزة',
      sqlPrepareError: 'تعذّر تجهيز البيانات',
      resetting: 'جارٍ إعادة الضبط...',
      resetDone: 'تمت إعادة الضبط',
      resetError: 'تعذّر إعادة الضبط',
      executing: 'جارٍ التنفيذ...',
      previewing: 'تم العرض',
      querying: 'جارٍ تنفيذ الاستعلام...',
      runningProgram: 'جارٍ تشغيل البرنامج...',
      executionFailed: 'تعذّر التنفيذ',
    },
    loading: {
      sqlPreparing: 'جارٍ تجهيز قاعدة البيانات...',
      htmlPreview: 'جارٍ تجهيز المعاينة...',
      sqlQuery: 'جارٍ تنفيذ الاستعلام...',
      cppProgram: 'جارٍ تشغيل البرنامج...',
      resettingData: 'جارٍ إعادة ضبط البيانات...',
    },
    warnings: {
      cppString: 'JSCPP لا يدعم std::string ولا تخزين النص العربي في متغيرات char* أو char[]؛ اطبع النص العربي مباشرة أو استخدم g++ لتشغيل المتغيرات النصية.',
    },
    errors: {
      generic: {
        unknown: { summary: 'حدث خطأ غير متوقع.' },
        parseFailed: { summary: 'تعذّر تحليل الكود العربي.' },
      },
      cpp: {
        unclosedBlockComment: { summary: 'لم يتم إغلاق التعليق المتعدد.', hint: 'أضف */ في نهاية التعليق.' },
        unclosedString: { summary: 'لم يتم إغلاق النص.', hint: 'أضف {quote} لإغلاق النص أو الحرف.' },
        missingMain: { summary: 'لا توجد دالة رئيسية لتشغيل البرنامج.', hint: 'أضف دالة رئيسية مثل: صحيح رئيسية() { ... }، ثم استدعِ الدوال بداخلها.' },
        nonLeadingPreprocessor: { summary: 'لا يمكن إضافة دالة رئيسية تلقائيًا لهذا الكود.', hint: 'ضع توجيهات #include و#define في بداية الكود، أو أضف دالة رئيسية صريحة.' },
        runtimeStartFailed: { summary: 'تعذّر بدء مشغّل C++.', hint: 'تأكد من تشغيل التطبيق عبر خادم محلي وليس بفتح الملف مباشرة.' },
        runtimeTimeout: { summary: 'استغرق التنفيذ وقتًا طويلًا وتم إيقافه.', hint: 'قد توجد حلقة لا تنتهي. تحقق من شرط التوقف داخل طالما أو لكل.' },
        runtimeWorkerFailed: { summary: 'تعذّر تشغيل مشغّل C++.', hint: 'تأكد من تشغيل التطبيق عبر خادم محلي، ثم أعد المحاولة.' },
        runtimeLibrary: { summary: 'المكتبة المطلوبة غير مدعومة في المشغّل التجريبي.', hint: 'المشغّل يدعم أساسيات C++. جرّب إزالة المكتبة، أو انسخ الكود المترجم وشغّله باستخدام g++.' },
        runtimeParse: { summary: 'تعذّر تحليل كود C++ المترجم.', hint: 'تحقق من الأقواس، الفواصل المنقوطة، وعلامات الاقتباس.' },
        runtimeNoMain: { summary: 'لم يجد المشغّل دالة البداية.', hint: 'أضف دالة رئيسية باستخدام: صحيح رئيسية() { ... }' },
        runtimeDivision: { summary: 'حدثت قسمة على صفر أثناء التنفيذ.', hint: 'تأكد أن المقسوم عليه ليس صفرًا قبل تنفيذ القسمة.' },
        runtimeOverflow: { summary: 'تجاوزت قيمة المتغير الحد المسموح به.', hint: 'استخدم نوعًا أكبر مثل عشري، أو تحقق من قيم المتغيرات.' },
        runtimeInfinite: { summary: 'استغرق التنفيذ وقتًا طويلًا.', hint: 'قد توجد حلقة لا تنتهي. تحقق من شرط التوقف.' },
        runtimeGeneric: { summary: 'تعذّر تنفيذ برنامج C++.', hint: 'راجع الكود المترجم، وتأكد من إغلاق الأقواس والفواصل المنقوطة.' },
      },
      html: {
        unclosedComment: { summary: 'لم يتم إغلاق تعليق HTML.', hint: 'أضف --> لإغلاق التعليق.' },
        unclosedTag: { summary: 'لم يتم إغلاق وسم HTML.', hint: 'أضف > في نهاية الوسم.' },
      },
      sql: {
        unclosedBlockComment: { summary: 'لم يتم إغلاق التعليق المتعدد.', hint: 'أضف */ في نهاية التعليق.' },
        unclosedString: { summary: 'لم يتم إغلاق النص في استعلام SQL.', hint: 'أضف {quote} لإغلاق النص.' },
        loadFailed: { summary: 'تعذّر تحميل مشغّل SQL.', hint: 'تأكد من وجود ملفات vendor.' },
        vendorMissing: { summary: 'تعذّر تحميل مشغّل SQL. تأكد من وجود ملفات vendor.', hint: 'تحقق من مجلد vendor.' },
        notReady: { summary: 'قاعدة البيانات غير مهيأة بعد.', hint: 'انتظر انتهاء التجهيز ثم أعد المحاولة.' },
        notInitialized: { summary: 'لم يُهيَّأ مشغّل SQL بشكل صحيح.', hint: 'أعد تحميل الصفحة ثم حاول مجددًا.' },
        noSuchTable: { summary: 'لا يوجد جدول باسم «{name}».', hint: 'تحقق من اسم الجدول في قسم «بيانات الجداول».' },
        noSuchColumn: { summary: 'لا يوجد عمود باسم «{name}».', hint: 'تحقق من أسماء الأعمدة في قسم «بيانات الجداول».' },
        noSuchFunction: { summary: 'الدالة «{name}» غير معروفة.', hint: 'تحقق من اسم الدالة أو استخدم إحدى دوال SQL المدعومة.' },
        syntaxNear: { summary: 'خطأ في الصياغة قرب «{token}».', hint: 'تحقق من الفواصل والأقواس وترتيب الكلمات.' },
        tableExists: { summary: 'الجدول «{name}» موجود مسبقًا.', hint: 'استخدم اسمًا آخر أو احذف الجدول أولًا.' },
        unique: { summary: 'تكرار في قيمة يجب أن تكون فريدة: «{name}».', hint: 'غيّر القيمة المكررة أو احذف الصف القديم أولًا.' },
        notNull: { summary: 'لا يمكن ترك العمود «{name}» فارغًا.', hint: 'أضف قيمة للعمود المطلوب داخل INSERT.' },
        generic: { summary: 'حدث خطأ في قاعدة البيانات.', hint: 'راجع أسماء الجداول والأعمدة وصياغة الأمر.' },
      },
    },
  },
  fr: {
    meta: {
      title: 'Miftah Al-Barmaja | Apprendre à programmer en arabe',
      description: "Miftah Al-Barmaja : apprenez C++, HTML et les bases de données avec des mots arabes, avec traduction instantanée et exécution dans le navigateur.",
    },
    app: {
      name: 'Miftah Al-Barmaja',
      tagline: 'Apprenez à programmer avec des mots arabes',
      brandMark: 'M',
      brandAria: 'Miftah Al-Barmaja',
      edition: 'Édition débutants',
      tabsAria: "Choisissez un langage d'apprentissage",
      localeLabel: 'Langue',
      localeAria: "Langue de l'interface",
    },
    editor: {
      kicker: 'Écrivez ici',
      sampleLabel: 'Exemple',
      editorAria: 'Éditeur de code arabe',
      stdinSummary: 'Entrée du programme (facultatif)',
      stdinPlaceholder: "Une valeur par ligne, par exemple :\n5",
      generatedAria: 'Code traduit',
      copy: 'Copier',
      resetSample: "Restaurer l'exemple",
      resetDatabase: 'Réinitialiser les données',
      showGenerated: 'Afficher le code traduit',
      hideGenerated: 'Masquer le code traduit',
      shortcut: 'Ctrl + Entrée pour exécuter',
      emptyGenerated: '// Aucun code pour le moment.',
      copySuccess: 'Copié',
      copyFailed: 'Copie impossible',
    },
    output: {
      kicker: 'Résultat',
      title: 'Sorties et aperçu',
      welcomeKicker: 'Prêt à commencer',
      loadingDefault: 'Exécution en cours...',
      warningTitle: 'Remarque',
      errorTitle: "Impossible de terminer l'opération",
      unexpectedError: "Une erreur inattendue s'est produite.",
      lineColumn: 'Ligne {line}, colonne {column}',
      lineOnly: 'Ligne {line}',
      technicalDetails: 'Détails techniques',
      duration: "Durée d'exécution : {ms} ms",
      exitCode: 'Code de sortie : {code}',
      binary: '[données binaires]',
      noRows: 'Aucune ligne.',
      table: 'Tableau',
      currentTables: 'Données actuelles des tables',
      cppErrorTitle: "Impossible d'exécuter le programme C++",
      printedBeforeError: "Sortie avant l'erreur",
      emptyOutput: "Le programme s'est terminé sans sortie.",
      sqlBootstrapErrorTitle: 'Impossible de préparer la base de données',
      databaseReadyKicker: 'Base de données prête',
      databaseReadyTitle: "Des données d'exemple à portée de main",
      databaseReadyText: "Écrivez votre requête en arabe, puis cliquez sur « Exécuter la requête ». Vous pouvez ajouter ou modifier des lignes ; les changements restent jusqu'à la réinitialisation.",
      experimentalTablesTitle: "Tables de la base de données d'exemple",
      sqlErrorTitle: "Impossible d'exécuter la requête SQL",
      resultHeadingSingle: 'Résultat • {rows} ligne',
      resultHeadingMultiple: 'Résultat {index} • {rows} ligne',
      successTitle: 'Commande exécutée avec succès',
      affectedRows: 'Lignes affectées : {count}. Vous pouvez écrire une requête SELECT pour afficher les données.',
      noResults: "La commande n'a produit aucun résultat à afficher.",
      previewLabel: 'Aperçu en direct',
      previewNote: "JavaScript est désactivé dans l'aperçu",
      openNewWindow: 'Ouvrir dans un nouvel onglet',
      iframeTitle: 'Aperçu de la page HTML',
      transpileErrorTitle: 'Impossible de traduire le code arabe',
    },
    reference: {
      kicker: 'Référence rapide',
      title: 'Dictionnaire des mots',
      arabicColumn: 'En arabe',
      cppKeywords: 'Mots C++',
      sqlKeywords: 'Mots SQL',
      cppTarget: 'Code C++',
      sqlTarget: 'Code SQL',
      htmlTags: 'Balises HTML',
      htmlAttributes: 'Attributs HTML',
      htmlTagTarget: 'Balise HTML',
      htmlAttrTarget: 'Attribut HTML',
      schemaTitle: 'Tables de la base de données',
      tipsTitle: 'Conseils rapides',
      introCpp: "Ces mots sont compris dans l'éditeur C++. Les noms arabes sont automatiquement convertis en noms anglais valides.",
      introHtml: 'Remplacez les balises anglaises par des balises arabes claires ; le résultat reste une page HTML standard.',
      introSql: "Écrivez des commandes SQL en arabe sur les tables d'exemple. Les mots ici sont les commandes comprises par le traducteur.",
    },
    footer: {
      line: 'Miftah Al-Barmaja : un pont arabe vers <bdi dir="ltr">C++</bdi>, HTML et SQL. Le code traduit peut être copié et exécuté dans un environnement réel.',
      sub: "L'exécuteur d'essai fonctionne dans le navigateur sans envoyer le code à un serveur.",
    },
    noscript: 'Cette application nécessite JavaScript pour traduire et exécuter le code dans le navigateur.',
    status: {
      ready: 'Prêt',
      running: 'Exécution...',
      success: 'Exécuté',
      error: 'Erreur',
      sqlPreparing: 'Préparation...',
      sqlReady: 'Base de données prête',
      sqlPrepareError: 'Impossible de préparer les données',
      resetting: 'Réinitialisation...',
      resetDone: 'Réinitialisé',
      resetError: 'Réinitialisation impossible',
      executing: 'Exécution...',
      previewing: 'Aperçu affiché',
      querying: 'Exécution de la requête...',
      runningProgram: 'Exécution du programme...',
      executionFailed: "Impossible d'exécuter",
    },
    loading: {
      sqlPreparing: 'Préparation de la base de données...',
      htmlPreview: "Préparation de l'aperçu...",
      sqlQuery: 'Exécution de la requête...',
      cppProgram: 'Exécution du programme...',
      resettingData: 'Réinitialisation des données...',
    },
    warnings: {
      cppString: "JSCPP ne prend pas en charge std::string ni le stockage de texte arabe dans des variables char* ou char[] ; affichez directement le texte arabe ou utilisez g++ pour exécuter des variables de texte.",
    },
    errors: {
      generic: {
        unknown: { summary: "Une erreur inattendue s'est produite." },
        parseFailed: { summary: "Impossible d'analyser le code arabe." },
      },
      cpp: {
        unclosedBlockComment: { summary: "Le commentaire multiligne n'est pas fermé.", hint: 'Ajoutez */ à la fin du commentaire.' },
        unclosedString: { summary: "Le texte n'est pas fermé.", hint: 'Ajoutez {quote} pour fermer le texte ou le caractère.' },
        missingMain: { summary: "Aucune fonction principale n'a été trouvée pour exécuter le programme.", hint: "Ajoutez une fonction principale comme : صحيح رئيسية() { ... }, puis appelez vos fonctions à l'intérieur." },
        nonLeadingPreprocessor: { summary: 'Impossible d’ajouter automatiquement une fonction principale à ce code.', hint: 'Placez les directives #include et #define au début du code, ou ajoutez une fonction principale explicite.' },
        runtimeStartFailed: { summary: "Impossible de démarrer l'exécuteur C++.", hint: "Vérifiez que l'application est lancée via un serveur local, pas en ouvrant le fichier directement." },
        runtimeTimeout: { summary: "L'exécution a pris trop de temps et a été arrêtée.", hint: "Il y a peut-être une boucle infinie. Vérifiez la condition d'arrêt dans طالما ou لكل." },
        runtimeWorkerFailed: { summary: "Impossible de lancer l'exécuteur C++.", hint: "Vérifiez que l'application est lancée via un serveur local, puis réessayez." },
        runtimeLibrary: { summary: "La bibliothèque demandée n'est pas prise en charge par l'exécuteur d'essai.", hint: "L'exécuteur prend en charge les bases de C++. Retirez la bibliothèque ou copiez le code traduit et exécutez-le avec g++." },
        runtimeParse: { summary: "Impossible d'analyser le code C++ traduit.", hint: 'Vérifiez les accolades, les points-virgules et les guillemets.' },
        runtimeNoMain: { summary: "L'exécuteur n'a pas trouvé la fonction de départ.", hint: 'Ajoutez une fonction principale avec : صحيح رئيسية() { ... }' },
        runtimeDivision: { summary: "Une division par zéro s'est produite pendant l'exécution.", hint: "Assurez-vous que le diviseur n'est pas zéro avant la division." },
        runtimeOverflow: { summary: 'La valeur de la variable a dépassé la limite autorisée.', hint: 'Utilisez un type plus grand comme عشري, ou vérifiez les valeurs des variables.' },
        runtimeInfinite: { summary: "L'exécution a pris trop de temps.", hint: "Il y a peut-être une boucle infinie. Vérifiez la condition d'arrêt." },
        runtimeGeneric: { summary: 'Impossible d’exécuter le programme C++.', hint: 'Vérifiez le code traduit et assurez-vous que les accolades et les points-virgules sont fermés.' },
      },
      html: {
        unclosedComment: { summary: "Le commentaire HTML n'est pas fermé.", hint: 'Ajoutez --> pour fermer le commentaire.' },
        unclosedTag: { summary: "La balise HTML n'est pas fermée.", hint: 'Ajoutez > à la fin de la balise.' },
      },
      sql: {
        unclosedBlockComment: { summary: "Le commentaire multiligne n'est pas fermé.", hint: 'Ajoutez */ à la fin du commentaire.' },
        unclosedString: { summary: "Le texte de la requête SQL n'est pas fermé.", hint: 'Ajoutez {quote} pour fermer le texte.' },
        loadFailed: { summary: "Impossible de charger l'exécuteur SQL.", hint: 'Vérifiez que les fichiers vendor sont présents.' },
        vendorMissing: { summary: "Impossible de charger l'exécuteur SQL. Vérifiez que les fichiers vendor existent.", hint: 'Vérifiez le dossier vendor.' },
        notReady: { summary: "La base de données n'est pas encore prête.", hint: 'Attendez la fin de la préparation puis réessayez.' },
        notInitialized: { summary: "L'exécuteur SQL n'a pas été initialisé correctement.", hint: 'Rechargez la page puis réessayez.' },
        noSuchTable: { summary: 'Aucune table nommée « {name} ».', hint: 'Vérifiez le nom de la table dans la section « Données des tables ».' },
        noSuchColumn: { summary: 'Aucune colonne nommée « {name} ».', hint: 'Vérifiez les noms de colonnes dans la section « Données des tables ».' },
        noSuchFunction: { summary: 'La fonction « {name} » est inconnue.', hint: 'Vérifiez le nom de la fonction ou utilisez une fonction SQL prise en charge.' },
        syntaxNear: { summary: 'Erreur de syntaxe près de « {token} ».', hint: 'Vérifiez les virgules, les parenthèses et l’ordre des mots.' },
        tableExists: { summary: 'La table « {name} » existe déjà.', hint: "Utilisez un autre nom ou supprimez d'abord la table." },
        unique: { summary: 'Valeur dupliquée dans une colonne unique : « {name} ».', hint: "Modifiez la valeur dupliquée ou supprimez d'abord l'ancienne ligne." },
        notNull: { summary: 'La colonne « {name} » ne peut pas être vide.', hint: 'Ajoutez une valeur pour la colonne requise dans INSERT.' },
        generic: { summary: "Une erreur s'est produite dans la base de données.", hint: 'Vérifiez les noms de tables et de colonnes ainsi que la syntaxe de la commande.' },
      },
    },
  },
  rw: {
    meta: {
      title: 'Urufunguzo rwa Porogaramu | Wiga porogaramu mu Cyarabu',
      description: "Urufunguzo rwa Porogaramu: wiga C++, HTML n'ububiko bw'amakuru ukoresheje amagambo y'Icyarabu, uhita uhinduza kandi ugakora muri browser.",
    },
    app: {
      name: 'Urufunguzo rwa Porogaramu',
      tagline: "Wiga porogaramu ukoresheje amagambo y'Icyarabu",
      brandMark: 'U',
      brandAria: 'Urufunguzo rwa Porogaramu',
      edition: "Verisiyo y'abatangira",
      tabsAria: 'Hitamo ururimi wiga',
      localeLabel: 'Ururimi',
      localeAria: "Ururimi rw'ibigaragara",
    },
    editor: {
      kicker: 'Andika hano',
      sampleLabel: 'Urugero',
      editorAria: "Umwanditsi wa kode y'Icyarabu",
      stdinSummary: 'Ibwinjizwa muri porogaramu (si ngombwa)',
      stdinPlaceholder: 'Shyira agaciro kamwe kuri buri murongo, urugero:\n5',
      generatedAria: 'Kode yahinduwe',
      copy: 'Koporora',
      resetSample: 'Garuka ku rugero',
      resetDatabase: 'Ongera utangire amakuru',
      showGenerated: 'Erekana kode yahinduwe',
      hideGenerated: 'Hisha kode yahinduwe',
      shortcut: 'Ctrl + Enter kugira ngo utangire',
      emptyGenerated: '// Nta kode ihari.',
      copySuccess: 'Byakoporowe',
      copyFailed: 'Ntibishoboye gukoporora',
    },
    output: {
      kicker: 'Igisubizo',
      title: "Ibisohoka n'ibigaragara",
      welcomeKicker: 'Byiteguye gutangira',
      loadingDefault: 'Birakora...',
      warningTitle: 'Icyitonderwa',
      errorTitle: 'Ntibyakunze kurangira',
      unexpectedError: 'Habaye ikibazo gitunguranye.',
      lineColumn: 'Umurongo {line}, inkingi {column}',
      lineOnly: 'Umurongo {line}',
      technicalDetails: 'Amakuru ya tekiniki',
      duration: 'Igihe cyo gukora: {ms} ms',
      exitCode: 'Kode yo gusohoka: {code}',
      binary: '[amakuru ya binary]',
      noRows: 'Nta murongo.',
      table: 'Imbonerahamwe',
      currentTables: 'Amakuru ari mu mbonerahamwe ubu',
      cppErrorTitle: 'Ntibishobotse gukora porogaramu ya C++',
      printedBeforeError: "Ibyasohotse mbere y'ikibazo",
      emptyOutput: 'Porogaramu yarangiye nta gisohoka.',
      sqlBootstrapErrorTitle: 'Ntibishobotse gutegura amakuru',
      databaseReadyKicker: 'Amakuru yiteguye',
      databaseReadyTitle: "Amakuru y'igerageza ari hafi",
      databaseReadyText: "Andika ikibazo cyawe mu Cyarabu hanyuma ukande «Koresha ikibazo». Ushobora kongeraho cyangwa guhindura imirongo; impinduka zizaguma kugeza usubije amakuru.",
      experimentalTablesTitle: "Imbonerahamwe z'amakuru y'igerageza",
      sqlErrorTitle: 'Ntibishobotse gukora ikibazo cya SQL',
      resultHeadingSingle: 'Igisubizo • umurongo {rows}',
      resultHeadingMultiple: 'Igisubizo {index} • imirongo {rows}',
      successTitle: 'Itegeko ryakozwe neza',
      affectedRows: 'Imirongo yahinduwe: {count}. Ushobora kwandika ikibazo cya SELECT kugira ngo urebe amakuru.',
      noResults: 'Itegeko nta gisubizo cyo kwerekana ryatanze.',
      previewLabel: 'Irebero ritaziguye',
      previewNote: 'JavaScript yazimijwe mu irebero',
      openNewWindow: 'Fungura mu idirishya rishya',
      iframeTitle: 'Irebero rya paji HTML',
      transpileErrorTitle: "Ntibishobotse guhindura kode y'Icyarabu",
    },
    reference: {
      kicker: 'Ubuyobozi bwihuse',
      title: "Inkoranyamagambo y'amagambo",
      arabicColumn: 'Mu Cyarabu',
      cppKeywords: 'Amagambo ya C++',
      sqlKeywords: 'Amagambo ya SQL',
      cppTarget: 'Kode C++',
      sqlTarget: 'Kode SQL',
      htmlTags: 'Ibimenyetso bya HTML',
      htmlAttributes: 'Ibiranga HTML',
      htmlTagTarget: 'Ikimenyetso cya HTML',
      htmlAttrTarget: 'Ikiranga HTML',
      schemaTitle: "Imbonerahamwe z'amakuru",
      tipsTitle: 'Inama zihuse',
      introCpp: "Aya magambo ategurwa mu mwanditsi wa C++. Amazina y'Icyarabu ahindurwa mu buryo bwikora mu mazina y'icyongereza yemewe.",
      introHtml: "Simbuza ibimenyetso by'icyongereza n'ibimenyetso by'Icyarabu bisobanutse; ibisubizo bizaguma ari paji isanzwe ya HTML.",
      introSql: "Andika amabwiriza ya SQL mu Cyarabu ku mbonerahamwe z'igerageza. Amagambo aha ari yo mabwiriza umuhinduzi yumva.",
    },
    footer: {
      line: 'Urufunguzo rwa Porogaramu: ikiraro cy\'Icyarabu kigana kuri <bdi dir="ltr">C++</bdi>, HTML na SQL. Kode yahinduwe ishobora gukoporwa no gukoreshwa aho nyaburanga.',
      sub: 'Igerageza rikorerwa muri browser nta kohereza kode kuri seriveri.',
    },
    noscript: 'Iyi porogaramu ikeneye JavaScript kugira ngo ihindure kandi ikore kode muri browser.',
    status: {
      ready: 'Byiteguye',
      running: 'Birakora...',
      success: 'Byakozwe',
      error: 'Ikibazo',
      sqlPreparing: 'Biratunganywa...',
      sqlReady: 'Amakuru yiteguye',
      sqlPrepareError: 'Ntibishobotse gutegura amakuru',
      resetting: 'Bisubizwa...',
      resetDone: 'Byasubijwe',
      resetError: 'Ntibishobotse gusubiza',
      executing: 'Birakora...',
      previewing: 'Irebero ryerekanwe',
      querying: 'Ikibazo kirategurwa...',
      runningProgram: 'Porogaramu irategurwa...',
      executionFailed: 'Ntibishobotse gukora',
    },
    loading: {
      sqlPreparing: 'Amakuru arategurwa...',
      htmlPreview: 'Irebero rirategurwa...',
      sqlQuery: 'Ikibazo kirategurwa...',
      cppProgram: 'Porogaramu irategurwa...',
      resettingData: 'Amakuru asubizwa...',
    },
    warnings: {
      cppString: "JSCPP ntishyigikira std::string cyangwa kubika inyandiko y'Icyarabu mu bihinduka bya char* cyangwa char[]; ereka inyandiko y'Icyarabu mu buryo butaziguye cyangwa ukoreshe g++ kugira ngo ukoreshe ibihinduka by'inyandiko.",
    },
    errors: {
      generic: {
        unknown: { summary: 'Habaye ikibazo gitunguranye.' },
        parseFailed: { summary: "Ntibishobotse gusesengura kode y'Icyarabu." },
      },
      cpp: {
        unclosedBlockComment: { summary: "Icyitonderwa cy'imirongo myinshi nticyafunze.", hint: "Ongeraho */ ku mpera y'icyitonderwa." },
        unclosedString: { summary: 'Inyandiko ntiyafunze.', hint: 'Ongeraho {quote} kugira ngo ufunge inyandiko cyangwa inyuguti.' },
        missingMain: { summary: "Nta mukorere w'ibanze wabonetse wo gukora porogaramu.", hint: "Ongeraho umukorere w'ibanze nka: صحيح رئيسية() { ... }, hanyuma uhamagare imikorere yawe imbere." },
        nonLeadingPreprocessor: { summary: "Ntibishobotse kongeraho umukorere w'ibanze mu buryo bwikora kuri iyi kode.", hint: 'Shyira amabwiriza #include na #define mu ntangiriro ya kode, cyangwa wongereho umukorere w\'ibanze usobanutse.' },
        runtimeStartFailed: { summary: 'Ntibishobotse gutangira umukoresha wa C++.', hint: "Emeza ko porogaramu itangijwe binyuze kuri seriveri y'aho hantu, ntabwo ufunguye dosiye mu buryo butaziguye." },
        runtimeTimeout: { summary: 'Gukora byatwaye igihe kinini bityo birahagarikwa.', hint: 'Hari imizunguruko itarangira. Reba ibisabwa byo guhagarara muri طالما cyangwa لكل.' },
        runtimeWorkerFailed: { summary: 'Ntibishobotse gukoresha umukoresha wa C++.', hint: "Emeza ko porogaramu itangijwe kuri seriveri y'aho hantu, hanyuma ugerageze." },
        runtimeLibrary: { summary: "Isomero usabye ntirishyigikiwe n'umukoresha w'igerageza.", hint: "Umukoresha ushyigikira ibintu by'ibanze bya C++. Kuraho isomero, cyangwa koporora kode yahinduwe uyikoreshe na g++." },
        runtimeParse: { summary: 'Ntibishobotse gusesengura kode ya C++ yahinduwe.', hint: "Reba amabuto, utudomo two gutandukanya, n'ibimenyetso byo gusobanura." },
        runtimeNoMain: { summary: 'Umukoresha ntabwo yabonye umukorere wo gutangira.', hint: "Ongeraho umukorere w'ibanze ukoresheje: صحيح رئيسية() { ... }" },
        runtimeDivision: { summary: 'Habaye kugabanya na zeru mu gihe cyo gukora.', hint: 'Emeza ko umugabuzi atari zeru mbere yo kugabanya.' },
        runtimeOverflow: { summary: "Agaciro k'ibihinduka karenze urugero rwemewe.", hint: "Koresha ubwoko bunini nka عشري, cyangwa reba agaciro k'ibihinduka." },
        runtimeInfinite: { summary: 'Gukora byatwaye igihe kinini.', hint: 'Hari imizunguruko itarangira. Reba ibisabwa byo guhagarara.' },
        runtimeGeneric: { summary: 'Ntibishobotse gukora porogaramu ya C++.', hint: "Reba kode yahinduwe, kandi emeza ko amabuto n'utudomo two gutandukanya byafunze." },
      },
      html: {
        unclosedComment: { summary: 'Icyitonderwa cya HTML nticyafunze.', hint: 'Ongeraho --> kugira ngo ufunge icyitonderwa.' },
        unclosedTag: { summary: 'Ikimenyetso cya HTML nticyafunze.', hint: "Ongeraho > ku mpera y'ikimenyetso." },
      },
      sql: {
        unclosedBlockComment: { summary: "Icyitonderwa cy'imirongo myinshi nticyafunze.", hint: "Ongeraho */ ku mpera y'icyitonderwa." },
        unclosedString: { summary: "Inyandiko y'ikibazo cya SQL ntiyafunze.", hint: 'Ongeraho {quote} kugira ngo ufunge inyandiko.' },
        loadFailed: { summary: 'Ntibishobotse gupakira umukoresha wa SQL.', hint: 'Emeza ko dosiye za vendor zihari.' },
        vendorMissing: { summary: 'Ntibishobotse gupakira umukoresha wa SQL. Emeza ko dosiye za vendor zihari.', hint: 'Reba dosiye za vendor.' },
        notReady: { summary: 'Amakuru ntarategurwa.', hint: 'Tegereza ko gutegura birangira hanyuma ugerageze.' },
        notInitialized: { summary: 'Umukoresha wa SQL ntabwo yateguwe neza.', hint: 'Ongera upakire paji hanyuma ugerageze.' },
        noSuchTable: { summary: 'Nta mbonerahamwe yitwa « {name} ».', hint: "Reba izina ry'imbonerahamwe mu gice «Amakuru ari mu mbonerahamwe»." },
        noSuchColumn: { summary: 'Nta nkingi yitwa « {name} ».', hint: "Reba amazina y'inkingi mu gice «Amakuru ari mu mbonerahamwe»." },
        noSuchFunction: { summary: 'Umukorere « {name} » ntazwi.', hint: 'Reba izina ry’umukorere cyangwa koresha umukorere wa SQL ushyigikiwe.' },
        syntaxNear: { summary: 'Ikibazo cy’imyandikire hafi ya « {token} ».', hint: "Reba utudomo, amabuto n'urutonde rw'amagambo." },
        tableExists: { summary: 'Imbonerahamwe « {name} » isanzweho.', hint: 'Koresha irindi zina cyangwa banza usibe imbonerahamwe.' },
        unique: { summary: 'Agaciro kasubiwemo mu nkingi isaba umwihariko: « {name} ».', hint: 'Hindura agaciro kasubiwemo cyangwa banza usibe umurongo wa kera.' },
        notNull: { summary: 'Inkingi « {name} » ntishobora kuba ubusa.', hint: "Ongeraho agaciro k'inkingi isabwa muri INSERT." },
        generic: { summary: 'Habaye ikibazo mu makuru.', hint: "Reba amazina y'imbonerahamwe n'inkingi ndetse n'imyandikire y'itegeko." },
      },
    },
  },
};

const LANGUAGE_UI = {
  fr: {
    cpp: {
      title: 'Les bases du C++',
      description: 'Écrivez des mots arabes et nous les traduirons en code C++ réellement exécutable.',
      runLabel: 'Exécuter le C++',
      generatedLabel: 'Code C++ traduit',
      welcomeTitle: 'Écrivez du C++ en arabe',
      welcomeText: "Commencez à écrire un programme C++ avec des mots arabes clairs. Le code anglais traduit apparaît via le bouton « Afficher le code traduit », puis vous pouvez l'exécuter directement.",
      tips: [
        'Les noms de variables arabes sont automatiquement traduits en noms anglais valides.',
        'Utilisez ; à la fin de chaque instruction, et { } pour délimiter les blocs.',
        'Conditions : إذا (condition) { ... } وإلا { ... }.',
        'Boucles : لكل (début; condition; pas) ou طالما (condition).',
        'Fonctions : صحيح دالة nom(paramètres) { أرجع valeur; }.',
        "Utilisez اطبع et اقرأ pour l'entrée/sortie, et « و », « أو », « ليس » pour la logique.",
        "L'exécuteur d'essai prend en charge les nombres et la logique. Les variables de texte arabe nécessitent un exécuteur C++ natif.",
      ],
      sampleLabel: 'Programme',
      stdin: {
        label: 'Entrée du programme (facultatif)',
        placeholder: "Une valeur par ligne, par exemple :\n5",
      },
      samples: {
        hello: { title: 'Premiers pas', description: 'Affichez un simple message de bienvenue.' },
        conditions: { title: 'Variables et conditions', description: 'Essayez int, bool, double et إذا/وإلا.' },
        loops: { title: 'Boucles', description: 'Additionnez des nombres avec لكل et طالما.' },
        functions: { title: 'Fonctions', description: 'Définissez deux fonctions arabes et appelez-les.' },
        input: { title: 'Entrées', description: "Lisez un nombre dans le champ d'entrée puis affichez son double." },
      },
    },
    html: {
      title: 'Pages web',
      description: 'Écrivez la structure de la page avec des balises arabes et voyez le résultat immédiatement.',
      runLabel: 'Afficher la page',
      generatedLabel: 'Page HTML traduite',
      welcomeTitle: 'Écrivez une page web en arabe',
      welcomeText: 'Utilisez des balises arabes comme صفحة, رأس, جسم et فقرة. Le traducteur les convertit en HTML standard et les affiche dans un aperçu isolé.',
      tips: [
        'Les balises arabes sont traduites en balises HTML standard.',
        'Ajoutez les attributs en arabe : الرابط, المصدر, البديل, الصنف...',
        'Le traducteur ajoute automatiquement lang="ar" et dir="rtl" à la balise de page.',
        "L'aperçu est dans un cadre isolé ; JavaScript ne fonctionne pas.",
        "Utilisez des guillemets doubles pour les valeurs d'attributs.",
      ],
      sampleLabel: 'Page',
      samples: {
        'first-page': { title: 'Première page', description: "Structure complète d'une page avec des balises arabes." },
        table: { title: 'Tableau des notes', description: 'Affichez des données organisées dans un tableau.' },
        attributes: { title: 'Balises et attributs', description: 'Essayez les liens, les attributs et le texte mis en forme.' },
      },
    },
    sql: {
      title: 'Bases de données',
      description: "Écrivez des commandes SQL en arabe sur une base de données d'exemple prête à l'emploi.",
      runLabel: 'Exécuter la requête',
      generatedLabel: 'Requête SQL traduite',
      welcomeTitle: 'Écrivez votre première requête',
      welcomeText: "Choisissez les colonnes, indiquez la table et ajoutez une condition. Les requêtes s'exécutent sur une base SQLite dans le navigateur.",
      tips: [
        "Les tables الطلاب et المواد sont prêtes dans la base d'exemple.",
        'اختر ... من ... حيث ... pour récupérer et filtrer les données.',
        'أدخل في ... قيم ... pour ajouter une nouvelle ligne.',
        'Vous pouvez utiliser la virgule arabe « ، » au lieu de la virgule anglaise.',
        'في signifie INTO dans INSERT, tandis que ضمن signifie IN.',
        "Utilisez le bouton « Réinitialiser les données » pour revenir aux données d'origine.",
      ],
      sampleLabel: 'Requête',
      samples: {
        select: { title: 'Sélection et tri', description: 'Affichez les étudiants de plus de 20 ans triés par âge.' },
        insert: { title: 'Ajouter un étudiant', description: 'Ajoutez une nouvelle ligne puis affichez-la.' },
        stats: { title: 'Statistiques', description: 'Utilisez les fonctions de comptage et de moyenne.' },
      },
    },
  },
  rw: {
    cpp: {
      title: "Ibirimo by'ibanze bya C++",
      description: "Andika amagambo y'Icyarabu tuhindure mu kode C++ nyayo ishobora gukora.",
      runLabel: 'Koresha C++',
      generatedLabel: 'Kode C++ yahinduwe',
      welcomeTitle: 'Andika C++ mu Cyarabu',
      welcomeText: "Tangira wandike porogaramu ya C++ ukoresheje amagambo y'Icyarabu yumvikana. Kode y'icyongereza yahinduwe izagaragara iyo ukanda «Erekana kode yahinduwe», hanyuma uyikoreshe ako kanya.",
      tips: [
        "Amazina y'ibihinduka y'Icyarabu ahindurwa mu buryo bwikora mu mazina y'icyongereza yemewe.",
        'Koresha ; ku mpera ya buri nteruro, na { } ku gushyiraho ibice.',
        'Ibisabwa: إذا (condition) { ... } وإلا { ... }.',
        'Imizunguruko: لكل (intangiriro; ibisabwa; intambwe) cyangwa طالما (ibisabwa).',
        'Imikorere: صحيح دالة izina(ibipimo) { أرجع agaciro; }.',
        "Koresha اطبع na اقرأ mu bwinjizwa no mu bisohoka, na « و », « أو », « ليس » mu bushishozi.",
        "Igerageza rikoresha imibare n'ubushishozi. Ibihinduka by'inyandiko y'Icyarabu bisaba C++ nyayo.",
      ],
      sampleLabel: 'Porogaramu',
      stdin: {
        label: 'Ibwinjizwa muri porogaramu (si ngombwa)',
        placeholder: 'Shyira agaciro kamwe kuri buri murongo, urugero:\n5',
      },
      samples: {
        hello: { title: 'Intangiriro', description: 'Erekana ubutumwa bwo kwakira bworoshye.' },
        conditions: { title: "Ibihinduka n'ibisabwa", description: 'Gerageza int, bool, double na إذا/وإلا.' },
        loops: { title: 'Imizunguruko', description: 'Koranya imibare ukoresheje لكل na طالما.' },
        functions: { title: 'Imikorere', description: "Sobanura imikorere ibiri y'Icyarabu hanyuma uyihamagare." },
        input: { title: 'Ibwinjizwa', description: 'Soma umubare mu kwinjiza hanyuma werekane kabiri yayo.' },
      },
    },
    html: {
      title: "Paji z'urubuga",
      description: "Andika imiterere ya paji ukoresheje ibimenyetso by'Icyarabu hanyuma urebe ibisubizo ako kanya.",
      runLabel: 'Erekana paji',
      generatedLabel: 'Paji HTML yahinduwe',
      welcomeTitle: "Andika paji y'urubuga mu Cyarabu",
      welcomeText: "Koresha ibimenyetso by'Icyarabu nka صفحة, رأس, جسم na فقرة. Umuhinduzi azibihindura muri HTML isanzwe hanyuma ayerekane mu irebero ryihariye.",
      tips: [
        "Ibimenyetso by'Icyarabu bihindurwa mu bimenyetso bisanzwe bya HTML.",
        'Ongeraho ibiranga mu Cyarabu: الرابط, المصدر, البديل, الصنف...',
        'Umuhinduzi yongeraho lang="ar" na dir="rtl" ku kimenyetso cya paji mu buryo bwikora.',
        'Irebero riri mu kirahure cyihariye; JavaScript ntabwo ikora.',
        "Koresha amagambo abiri y'ubusa ku gaciro k'ibiranga.",
      ],
      sampleLabel: 'Paji',
      samples: {
        'first-page': { title: 'Paji ya mbere', description: "Imiterere yuzuye ya paji n'ibimenyetso by'Icyarabu." },
        table: { title: "Imbonerahamwe y'amanota", description: 'Erekana amakuru atunganye mu mbonerahamwe.' },
        attributes: { title: "Ibimenyetso n'ibiranga", description: "Gerageza amahuza, ibiranga n'inyandiko itunganyijwe." },
      },
    },
    sql: {
      title: "Ububiko bw'amakuru",
      description: "Andika amabwiriza ya SQL mu Cyarabu ku makuru y'igerageza yiteguye.",
      runLabel: 'Koresha ikibazo',
      generatedLabel: 'SQL yahinduwe',
      welcomeTitle: 'Andika ikibazo cya mbere',
      welcomeText: 'Hitamo inkingi, gena imbonerahamwe, hanyuma wongereho ibisabwa. Ibibazo bizakorwa kuri SQLite iri muri browser.',
      tips: [
        "Imbonerahamwe الطلاب na المواد ziteguye mu makuru y'igerageza.",
        'اختر ... من ... حيث ... kugira ngo uzane amakuru kandi uyungurure.',
        'أدخل في ... قيم ... kugira ngo wongere umurongo mushya.',
        "Ushobora gukoresha akitso k'Icyarabu « ، » mu mwanya w'akitso cy'icyongereza.",
        'في isobanura INTO muri INSERT, naho ضمن isobanura IN.',
        "Koresha buto «Ongera utangire amakuru» kugira ngo usubire ku makuru y'umwimerere.",
      ],
      sampleLabel: 'Ikibazo',
      samples: {
        select: { title: 'Guhitamo no gutondeka', description: 'Erekana abanyeshuri barengeje imyaka 20 batondekanyijwe hakurikijwe imyaka.' },
        insert: { title: 'Kongeraho umunyeshuri', description: 'Ongeraho umurongo mushya hanyuma uwerekane.' },
        stats: { title: 'Imibare', description: 'Koresha imikorere yo kubara no kubona impuzandengo.' },
      },
    },
  },
};

const KEYWORD_NOTES = {
  fr: {
    cpp: {
      'صحيح': 'Entier',
      'عشري': 'Nombre décimal',
      'حرف': 'Un seul caractère',
      'منطقي': 'Vrai ou faux',
      'فراغ': 'Fonction sans valeur de retour',
      'نص': "Pour l'exécuteur natif uniquement",
      'دالة': 'Marqueur facultatif avant le nom de la fonction',
      'اطبع': 'Afficher',
      'اقرأ': "Lire depuis l'entrée",
      'سطر_جديد': 'Passer à la ligne suivante',
      'ثابت': 'Valeur qui ne change pas',
      'توقف': 'Terminer la boucle',
      'تابع': "Passer l'itération actuelle",
      'رئيسية': 'Point de départ du programme',
      'و': 'ET logique',
      'أو': 'OU logique',
      'ليس': 'Négation logique',
    },
    sql: {
      'اختر': 'Pour récupérer les données',
      'حيث': 'Pour filtrer les résultats',
      'أدخل': 'Pour ajouter une ligne',
      'في': 'INTO dans INSERT, et IN en dehors',
      'عدد': 'Fonction de comptage',
      'متوسط': 'Fonction de moyenne',
      'مجموع': 'Fonction de somme',
      'أقصى': 'Valeur maximale',
      'أدنى': 'Valeur minimale',
      'باسم': 'Pour donner un alias',
      'حد': 'Pour limiter le nombre de lignes',
    },
    html: {
      'صفحة': 'Racine de la page',
    },
  },
  rw: {
    cpp: {
      'صحيح': 'Umubare wuzuye',
      'عشري': "Umubare w'ibice",
      'حرف': 'Inyuguti imwe',
      'منطقي': 'Ukuri cyangwa ikinyoma',
      'فراغ': 'Umukorere udafite agaciro gagaruka',
      'نص': 'Ku mukoresha nyakuri gusa',
      'دالة': "Ikimenyetso kidasabwa mbere y'izina ry'umukorere",
      'اطبع': 'Erekana',
      'اقرأ': 'Soma mu bwinjizwa',
      'سطر_جديد': 'Jya ku murongo ukurikira',
      'ثابت': 'Agaciro kadahinduka',
      'توقف': 'Hagarika umuzunguruko',
      'تابع': 'Simbuka uruziga ruriho',
      'رئيسية': 'Aho porogaramu itangirira',
      'و': 'NA (logique)',
      'أو': 'CYANGWA (logique)',
      'ليس': 'Guhakana (logique)',
    },
    sql: {
      'اختر': 'Kuzana amakuru',
      'حيث': 'Kuyungurura ibisubizo',
      'أدخل': 'Kongeraho umurongo',
      'في': 'INTO muri INSERT, na IN hanze yayo',
      'عدد': 'Umukorere wo kubara',
      'متوسط': "Umukorere w'impuzandengo",
      'مجموع': "Umukorere w'igiteranyo",
      'أقصى': 'Agaciro ntarengwa',
      'أدنى': 'Agaciro gato',
      'باسم': 'Kugira ngo utange izina rindi',
      'حد': "Kugarukira umubare w'imirongo",
    },
    html: {
      'صفحة': 'Inkomoko ya paji',
    },
  },
};

function getPath(object, path) {
  return path.split('.').reduce((value, key) => {
    if (value === undefined || value === null) return undefined;
    return value[key];
  }, object);
}

function interpolate(value, params) {
  if (typeof value !== 'string') return value;
  return value.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] === undefined ? match : String(params[key]);
  });
}

export function getLocale() {
  return currentLocale;
}

export function setLocale(localeId) {
  if (!LOCALES.some((locale) => locale.id === localeId)) return currentLocale;

  currentLocale = localeId;

  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, localeId);
  } catch {
    return currentLocale;
  }

  return currentLocale;
}

export function localeInfo(localeId = currentLocale) {
  return LOCALES.find((locale) => locale.id === localeId) || LOCALES[0];
}

export function t(key, params = {}, localeId = currentLocale) {
  const localized = getPath(MESSAGES[localeId], key);
  const fallback = getPath(MESSAGES[DEFAULT_LOCALE], key);
  const value = localized === undefined ? fallback : localized;

  if (value === undefined) return key;
  return interpolate(value, params);
}

export function languageUi(languageId, localeId = currentLocale) {
  const base = LANGUAGES[languageId];
  const override = LANGUAGE_UI[localeId]?.[languageId] || {};
  const sampleOverrides = override.samples || {};

  return {
    ...base,
    ...override,
    stdin: {
      ...(base.stdin || {}),
      ...(override.stdin || {}),
    },
    samples: base.samples.map((sample) => ({
      ...sample,
      ...(sampleOverrides[sample.id] || {}),
    })),
  };
}

export function keywordNote(languageId, entry, localeId = currentLocale) {
  const note = KEYWORD_NOTES[localeId]?.[languageId]?.[entry.ar];
  return note || entry.note || '';
}

export function warningText(warning, localeId = currentLocale) {
  if (!warning) return '';
  if (typeof warning === 'string') return warning;
  if (warning.key) return t(warning.key, warning.params || {}, localeId);
  return String(warning);
}

export function translateError(error, localeId = currentLocale) {
  const params = error?.params || {};
  const summary = error?.summaryKey
    ? t(`errors.${error.summaryKey}.summary`, params, localeId)
    : error?.summary || t('errors.generic.unknown.summary', params, localeId);
  const hint = error?.hintKey
    ? t(`errors.${error.hintKey}.hint`, params, localeId)
    : error?.hint || '';

  return { ...error, summary, hint };
}
