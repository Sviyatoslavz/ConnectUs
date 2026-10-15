import type { AssistantModule } from './assistant-modules';
import type { Lang, CourseId } from './learn-content';

type ExperienceCopy = {
  assistantIntro: string; choose: string; explore: string; why: string; takeAway: string;
  moduleNotes: Record<AssistantModule, string>;
  dailyIntro: string; dailyLead: string; dailyNote: string; start: string; courseIntro: Record<CourseId, string>;
  tipNote: string; wordNote: string; quizNote: string; newsNote: string;
  lessonLead: string; phrasesIntro: string; say: string; translation: string; reveal: string; hide: string;
  when: string; copy: string; copied: string; copyFailed: string; practiceNote: string; tipsNote: string; quizLead: string;
};

export const experienceCopy: Record<Lang, ExperienceCopy> = {
  UK: {
    assistantIntro: 'Не знаєте, з чого почати? Розкладемо складну ситуацію на зрозумілі кроки — від оренди до документів.',
    choose: 'Що зараз важливо для вас?', explore: 'Розібратися', why: 'Чому це важливо', takeAway: 'Візьміть із собою',
    moduleNotes: {
      wohnen: 'Одна незрозуміла умова в договорі може вплинути на ваші витрати. Уточніть її до підписання.',
      familie: 'Садок, школа й виплати — різні питання. Почніть з того, що потрібно дитині саме зараз.',
      arbeit: 'Ваш досвід уже має цінність. Перший крок — зрозуміло розповісти про нього німецькою.',
      geld: 'Bescheid і Mahnung — не одне й те саме. Спочатку з’ясуйте, що саме від вас хочуть.',
      aufenthalt: 'Порада знайомого не замінює вимоги у вашому листі. Перевірте свій документ і наступну дію.',
    },
    dailyIntro: 'Сьогодні — одна корисна думка, одна німецька фраза і трохи більше впевненості у звичайних справах.',
    dailyLead: 'Не все одразу. Один крок сьогодні.', dailyNote: 'Виберіть урок під свою найближчу справу. Корисніше запам’ятати одну потрібну фразу, ніж прочитати десять навмання.',
    start: 'Почати урок', courseIntro: { 'deutsch-amt': 'Не ідеальна граматика, а слова, які виручать на прийомі. Записатися, уточнити, перепитати — потренуйте свою наступну розмову.', verhalten: 'Що взяти, як звернутися й коли попросити допомогу. Маленькі звички, з якими в установах спокійніше.' },
    tipNote: 'Приміряйте пораду до своєї ситуації: що з цього можна зробити вже сьогодні?', wordNote: 'Помітите це слово в листі — згадайте не лише переклад, а й контекст.',
    quizNote: 'Помилка тут — можливість розібратися без поспіху, ще до справжнього прийому.', newsNote: 'Заголовок — не рішення у вашій справі. Перевірте дату, умови та повний текст джерела.',
    lessonLead: 'Ваша наступна розмова починається тут', phrasesIntro: 'Скажіть фразу вголос. Потім перевірте, чи пам’ятаєте її зміст.', say: 'Скажіть німецькою', translation: 'Зміст українською', reveal: 'Показати переклад', hide: 'Сховати переклад', when: 'Коли стане в пригоді', copy: 'Копіювати фразу', copied: 'Фразу скопійовано', copyFailed: 'Не вдалося скопіювати. Виділіть фразу вручну.',
    practiceNote: 'Не потрібно говорити без помилок. Важливіше назвати свою мету й уточнити те, чого не зрозуміли.', tipsNote: 'Оберіть одну пораду, яку застосуєте під час наступного звернення.', quizLead: 'Перевірте себе перед справжньою розмовою',
  },
  RU: {
    assistantIntro: 'Не знаете, с чего начать? Разложим сложную ситуацию на понятные шаги — от аренды до документов.',
    choose: 'Что сейчас важно для вас?', explore: 'Разобраться', why: 'Почему это важно', takeAway: 'Возьмите с собой',
    moduleNotes: {
      wohnen: 'Одно непонятное условие в договоре может повлиять на ваши расходы. Уточните его до подписания.',
      familie: 'Садик, школа и выплаты — разные вопросы. Начните с того, что нужно ребёнку прямо сейчас.',
      arbeit: 'Ваш опыт уже имеет ценность. Первый шаг — понятно рассказать о нём по-немецки.',
      geld: 'Bescheid и Mahnung — не одно и то же. Сначала выясните, чего именно от вас хотят.',
      aufenthalt: 'Совет знакомого не заменяет требования в вашем письме. Проверьте свой документ и следующее действие.',
    },
    dailyIntro: 'Сегодня — одна полезная мысль, одна немецкая фраза и чуть больше уверенности в обычных делах.',
    dailyLead: 'Не всё сразу. Один шаг сегодня.', dailyNote: 'Выберите урок под своё ближайшее дело. Полезнее запомнить одну нужную фразу, чем прочитать десять наугад.',
    start: 'Начать урок', courseIntro: { 'deutsch-amt': 'Не идеальная грамматика, а слова, которые выручат на приёме. Записаться, уточнить, переспросить — потренируйте свой следующий разговор.', verhalten: 'Что взять, как обратиться и когда попросить помощь. Маленькие привычки, с которыми в учреждениях спокойнее.' },
    tipNote: 'Примерьте совет к своей ситуации: что из этого можно сделать уже сегодня?', wordNote: 'Встретите это слово в письме — вспомните не только перевод, но и контекст.',
    quizNote: 'Ошибка здесь — возможность разобраться без спешки, ещё до настоящего приёма.', newsNote: 'Заголовок — не решение по вашему делу. Проверьте дату, условия и полный текст источника.',
    lessonLead: 'Ваш следующий разговор начинается здесь', phrasesIntro: 'Произнесите фразу вслух. Затем проверьте, помните ли вы её смысл.', say: 'Скажите по-немецки', translation: 'Смысл по-русски', reveal: 'Показать перевод', hide: 'Скрыть перевод', when: 'Когда пригодится', copy: 'Копировать фразу', copied: 'Фраза скопирована', copyFailed: 'Не удалось скопировать. Выделите фразу вручную.',
    practiceNote: 'Не нужно говорить без ошибок. Важнее назвать свою цель и уточнить то, чего не поняли.', tipsNote: 'Выберите один совет, который примените при следующем обращении.', quizLead: 'Проверьте себя перед настоящим разговором',
  },
  DE: {
    assistantIntro: 'Sie wissen nicht, wo Sie anfangen sollen? Wir machen aus einer schwierigen Situation verständliche Schritte — von der Miete bis zu Ihren Unterlagen.',
    choose: 'Was ist Ihnen gerade wichtig?', explore: 'Klarheit finden', why: 'Warum das wichtig ist', takeAway: 'Für Ihren Alltag',
    moduleNotes: {
      wohnen: 'Eine unklare Vertragsklausel kann Ihre Kosten beeinflussen. Klären Sie sie vor der Unterschrift.',
      familie: 'Kita, Schule und Leistungen sind verschiedene Anliegen. Beginnen Sie mit dem, was Ihr Kind jetzt braucht.',
      arbeit: 'Ihre Erfahrung ist wertvoll. Der erste Schritt: verständlich auf Deutsch davon erzählen.',
      geld: 'Bescheid und Mahnung sind nicht dasselbe. Klären Sie zuerst, was genau von Ihnen verlangt wird.',
      aufenthalt: 'Ein Rat von Bekannten ersetzt nicht die Anforderungen in Ihrem Schreiben. Prüfen Sie Ihr Dokument und den nächsten Schritt.',
    },
    dailyIntro: 'Heute ein hilfreicher Gedanke, ein deutscher Satz und etwas mehr Sicherheit im Alltag.',
    dailyLead: 'Nicht alles auf einmal. Heute ein Schritt.', dailyNote: 'Wählen Sie eine Lektion für Ihr nächstes Anliegen. Ein passender Satz bleibt eher im Kopf als zehn zufällige.',
    start: 'Lektion starten', courseIntro: { 'deutsch-amt': 'Keine perfekte Grammatik, sondern Sätze für Ihren Termin. Vereinbaren, klären, nachfragen — üben Sie Ihr nächstes Gespräch.', verhalten: 'Was mitnehmen, wie ansprechen und wann Hilfe erfragen? Kleine Gewohnheiten für ruhigere Behördengänge.' },
    tipNote: 'Übertragen Sie den Tipp auf Ihre Situation: Was können Sie heute davon umsetzen?', wordNote: 'Wenn Ihnen dieses Wort in einem Brief begegnet, denken Sie auch an den Zusammenhang.',
    quizNote: 'Ein Fehler hier ist eine Gelegenheit, in Ruhe zu lernen — vor dem echten Termin.', newsNote: 'Eine Überschrift entscheidet nicht über Ihren Fall. Prüfen Sie Datum, Bedingungen und die vollständige Quelle.',
    lessonLead: 'Ihr nächstes Gespräch beginnt hier', phrasesIntro: 'Sprechen Sie den Satz laut aus. Prüfen Sie anschließend, ob Sie seine Bedeutung kennen.', say: 'So sagen Sie es', translation: 'Bedeutung', reveal: 'Bedeutung anzeigen', hide: 'Bedeutung ausblenden', when: 'Wann das hilft', copy: 'Satz kopieren', copied: 'Satz kopiert', copyFailed: 'Kopieren nicht möglich. Markieren Sie den Satz manuell.',
    practiceNote: 'Sie müssen nicht fehlerfrei sprechen. Nennen Sie Ihr Anliegen und fragen Sie bei Unklarheiten nach.', tipsNote: 'Wählen Sie einen Tipp für Ihren nächsten Kontakt mit der Behörde.', quizLead: 'Testen Sie sich vor dem echten Gespräch',
  },
};
