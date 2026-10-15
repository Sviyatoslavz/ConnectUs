import type { AssistantModule } from "@/lib/assistant-modules";

type L = "UK" | "RU" | "DE";
type T = Record<L, string>;
type Section = { h: T; items: Record<L, string[]> };
export type Guide = { slug: string; module: AssistantModule | null; photo?: string; title: T; intro: T; sections: Section[]; source: string };

/** Draft overview pages — general information only, verified against official sources by a specialist before launch. */
export const GUIDE_DRAFT_NOTE: T = {
  UK: "Чернетка: загальна інформація, не юридична консультація. Правила змінюються — перевіряйте актуальність в офіційному джерелі або у фахівця.",
  RU: "Черновик: общая информация, не юридическая консультация. Правила меняются — проверяйте актуальность в официальном источнике или у специалиста.",
  DE: "Entwurf: allgemeine Information, keine Rechtsberatung. Regeln ändern sich — prüfen Sie den aktuellen Stand bei der offiziellen Quelle oder einer Fachperson.",
};

export const GUIDES: Guide[] = [
  {
    slug: "paragraph-24", module: "aufenthalt", photo: "government",
    title: { UK: "§24 AufenthG — тимчасовий захист", RU: "§24 AufenthG — временная защита", DE: "§24 AufenthG — vorübergehender Schutz" },
    intro: {
      UK: "§24 Aufenthaltsgesetz (закон про перебування) — підстава для дозволу на перебування людям, які отримали тимчасовий захист ЄС. Для біженців з України він застосовується з 2022 року.",
      RU: "§24 Aufenthaltsgesetz (закон о пребывании) — основание для вида на пребывание людям с временной защитой ЕС. Для беженцев из Украины применяется с 2022 года.",
      DE: "§24 Aufenthaltsgesetz ist die Grundlage für eine Aufenthaltserlaubnis bei vorübergehendem Schutz nach EU-Recht. Für Geflüchtete aus der Ukraine wird er seit 2022 angewendet.",
    },
    sections: [
      { h: { UK: "Що це дає", RU: "Что это даёт", DE: "Was er ermöglicht" }, items: {
        UK: ["Aufenthaltserlaubnis (дозвіл на перебування) на строк дії тимчасового захисту ЄС", "Дозвіл на роботу — запис «Erwerbstätigkeit erlaubt» у документі", "Доступ до інтеграційних і мовних курсів"],
        RU: ["Aufenthaltserlaubnis (вид на пребывание) на срок действия временной защиты ЕС", "Разрешение на работу — запись «Erwerbstätigkeit erlaubt» в документе", "Доступ к интеграционным и языковым курсам"],
        DE: ["Aufenthaltserlaubnis für die Dauer des EU-Schutzes", "Erwerbstätigkeit — Eintrag „Erwerbstätigkeit erlaubt“", "Zugang zu Integrations- und Sprachkursen"] } },
      { h: { UK: "Що перевірити", RU: "Что проверить", DE: "Was Sie prüfen sollten" }, items: {
        UK: ["До якої дати дійсний ваш документ і чи діє автоматичне продовження", "Які виплати вам належать — це залежить від дати прибуття та чинних правил", "Чи є обмеження місця проживання (Wohnsitzauflage)"],
        RU: ["До какой даты действует ваш документ и действует ли автоматическое продление", "Какие выплаты положены — это зависит от даты прибытия и действующих правил", "Есть ли ограничение места жительства (Wohnsitzauflage)"],
        DE: ["Gültigkeit Ihres Dokuments und ob eine automatische Verlängerung gilt", "Welche Leistungen gelten — abhängig von Einreisedatum und aktueller Rechtslage", "Ob eine Wohnsitzauflage besteht"] } },
    ],
    source: "https://www.germany4ukraine.de",
  },
  {
    slug: "auslaenderbehoerde", module: "aufenthalt", photo: "counter",
    title: { UK: "Як звернутися до Ausländerbehörde", RU: "Как обратиться в Ausländerbehörde", DE: "So wenden Sie sich an die Ausländerbehörde" },
    intro: {
      UK: "Ausländerbehörde — міграційна служба вашого міста чи району. Вона видає й продовжує дозволи на перебування.",
      RU: "Ausländerbehörde — миграционная служба вашего города или района. Она выдаёт и продлевает виды на пребывание.",
      DE: "Die Ausländerbehörde Ihrer Stadt oder Ihres Kreises erteilt und verlängert Aufenthaltstitel.",
    },
    sections: [
      { h: { UK: "Крок за кроком", RU: "Шаг за шагом", DE: "Schritt für Schritt" }, items: {
        UK: ["Знайдіть свою Ausländerbehörde за місцем реєстрації (сайт міста/району)", "Запишіться на Termin — онлайн, email або телефоном, як вказано на сайті", "Звертайтеся заздалегідь, до закінчення строку документа", "Підготуйте документи за списком відомства (див. «Документи: перебування»)", "Прийдіть вчасно з оригіналами та копіями", "Якщо рішення ще не готове, запитайте про Fiktionsbescheinigung (тимчасове підтвердження)", "Отримайте eAT (електронну картку) після виготовлення"],
        RU: ["Найдите свою Ausländerbehörde по месту регистрации (сайт города/района)", "Запишитесь на Termin — онлайн, email или по телефону, как указано на сайте", "Обращайтесь заранее, до окончания срока документа", "Подготовьте документы по списку ведомства (см. «Документы: пребывание»)", "Приходите вовремя с оригиналами и копиями", "Если решение ещё не готово, спросите о Fiktionsbescheinigung (временное подтверждение)", "Получите eAT (электронную карту) после изготовления"],
        DE: ["Zuständige Ausländerbehörde nach Wohnort finden (Website der Stadt/des Kreises)", "Termin buchen — online, per E-Mail oder Telefon wie angegeben", "Rechtzeitig vor Ablauf des Dokuments melden", "Unterlagen nach Liste der Behörde vorbereiten", "Pünktlich mit Originalen und Kopien erscheinen", "Bei offener Entscheidung nach einer Fiktionsbescheinigung fragen", "eAT-Karte nach Fertigstellung abholen"] } },
    ],
    source: "https://www.bamf.de",
  },
  {
    slug: "docs-wohnen", module: "wohnen",
    title: { UK: "Документи: житло", RU: "Документы: жильё", DE: "Unterlagen: Wohnen" },
    intro: { UK: "Для Anmeldung (реєстрації за адресою) у Bürgeramt.", RU: "Для Anmeldung (регистрации по адресу) в Bürgeramt.", DE: "Für die Anmeldung beim Bürgeramt." },
    sections: [{ h: { UK: "Зазвичай потрібно", RU: "Обычно нужно", DE: "Meist erforderlich" }, items: {
      UK: ["Паспорт або посвідчення особи", "Wohnungsgeberbestätigung — підтвердження від орендодавця", "Anmeldeformular (бланк реєстрації)", "Документ про перебування, якщо є"],
      RU: ["Паспорт или удостоверение личности", "Wohnungsgeberbestätigung — подтверждение от арендодателя", "Anmeldeformular (бланк регистрации)", "Документ о пребывании, если есть"],
      DE: ["Reisepass oder Ausweis", "Wohnungsgeberbestätigung", "Anmeldeformular", "Aufenthaltsdokument, falls vorhanden"] } }],
    source: "https://www.germany4ukraine.de",
  },
  {
    slug: "docs-familie", module: "familie", photo: "classroom",
    title: { UK: "Документи: діти й сім'я", RU: "Документы: дети и семья", DE: "Unterlagen: Kinder & Familie" },
    intro: { UK: "Для заяви на Kindergeld у Familienkasse.", RU: "Для заявления на Kindergeld в Familienkasse.", DE: "Für den Kindergeld-Antrag bei der Familienkasse." },
    sections: [{ h: { UK: "Зазвичай потрібно", RU: "Обычно нужно", DE: "Meist erforderlich" }, items: {
      UK: ["Заява на Kindergeld і додаток на кожну дитину (бланки Familienkasse)", "Steuer-ID (податковий номер) батька/матері та дитини", "Свідоцтво про народження дитини", "Документи про перебування", "Meldebescheinigung (довідка про реєстрацію)"],
      RU: ["Заявление на Kindergeld и приложение на каждого ребёнка (бланки Familienkasse)", "Steuer-ID (налоговый номер) родителя и ребёнка", "Свидетельство о рождении ребёнка", "Документы о пребывании", "Meldebescheinigung (справка о регистрации)"],
      DE: ["Kindergeld-Antrag und Anlage Kind (Formulare der Familienkasse)", "Steuer-ID von Elternteil und Kind", "Geburtsurkunde des Kindes", "Aufenthaltsdokumente", "Meldebescheinigung"] } }],
    source: "https://www.arbeitsagentur.de",
  },
  {
    slug: "docs-arbeit", module: "arbeit", photo: "office",
    title: { UK: "Документи: робота", RU: "Документы: работа", DE: "Unterlagen: Arbeit" },
    intro: { UK: "Для пошуку роботи та Bewerbung.", RU: "Для поиска работы и Bewerbung.", DE: "Für Jobsuche und Bewerbung." },
    sections: [{ h: { UK: "Зазвичай потрібно", RU: "Обычно нужно", DE: "Meist erforderlich" }, items: {
      UK: ["Lebenslauf (резюме) німецькою", "Anschreiben (супровідний лист)", "Дипломи й атестати з перекладом", "Arbeitszeugnisse (відгуки з роботи), якщо є", "Документ про перебування з дозволом на роботу", "За потреби — визнання кваліфікації (Anerkennung)"],
      RU: ["Lebenslauf (резюме) на немецком", "Anschreiben (сопроводительное письмо)", "Дипломы и аттестаты с переводом", "Arbeitszeugnisse (отзывы с работы), если есть", "Документ о пребывании с разрешением на работу", "При необходимости — признание квалификации (Anerkennung)"],
      DE: ["Lebenslauf", "Anschreiben", "Zeugnisse und Diplome mit Übersetzung", "Arbeitszeugnisse, falls vorhanden", "Aufenthaltsdokument mit Arbeitserlaubnis", "Ggf. Anerkennung der Qualifikation"] } }],
    source: "https://www.make-it-in-germany.com",
  },
  {
    slug: "docs-geld", module: "geld", photo: "appointment",
    title: { UK: "Документи: гроші й виплати", RU: "Документы: деньги и выплаты", DE: "Unterlagen: Geld & Leistungen" },
    intro: { UK: "Для заяви на Bürgergeld у Jobcenter. Точний список дає ваш Jobcenter.", RU: "Для заявления на Bürgergeld в Jobcenter. Точный список даёт ваш Jobcenter.", DE: "Für den Bürgergeld-Antrag. Die genaue Liste nennt Ihr Jobcenter." },
    sections: [{ h: { UK: "Зазвичай потрібно", RU: "Обычно нужно", DE: "Meist erforderlich" }, items: {
      UK: ["Паспорт і документ про перебування", "Meldebescheinigung", "Mietvertrag (договір оренди) і дані про витрати на житло", "Виписки з банківського рахунку", "Підтвердження доходів, якщо є"],
      RU: ["Паспорт и документ о пребывании", "Meldebescheinigung", "Mietvertrag (договор аренды) и данные о расходах на жильё", "Выписки с банковского счёта", "Подтверждение доходов, если есть"],
      DE: ["Pass und Aufenthaltsdokument", "Meldebescheinigung", "Mietvertrag und Wohnkosten", "Kontoauszüge", "Einkommensnachweise, falls vorhanden"] } }],
    source: "https://www.arbeitsagentur.de",
  },
  {
    slug: "docs-aufenthalt", module: "aufenthalt", photo: "station",
    title: { UK: "Документи: перебування", RU: "Документы: пребывание", DE: "Unterlagen: Aufenthalt" },
    intro: { UK: "Для продовження Aufenthaltstitel. Остаточний список — на сайті вашої Ausländerbehörde.", RU: "Для продления Aufenthaltstitel. Окончательный список — на сайте вашей Ausländerbehörde.", DE: "Zur Verlängerung des Aufenthaltstitels. Die verbindliche Liste steht bei Ihrer Ausländerbehörde." },
    sections: [{ h: { UK: "Зазвичай потрібно", RU: "Обычно нужно", DE: "Meist erforderlich" }, items: {
      UK: ["Дійсний паспорт", "Біометричне фото", "Поточний дозвіл або Fiktionsbescheinigung", "Meldebescheinigung", "Заповнена заява відомства", "Підтвердження доходу або виплат, якщо просять"],
      RU: ["Действующий паспорт", "Биометрическое фото", "Текущий вид на пребывание или Fiktionsbescheinigung", "Meldebescheinigung", "Заполненное заявление ведомства", "Подтверждение дохода или выплат, если просят"],
      DE: ["Gültiger Reisepass", "Biometrisches Foto", "Aktueller Titel oder Fiktionsbescheinigung", "Meldebescheinigung", "Ausgefüllter Antrag der Behörde", "Einkommens- oder Leistungsnachweise, falls verlangt"] } }],
    source: "https://www.bamf.de",
  },
];

export const findGuide = (slug: string) => GUIDES.find(g => g.slug === slug);
