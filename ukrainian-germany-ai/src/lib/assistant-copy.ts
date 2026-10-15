import type { AssistantModule } from "@/lib/assistant-modules";

type ModuleCopy = { title: string; desc: string; quick: [string, string, string, string] };
type Copy = {
  nav: string; title: string; subtitle: string; disclaimer: string; letterHint: string; letterLink: string;
  placeholder: string; ask: string; asking: string; signIn: string; newChat: string; copy: string; copied: string;
  short: string; meaning: string; steps: string; deadline: string; needed: string; important: string; next: string; source: string; germanText: string; question: string;
  needsHuman: string; errLimit: string; errFailed: string; errTooLong: string; you: string;
  modules: Record<AssistantModule, ModuleCopy>;
  tr: { card: string; desc: string; paste: string; target: string; go: string; terms: string; result: string; notes: string; analyze: string };
};

export const assistantCopy: Record<"UK" | "RU" | "DE", Copy> = {
  UK: {
    tr: { card: "Переклад листа — без здогадок", desc: "Спочатку зрозуміємо, що написано. Незнайомі німецькі терміни поясню окремо.", paste: "Вставте текст листа німецькою", target: "Мова перекладу", go: "Перекласти", terms: "Німецькі терміни", result: "Переклад", notes: "Зверніть увагу", analyze: "Розібрати цей лист: строк, ризик, що робити" },
    nav: "Помічник", title: "Помічник", subtitle: "Оберіть тему — поясню по-людськи і підкажу наступний крок.",
    disclaimer: "Інформаційна допомога, не юридична консультація.",
    letterHint: "Для листа завантажте його в розбір.", letterLink: "На головну",
    placeholder: "Опишіть ситуацію або запитайте…", ask: "Знайти наступний крок", asking: "Думаю…", signIn: "Увійдіть, щоб поставити питання", newChat: "Нова розмова", copy: "Копіювати", copied: "Скопійовано", you: "Ви",
    short: "Коротко", meaning: "Що це означає", steps: "Що робити", deadline: "Строк", needed: "Що знадобиться", important: "Важливо", next: "Наступний крок", source: "Офіційне джерело", germanText: "Готовий текст німецькою", question: "Уточнення",
    needsHuman: "Ця ситуація може потребувати індивідуальної юридичної оцінки. Я можу допомогти підготувати документи та питання для фахівця.",
    errLimit: "На сьогодні вичерпано 30 питань помічнику. Спробуйте завтра.", errFailed: "Не вдалося отримати відповідь. Питання не списано — спробуйте ще раз.", errTooLong: "Питання задовге (до 1500 символів).",
    modules: {
      wohnen: { title: "Житло", desc: "Зрозумійте договір і підготуйтеся до реєстрації", quick: ["Допоможіть зрозуміти мій Mietvertrag", "Що потрібно для Anmeldung?", "Що таке Wohnungsgeberbestätigung і де її взяти?", "Я отримав лист від Vermieter — що робити?"] },
      familie: { title: "Діти й сім'я", desc: "Знайдіть перший крок для садочка, школи й виплат", quick: ["Як отримати Kindergeld через Familienkasse?", "Як знайти Kita-Platz?", "Як записати дитину до школи (Schulanmeldung)?", "Що таке Elterngeld і хто може його отримати?"] },
      arbeit: { title: "Робота", desc: "Розкажіть про свій досвід і підготуйте резюме", quick: ["Як називається моя професія німецькою?", "Допоможіть скласти Lebenslauf", "Допоможіть написати Anschreiben для Bewerbung", "Як підготуватися до співбесіди?"] },
      geld: { title: "Гроші й виплати", desc: "З’ясуйте, що означає рішення або вимога оплати", quick: ["Що таке Bürgergeld і Jobcenter?", "Як зрозуміти Bescheid?", "Що робити з Mahnung?", "Що таке Arbeitslosengeld?"] },
      aufenthalt: { title: "Перебування і статус", desc: "Уточніть питання про статус, запис і документи", quick: ["Як продовжити Aufenthaltstitel?", "Як записатися на Termin в Ausländerbehörde?", "Які документи зазвичай потрібні?", "Питання щодо §24"] },
    },
  },
  RU: {
    tr: { card: "Перевод письма — без догадок", desc: "Сначала поймём, что написано. Незнакомые немецкие термины объясню отдельно.", paste: "Вставьте текст письма на немецком", target: "Язык перевода", go: "Перевести", terms: "Немецкие термины", result: "Перевод", notes: "Обратите внимание", analyze: "Разобрать это письмо: срок, риск, что делать" },
    nav: "Помощник", title: "Помощник", subtitle: "Выберите тему — объясню по-человечески и подскажу следующий шаг.",
    disclaimer: "Информационная помощь, не юридическая консультация.",
    letterHint: "Для письма загрузите его в разбор.", letterLink: "На главную",
    placeholder: "Опишите ситуацию или спросите…", ask: "Найти следующий шаг", asking: "Думаю…", signIn: "Войдите, чтобы задать вопрос", newChat: "Новый разговор", copy: "Копировать", copied: "Скопировано", you: "Вы",
    short: "Коротко", meaning: "Что это значит", steps: "Что делать", deadline: "Срок", needed: "Что понадобится", important: "Важно", next: "Следующий шаг", source: "Официальный источник", germanText: "Готовый текст на немецком", question: "Уточнение",
    needsHuman: "Эта ситуация может требовать индивидуальной юридической оценки. Я могу помочь подготовить документы и вопросы для специалиста.",
    errLimit: "На сегодня исчерпано 30 вопросов помощнику. Попробуйте завтра.", errFailed: "Не удалось получить ответ. Вопрос не списан — попробуйте ещё раз.", errTooLong: "Вопрос слишком длинный (до 1500 символов).",
    modules: {
      wohnen: { title: "Жильё", desc: "Поймите договор и подготовьтесь к регистрации", quick: ["Помогите понять мой Mietvertrag", "Что нужно для Anmeldung?", "Что такое Wohnungsgeberbestätigung и где её взять?", "Я получил письмо от Vermieter — что делать?"] },
      familie: { title: "Дети и семья", desc: "Найдите первый шаг для садика, школы и выплат", quick: ["Как получить Kindergeld через Familienkasse?", "Как найти Kita-Platz?", "Как записать ребёнка в школу (Schulanmeldung)?", "Что такое Elterngeld и кто может его получить?"] },
      arbeit: { title: "Работа", desc: "Расскажите о своём опыте и подготовьте резюме", quick: ["Как называется моя профессия на немецком?", "Помогите составить Lebenslauf", "Помогите написать Anschreiben для Bewerbung", "Как подготовиться к собеседованию?"] },
      geld: { title: "Деньги и выплаты", desc: "Выясните, что означает решение или требование оплаты", quick: ["Что такое Bürgergeld и Jobcenter?", "Как понять Bescheid?", "Что делать с Mahnung?", "Что такое Arbeitslosengeld?"] },
      aufenthalt: { title: "Пребывание и статус", desc: "Уточните вопросы о статусе, записи и документах", quick: ["Как продлить Aufenthaltstitel?", "Как записаться на Termin в Ausländerbehörde?", "Какие документы обычно нужны?", "Вопросы по §24"] },
    },
  },
  DE: {
    tr: { card: "Den Brief wirklich verstehen", desc: "Erst klären wir, was im Brief steht. Unbekannte Fachbegriffe erkläre ich gesondert.", paste: "Brieftext einfügen", target: "Zielsprache", go: "Übersetzen", terms: "Deutsche Fachbegriffe", result: "Übersetzung", notes: "Hinweis", analyze: "Diesen Brief analysieren: Frist, Risiko, nächste Schritte" },
    nav: "Assistent", title: "Assistent", subtitle: "Wählen Sie ein Thema — ich erkläre es verständlich und nenne den nächsten Schritt.",
    disclaimer: "Informationshilfe, keine Rechtsberatung.",
    letterHint: "Für einen Brief laden Sie ihn in die Analyse hoch.", letterLink: "Zur Startseite",
    placeholder: "Beschreiben Sie Ihre Situation oder fragen Sie…", ask: "Nächsten Schritt finden", asking: "Einen Moment…", signIn: "Melden Sie sich an, um eine Frage zu stellen", newChat: "Neues Gespräch", copy: "Kopieren", copied: "Kopiert", you: "Sie",
    short: "Kurz", meaning: "Was das bedeutet", steps: "Was zu tun ist", deadline: "Frist", needed: "Was Sie brauchen", important: "Wichtig", next: "Nächster Schritt", source: "Offizielle Quelle", germanText: "Fertiger Text auf Deutsch", question: "Rückfrage",
    needsHuman: "Diese Situation kann eine individuelle rechtliche Prüfung erfordern. Ich kann helfen, Unterlagen und Fragen für eine Fachperson vorzubereiten.",
    errLimit: "Das Tageslimit von 30 Fragen ist erreicht. Bitte versuchen Sie es morgen.", errFailed: "Keine Antwort erhalten. Die Frage wurde nicht gezählt — bitte erneut versuchen.", errTooLong: "Frage zu lang (bis 1500 Zeichen).",
    modules: {
      wohnen: { title: "Wohnen", desc: "Mietvertrag verstehen und Anmeldung vorbereiten", quick: ["Hilfe beim Verstehen meines Mietvertrags", "Was brauche ich für die Anmeldung?", "Was ist eine Wohnungsgeberbestätigung und wo bekomme ich sie?", "Ich habe einen Brief vom Vermieter — was tun?"] },
      familie: { title: "Kinder & Familie", desc: "Erste Schritte für Kita, Schule und Leistungen finden", quick: ["Wie beantrage ich Kindergeld bei der Familienkasse?", "Wie finde ich einen Kita-Platz?", "Wie funktioniert die Schulanmeldung?", "Was ist Elterngeld und wer bekommt es?"] },
      arbeit: { title: "Arbeit", desc: "Erfahrung beschreiben und Bewerbung vorbereiten", quick: ["Wie heißt mein Beruf auf Deutsch?", "Hilfe beim Lebenslauf", "Hilfe beim Anschreiben für eine Bewerbung", "Wie bereite ich mich auf ein Vorstellungsgespräch vor?"] },
      geld: { title: "Geld & Leistungen", desc: "Bescheide und Zahlungsaufforderungen verstehen", quick: ["Was sind Bürgergeld und Jobcenter?", "Wie verstehe ich einen Bescheid?", "Was tun bei einer Mahnung?", "Was ist Arbeitslosengeld?"] },
      aufenthalt: { title: "Aufenthalt & Status", desc: "Fragen zu Status, Terminen und Unterlagen klären", quick: ["Wie verlängere ich meinen Aufenthaltstitel?", "Wie bekomme ich einen Termin bei der Ausländerbehörde?", "Welche Unterlagen werden meist gebraucht?", "Fragen zu §24"] },
    },
  },
};
