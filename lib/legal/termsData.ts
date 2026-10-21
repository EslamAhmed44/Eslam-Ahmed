export interface LegalClause {
  id: string;
  number: string;
  numberAr: string;
  title: string;
  titleAr: string;
  category: 'privacy' | 'terms' | 'financial' | 'ip' | 'general';
  summary?: string;
  summaryAr?: string;
  points: {
    text: string;
    textAr: string;
    isHighlighted?: boolean;
  }[];
}

export interface LegalAgreementData {
  title: string;
  titleAr: string;
  subtitle: string;
  subtitleAr: string;
  preamble: {
    heading: string;
    headingAr: string;
    text: string;
    textAr: string;
  };
  metadata: {
    version: string;
    lastUpdated: string;
    lastUpdatedAr: string;
    jurisdiction: string;
    jurisdictionAr: string;
  };
  clauses: LegalClause[];
}

export const legalAgreement: LegalAgreementData = {
  title: 'Digital Design & Motion Graphics Services Agreement',
  titleAr: 'عقد تقديم خدمات التصميم الرقمي والموشن جرافيك',
  subtitle: 'Terms of Service, Commercial Agreement & Privacy Policy',
  subtitleAr: 'الشروط والأحكام والاتفاقية التجارية وسياسة الخصوصية',
  metadata: {
    version: '2026.1 Official',
    lastUpdated: 'October 2026',
    lastUpdatedAr: 'أكتوبر 2026',
    jurisdiction: 'Electronic Commercial Agreements',
    jurisdictionAr: 'المبادئ العامة للعقود والتجارة الإلكترونية',
  },
  preamble: {
    heading: 'Preamble & Legal Capacity',
    headingAr: 'تمهيد وديباجة العقد والأهلية التعاقدية',
    text: 'Under this agreement, the First Party (Islam Ahmed — Graphic & Motion Graphic Designer) possesses specialized expertise, technical mastery, and creative capabilities in digital visual design (including but not limited to: Graphic Design, Motion Graphics, Visual Brand Identity, Social Media Content, and Digital Art). Whereas the Second Party (The Client) desires to engage the creative services of the First Party to fulfill project requirements, both parties, possessing full legal, Sharia, and contractual capacity, hereby mutually agree to the following terms, conditions, and privacy policies:',
    textAr: 'ثبت بموجب هذا الاتفاق أن الطرف الأول (إسلام أحمد — مصمم الجرافيك والموشن جرافيك) يمتلك الخبرة والمهارة الاحترافية في مجال التصميم الرقمي (ويشمل ذلك على سبيل المثال لا الحصر: التصميم الجرافيكي، الموشن جرافيك، تصميم الهويات البصرية، محتوى السوشيال ميديا، والديجيتال آرت)، وحيث رغب الطرف الثاني (العميل) في الاستعانة بخدمات الطرف الأول لتلبية احتياجاته الإبداعية، فقد اتفق الطرفان وهما بأهلية معتبرة شرعاً وقانوناً على الشروط والأحكام والسياسات الآتية:',
  },
  clauses: [
    {
      id: 'clause-1',
      number: 'Clause 1',
      numberAr: 'البند الأول',
      title: 'Scope of Digital Services & Approved Communication Channels',
      titleAr: 'نطاق الخدمات الرقمية ووسائل التواصل المعتمدة',
      category: 'privacy',
      summary: 'Specifies project scope and validates official digital channels for binding communication.',
      summaryAr: 'تحديد نطاق الأعمال واعتماد القنوات الرقمية الرسمية كوسائل تعاقدية ملزمة.',
      points: [
        {
          text: 'Both parties agree that the requested services encompass the preparation, conceptualization, and visual execution of digital assets based on project briefs attached to this agreement or established via approved communication channels.',
          textAr: 'يتفق الطرفان على أن الخدمة المطلوبة تشمل إعداد وتصميم المواد البصرية الرقمية المتفق عليها بناءً على تفاصيل المشروع المرفقة بهذا العقد أو المتفق عليها عبر وسائل التواصل الرسمية المعتمدة بين الطرفين.',
        },
        {
          text: 'Official communication platforms mutually approved for messaging, file exchange, instructions, and feedback (such as WhatsApp, LinkedIn, Email, or designated digital platforms) constitute legally binding and evidentiary records documenting project milestones, workflows, and stipulations, forming an integral part of this contract.',
          textAr: 'تُعتبر منصات وتطبيقات التواصل الاجتماعي والمراسلة المعتمدة رسمياً بين الطرفين لتبادل الملفات، والتعليمات والملاحظات (مثل: تطبيق واتساب WhatsApp، منصة لينكد إن LinkedIn، البريد الإلكتروني، أو أي منصات رقمية أخرى يتم الاتفاق عليها) وسائل قانونية معتبرة ومُلزمة في إثبات تفاصيل ومراحل سير العمل والاتفاقات الجارية بين الطرفين، وتُعد مخرجاتها جزءاً لا يتجزأ من هذا العقد.',
          isHighlighted: true,
        },
      ],
    },
    {
      id: 'clause-2',
      number: 'Clause 2',
      numberAr: 'البند الثاني',
      title: 'Financial Mechanism, Milestone Payments & Final Settlement',
      titleAr: 'الآلية المالية وطريقة الدفع والدفعات المرحلية',
      category: 'financial',
      summary: 'Structured 20% advance deposit, 20% per major milestone, and 100% final settlement prior to master file release.',
      summaryAr: 'عربون مقدم بنسبة 20%، دفعات مرحلية بنسبة 20%، وسداد كامل 100% قبل تسليم الملفات النهائية المفتوحة.',
      points: [
        {
          text: 'Initial Deposit (Advance Payment): The Client commits to paying a non-refundable upfront deposit of 20% of the total project agreement value as a condition precedent to commencing work. The Service Provider shall not initiate execution until this deposit is received and confirmed.',
          textAr: 'الدفعة المقدمة (العربون): يلتزم العميل بسداد دفعة مقدمة قدرها 20% من إجمالي قيمة الاتفاق كشرط لبدء العمل على المشروع. لا يبدأ مقدم الخدمة في التنفيذ إلا بعد تأكيد استلام هذه الدفعة.',
          isHighlighted: true,
        },
        {
          text: 'Milestone Installments: The remaining balance (80%) is divided across agreed execution phases, with 20% disbursed upon the completion of each major step or phase of the project through to final delivery.',
          textAr: 'دفعات المراحل (الدفعات المرحلية): يُقسم باقي المبلغ (80%) على مراحل التنفيذ المتفق عليها، حيث تُسدد دفعة بنسبة 20% مع إنجاز كل خطوة رئيسية أو مرحلة من المشروع وصولاً للتسليم النهائي.',
        },
        {
          text: 'Final Payment & Deliverable Handover: High-resolution rendered media, final master files, and open project source files shall not be delivered to the Client except after complete 100% settlement of the final installment and all outstanding financial balances.',
          textAr: 'الدفعة النهائية وتسليم العمل: لا يتم تسليم الملفات النهائية المفتوحة أو عالية الدقة أو المواد المنتجة للعميل إلا بعد سداد كامل الدفعة الأخيرة وباقي المستحقات المالية المتبقية بنسبة 100%.',
          isHighlighted: true,
        },
        {
          text: 'Transaction Currency: Financial transactions are conducted in local currency (Egyptian Pound - EGP) or its equivalent in US Dollars (USD) according to the official exchange rate agreed upon at the time of contracting.',
          textAr: 'العملة: تتم التعاملات المالية بالعملة المحلية (الجنيه المصري) أو ما يعادلها بالدولار الأمريكي وفقاً لسعر الصرف الرسمي المتفق عليه وقت التعاقد.',
        },
      ],
    },
    {
      id: 'clause-3',
      number: 'Clause 3',
      numberAr: 'البند الثالث',
      title: 'Execution Timeline & Contractual Grace Period',
      titleAr: 'الجدول الزمني للتنفيذ وفترة السماح',
      category: 'terms',
      summary: 'Realistic production calendar with an acknowledged 2-day technical grace period.',
      summaryAr: 'جدول زمني يراعي المتطلبات الفنية مع فترة سماح تعاقدية مدتها يومين بحد أقصى.',
      points: [
        {
          text: 'The project delivery timeline is subject to various technical and creative parameters, including workload volume, animation complexity, required tasks, and the Service Provider’s production availability.',
          textAr: 'يخضع الجدول الزمني لتسليم المشروع لعدة محددات فنية وإبداعية تشمل: حجم العمل، مدى تعقيده، والمهام (التاسكات) المطلوبة، والمواعيد المتاحة لدى مقدم الخدمة.',
        },
        {
          text: 'The Service Provider commits to providing an estimated timeline based on these parameters. Both parties acknowledge a contractual grace period of up to two (2) business days beyond the estimated delivery date, which shall not be considered a breach of contract.',
          textAr: 'يلتزم مقدم الخدمة بتقديم جدول زمني تقريبي للعميل بناءً على المعايير المذكورة. ويُقر الطرفان بوجود فترة سماح زمنية تقدر بيومين كحد أقصى زيادة عن الموعد التقريبي المحدد للتسليم، ولا يُعتبر ذلك تأخيراً مخالفاً لشروط العقد.',
          isHighlighted: true,
        },
        {
          text: 'The Service Provider reserves the right to extend the timeline commensurate with the scale of substantial additional modifications requested by the Client during the production phase.',
          textAr: 'يحق لمقدم الخدمة تمديد الجدول الزمني بما يتناسب مع حجم التعديلات الجوهرية الإضافية التي يطلبها العميل أثناء فترة الإنشاء.',
        },
      ],
    },
    {
      id: 'clause-4',
      number: 'Clause 4',
      numberAr: 'البند الرابع',
      title: 'Revision & Modification Policy',
      titleAr: 'سياسة التعديلات والمراجعات',
      category: 'terms',
      summary: 'Revisions included during draft phases; project closes upon final handover, with further edits billed separately.',
      summaryAr: 'تعديلات مشمولة أثناء مراحل الإنشاء وقبل التسليم؛ وإغلاق المشروع بعد التسليم النهائي.',
      points: [
        {
          text: 'The Client is entitled to request revisions during the active phases of creation and before the delivery of the final version of the project.',
          textAr: 'يحق للعميل طلب التعديلات خلال مراحل الإنشاء المختلفة وقبل تسليم النسخة النهائية للمشروع.',
        },
        {
          text: 'Once the Service Provider delivers the agreed final version, the project is officially deemed closed. The Client is not entitled to request complimentary modifications after this handover.',
          textAr: 'بمجرد تسليم مقدم الخدمة للنسخة النهائية المتفق عليها، يعتبر المشروع قد دخل في حالة الإغلاق، ولا يحق للعميل طلب أي تعديلات مجانية بعد هذا التسليم.',
          isHighlighted: true,
        },
        {
          text: 'Any subsequent modifications that the Client desires to implement on the finalized version are subject to additional service fees, determined by the scope of revisions and agreed upon in advance between both parties.',
          textAr: 'أي تعديلات يرغب العميل في إجرائها لاحقاً على النسخة النهائية التي تم إنشاؤها والاتفاق عليها، تخضع لرسوم مالية إضافية جديدة، وتُحدد بحسب حجم التعديل وبالاتفاق المسبق بين مقدم الخدمة والعميل.',
        },
      ],
    },
    {
      id: 'clause-5',
      number: 'Clause 5',
      numberAr: 'البند الخامس',
      title: 'Force Majeure & Emergency Circumstances (Timeline Pause)',
      titleAr: 'الظروف القهرية والقوة القاهرة (فترة توقف الجدول الزمني)',
      category: 'general',
      summary: 'Automatic timeline extension for unforeseen emergencies (accidents, health events, bereavement).',
      summaryAr: 'تعليق الجدول الزمني وتمديده تلقائياً في حال الطوارئ القاهرة مع الإخطار الفوري.',
      points: [
        {
          text: 'Neither party shall be deemed in breach of contract in the occurrence of extraordinary, unavoidable force majeure events beyond control (such as sudden traffic accidents, emergency health events, or bereavement of first-degree relatives).',
          textAr: 'لا يُعتبر أي من الطرفين مخالفاً للعقد في حال حدوث ظروف قهرية طارئة وخارجة عن الإرادة (مثل: حوادث السير المفاجئة، الحالات الصحية الطارئة، أو حالات الوفاة للأقارب من الدرجة الأولى).',
        },
        {
          text: 'Should the Service Provider encounter such circumstances, the project timeline is paused for the actual duration of the disruption, and the delivery date is automatically extended by an equivalent period.',
          textAr: 'في حال تعرض مقدم الخدمة لهذه الظروف، يتوقف احتساب الجدول الزمني للمشروع طوال فترة التعطل الفعلية، ويتم تمديد موعد التسليم تلقائياً بما يعادل فترة التوقف.',
          isHighlighted: true,
        },
        {
          text: 'The Service Provider undertakes to notify the Client of emergency conditions as promptly as practicable and submit available supporting records or official reports to substantiate the suspension period.',
          textAr: 'يلتزم مقدم الخدمة بإخطار العميل بالظروف الطارئة في أسرع وقت ممكن، وتقديم ما يثبت ذلك من مستندات أو تقارير أو إثباتات متاحة (سواء كانت صادرة من جهات رسمية أو جهات خارجية أخرى بحسب طبيعة الظرف)، ليتم اعتماد فترة التوقف.',
        },
      ],
    },
    {
      id: 'clause-6',
      number: 'Clause 6',
      numberAr: 'البند السادس',
      title: 'Communication Breakdown, Delays & Cancellation by Client',
      titleAr: 'انقطاع التواصل والتأخير والإلغاء من قِبل العميل',
      category: 'financial',
      summary: '1-week pause policy, 50% delay penalty after 2-3 weeks inactivity, and forfeiture upon cancellation.',
      summaryAr: 'تعليق العمل بعد أسبوع من الانقطاع، غرامة 50% بعد أسبوعين إلى 3 أسابيع، والاحتفاظ بالمبالغ عند الإلغاء.',
      points: [
        {
          text: 'Communication Breakdown (Within One Week): If the Client stops responding or providing feedback for one full week, the Service Provider reserves the right to suspend work, retain completed milestones, and hold all disbursed payments.',
          textAr: 'انقطاع التواصل (خلال أسبوع): في حال توقف العميل عن الرد أو تقديم الملاحظات لمدة أسبوع كامل، يحق لمقدم الخدمة تعليق العمل والاحتفاظ بما تم إنجازه مع الاحتفاظ بالمبالغ المسددة.',
        },
        {
          text: 'Resumption After Extended Delay (2 to 3 Weeks): If the Client returns after an absence ranging from 2 to 3 weeks to resume the project, the Service Provider reserves the right to impose a late fee of 50% of the total project value as a condition to resume work.',
          textAr: 'العودة بعد التأخير (بين أسبوعين إلى 3 أسابيع): إذا عاد العميل بعد فترة انقطاع تتراوح بين أسبوعين إلى 3 أسابيع لاستكمال المشروع، يحق لمقدم الخدمة فرض غرامة تأخير قدرها 50% من إجمالي قيمة المشروع كشرط لاستئناف العمل.',
          isHighlighted: true,
        },
        {
          text: 'Suspension or Refusal of Milestone Payments: If the Client refrains from paying due installments, the Service Provider is entitled to halt work completely and withhold all deliverables and project assets until full settlement.',
          textAr: 'توقف أو رفض الدفعات المالية: إذا امتنع العميل عن سداد الدفعات المستحقة، يحق لمقدم الخدمة وقف العمل تماماً وحجب كافة الملفات والمخرجات حتى تسدد كافة المستحقات بالكامل.',
        },
        {
          text: 'Cancellation or Refusal of Final Completion: If the Client cancels the agreement or refuses payment after elapsed periods, the Service Provider retains all project stages and advance payments; the Client possesses no right to claim refunds or project files.',
          textAr: 'ءاغلإا وأ ضفر الاستكمال النهائي: في حال قيام العميل بإلغاء التعاقد أو رفض دفع المستحقات بعد انتهاء المدة المتفق عليها، يحق لمقدم الخدمة الاحتفاظ بكافة المراحل وما تم إنجازه والمبالغ المسددة مسبقاً، ولا يحق للعميل المطالبة بأي مبالغ أو ملفات.',
          isHighlighted: true,
        },
      ],
    },
    {
      id: 'clause-7',
      number: 'Clause 7',
      numberAr: 'البند السابع',
      title: 'Service Provider Voluntary Interruption or Cancellation & Full Refund',
      titleAr: 'انقطاع أو اعتذار مقدم الخدمة والرد المالي الكامل',
      category: 'financial',
      summary: 'In the event of voluntary cancellation by provider without force majeure, 100% of all paid fees are refunded.',
      summaryAr: 'التزام كامل برد كافة المبالغ المستلمة من العميل في حال اعتذار مقدم الخدمة عن الإتمام دون قوة قاهرة.',
      points: [
        {
          text: 'Should the Service Provider (voluntarily and in the absence of force majeure) completely discontinue work or issue a final apology canceling completion after commencement, the Service Provider undertakes to refund all amounts paid by the Client in full (advance deposit and milestone payments).',
          textAr: 'في حال قيام مقدم الخدمة (من تلقاء نفسه ودون وجود ظروف قهرية) بالانقطاع التام عن العمل أو الاعتذار النهائي عن إتمام المشروع بعد بدايته، يلتزم مقدم الخدمة برد كافة المبالغ المالية المدفوعة من قِبل العميل بالكامل (العربون والدفعات المرحلية).',
          isHighlighted: true,
        },
        {
          text: 'In this circumstance (full refund to Client), the project is permanently terminated, the Service Provider is under no obligation to release incomplete designs, files, or drafts, and all financial liabilities are deemed fully discharged without further claims.',
          textAr: 'في هذه الحالة (رد المبالغ للعميل)، يتوقف المشروع نهائياً، ولا يُلزم مقدم الخدمة بتسليم أي تصاميم أو ملفات أو مراحل غير مكتملة للعميل، وتعتبر الذمم المالية مصفاة بين الطرفين دون أدنى مسؤولية إضافية.',
        },
      ],
    },
    {
      id: 'clause-8',
      number: 'Clause 8',
      numberAr: 'البند الثامن',
      title: 'Intellectual Property, Portfolio Display & Client Privacy',
      titleAr: 'حقوق الملكية الفكرية وعرض الأعمال وسياسة الخصوصية',
      category: 'ip',
      summary: 'IP rights transfer upon 100% payment; designer retains portfolio showcase rights while protecting client privacy.',
      summaryAr: 'انتقال الملكية الفكرية بعد سداد 100%، مع حق العرض في البورتفوليو مع الحفاظ الكامل على سرية بيانات العميل.',
      points: [
        {
          text: 'All intellectual and moral property rights for all designs and stages (whether completed or in progress) remain exclusively owned by the Service Provider and do not transfer to the Client until full 100% financial settlement of the project value.',
          textAr: 'تظل كافة حقوق الملكية الفكرية والأدبية لجميع التصاميم والمراحل (سواء المنجزة أو قيد التنفيذ) مملوكة حصرياً لمقدم الخدمة، ولا تنتقل إلى العميل إلا بعد سداد كامل القيمة المالية للمشروع بنسبة 100%.',
          isHighlighted: true,
        },
        {
          text: 'Upon project completion and final acceptance by the Client, the Service Provider is entitled to showcase the finalized creative works in their personal Portfolio and social media channels for marketing purposes, strictly conditioned upon safeguarding client data privacy, proprietary typography, and brand identity without harming commercial interests.',
          textAr: 'في حال إتمام المشروع واستلام العميل لعمله نهائياً، يحق لمقدم الخدمة استخدام الأعمال المنجزة وعرضها في معرض أعماله الشخصي (Portfolio) أو عبر منصات التواصل الاجتماعي للأغراض التسويقية، شريطة الحفاظ على خصوصية بيانات العميل وهويته والتايبوجرافيا الخاصة بالبراند بما لا يضر بمصلحة العميل التجارية.',
          isHighlighted: true,
        },
      ],
    },
    {
      id: 'clause-9',
      number: 'Clause 9',
      numberAr: 'البند التاسع',
      title: 'Applicable Law & Amicable Dispute Resolution',
      titleAr: 'القانون الواجب التطبيق وحل النزاعات',
      category: 'general',
      summary: 'Governed by general electronic contract principles, prioritizing good-faith amicable settlement.',
      summaryAr: 'الخضوع لمبادئ العقود الإلكترونية مع أولوية الحلول الودية واللجوء للجهات المختصة ومراكز التحكيم.',
      points: [
        {
          text: 'This agreement is subject to the general principles governing electronic contracts. In the event of any dispute, it shall first be resolved amicably through good-faith negotiation between the parties.',
          textAr: 'يخضع هذا العقد للمبادئ العامة للعقود الإلكترونية، وفي حال نشوء أي نزاع - لا قدر الله - يتم حله بالطرق الودية بين الطرفين أولاً.',
        },
        {
          text: 'If amicable resolution proves unachievable, recourse shall be made to competent judicial authorities in the Service Provider’s place of residence or through certified electronic commercial arbitration mechanisms.',
          textAr: 'إذا تعذر الحل الودي، فيكون اللجوء للجهات القضائية المختصة وفقاً لمكان إقامة مقدم الخدمة أو عبر آليات التحكيم الإلكتروني المعتمدة.',
        },
      ],
    },
    {
      id: 'clause-10',
      number: 'Clause 10',
      numberAr: 'البند العاشر',
      title: 'Contract Copies & Legally Binding Electronic Acceptance',
      titleAr: 'نسخ العقد والقبول الإلكتروني الملزم',
      category: 'general',
      summary: 'Electronic acceptance via WhatsApp, LinkedIn, email, or deposit payment serves as legal signature.',
      summaryAr: 'القبول عبر القنوات الرسمية أو سداد الدفعة المقدمة يُعد توقيعاً إلكترونياً ملزماً قانوناً للطرفين.',
      points: [
        {
          text: 'This contract was drafted electronically. Mutual agreement to its terms via approved official communications (such as WhatsApp, LinkedIn, or Email) or the Client’s payment of the advance deposit constitutes a legally binding electronic signature for both parties.',
          textAr: 'حُرر هذا العقد إلكترونياً، ويُعد قبول الطرفين لشروطه عبر المراسلات الرسمية عبر تطبيقات التواصل الاجتماعي المعتمدة (مثل واتساب ولينكد إن) أو البريد الإلكتروني، أو قيام العميل بسداد الدفعة المقدمة بمثابة توقيع إلكتروني ملزم قانوناً لكليهما.',
          isHighlighted: true,
        },
      ],
    },
  ],
};
