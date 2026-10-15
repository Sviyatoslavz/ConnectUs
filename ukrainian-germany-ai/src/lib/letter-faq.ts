import { FREE_ANALYSES } from "@/lib/billing";
import { ASSISTANT_DAILY_LIMIT } from "@/lib/assistant-modules";

type FaqSection = { title: string; items: { q: string; a: string }[] };

export const letterFaq: Record<"UK" | "RU" | "DE", FaqSection[]> = {
  UK: [
    { title: "Фото й розбір листа", items: [
      { q: "Як додати лист і кілька сторінок?", a: "На головній сфотографуйте лист або завантажте PDF чи фото. Можна вибрати кілька фото або додати ще сторінку — до 5 сторінок. Для файлу діє обмеження 20 МБ. Знімайте рівно, щоб увесь текст було видно, а потім натисніть «Розібрати лист»." },
      { q: "Що я побачу після розбору?", a: "Переклад, пояснення простими словами, дані відправника й наступні кроки. Якщо в листі є підтверджена дата, з’явиться строк; якщо її немає, не варто сприймати припущення як дедлайн. Імена, дати та номер справи можна перевірити й виправити перед відповіддю." },
      { q: "Чи можна спробувати без входу?", a: "Так, на головній є демонстраційний приклад. Щоб розібрати власний документ і зберегти результат у «Мої листи», потрібно увійти в акаунт." },
    ] },
    { title: "Відповіді й переписка", items: [
      { q: "Як підготувати відповідь німецькою?", a: "Відкрийте розібраний лист і натисніть «Підготувати відповідь». Напишіть своїми словами, що хочете повідомити, перевірте контакти та дані справи. Перед надсиланням перечитайте німецький текст і його переклад — особливо дати, суми та обіцянки." },
      { q: "Чи сайт сам надсилає email?", a: "Ні. Він відкриває вашу поштову програму з текстом листа. Остаточне надсилання робите ви. PDF або DOCX можна завантажити й додати до email окремо." },
      { q: "Що зберігається у «Відправлені листи»?", a: "Відповіді, які ви самі позначили кнопкою «Позначити як відправлений»: видно організацію, адресата й дату. Відкриття пошти позначку не ставить — це не підтвердження доставки. Якщо позначили помилково, зніміть позначку." },
    ] },
    { title: "Помічник і переклади", items: [
      { q: "З чим допомагають п’ять тем помічника?", a: "Житло — оренда й Anmeldung; діти й сім’я — Kita, школа, Kindergeld; робота — резюме й співбесіди; гроші — виплати та вимоги оплати; статус — Aufenthaltstitel, Termin і §24. Оберіть тему, натисніть підказку або опишіть ситуацію, потім натисніть «Запитати»." },
      { q: "Чим переклад відрізняється від розбору?", a: "У «Помічнику» можна вставити текст і вибрати UK, RU або DE: отримаєте переклад із поясненням німецьких термінів. Фото й PDF відкривають розбір на головній, де переклад іде разом зі строком та наступними кроками. Перекладений текст теж можна передати в розбір." },
      { q: "Питання помічнику витрачають безкоштовні розбори?", a: `Ні, це окремий ліміт: до ${ASSISTANT_DAILY_LIMIT} питань на день. Історія розмови не зберігається як лист; при переході до іншої теми або новій розмові вона очищується. Важливу відповідь краще скопіювати.` },
    ] },
    { title: "Строки й історія листів", items: [
      { q: "Що означають кольори біля строків?", a: "Червоний звертає увагу на терміновий або прострочений строк, жовтий — на близький, зелений — на не терміновий. Поруч є пояснення словами. Колір допомагає зорієнтуватися, але сам по собі не визначає юридичну важливість документа." },
      { q: "Де знайти лист від конкретної установи?", a: "У «Мої листи» отримані листи згруповані за організаціями. Відкрийте потрібну групу й лист, а для своїх відповідей перейдіть у «Відправлені листи»." },
      { q: "Як не забути про строк?", a: "Перевірте дату з оригіналом і додайте нагадування. Push надходить за 3 дні й у день строку — у вибраний вами час, а щомісячні нагадування — о 9:00 у вибраний день. Для push потрібні дозвіл браузера й підтримка пристрою. Email-нагадування поки не підключені — важливі дати варто також внести у власний календар." },
    ] },
    { title: "Щодня й навчання", items: [
      { q: "Що є у розділі «Щодня»?", a: "Публікації про життя в Німеччині, матеріали з офіційних джерел і мінікурси. У курсах можна читати уроки та перевіряти себе запитаннями. Матеріали доступні українською, російською й німецькою." },
      { q: "Чи можна вважати публікацію офіційним рішенням?", a: "Ні. Це пояснення для орієнтації, а не рішення установи чи юридична консультація. Перевіряйте першоджерело та актуальність для своєї ситуації. Ілюстрації не є документальними фото описаних подій." },
    ] },
    { title: "Акаунт, приватність і доступ", items: [
      { q: "Куди потрапляють мої дані і як їх видалити?", a: "Для розбору документ передається AI-сервісу, оригінал файлу не зберігається, а результат і відповідь зберігаються у вашому акаунті. У налаштуваннях можна завантажити копію всіх своїх даних, видалити дані або акаунт із підтвердженням. Подробиці обробки описані на сторінці Datenschutz." },
      { q: "Скільки розборів безкоштовно і чи вже можна оплатити?", a: `Перші ${FREE_ANALYSES} розборів безкоштовні. Платний доступ для подальших розборів ще готується — ціну й умови ми повідомимо заздалегідь. Збережені листи й відповіді залишаються доступними.` },
      { q: "Що робити, якщо AI помилився?", a: "Звірте відповідь з оригіналом і виправте дані перед надсиланням. Після розбору можна залишити оцінку корисності та вказати, що було не так. Якщо питання стосується оскарження, втрати виплат чи статусу, зверніться також до фахівця — AI його не замінює." },
    ] },
  ],
  RU: [
    { title: "Фото и разбор письма", items: [
      { q: "Как добавить письмо и несколько страниц?", a: "На главной сфотографируйте письмо или загрузите PDF либо фото. Можно выбрать несколько фото или добавить ещё страницу — до 5 страниц. Для файла действует ограничение 20 МБ. Снимайте ровно, чтобы весь текст был виден, затем нажмите «Разобрать письмо»." },
      { q: "Что я увижу после разбора?", a: "Перевод, объяснение простыми словами, данные отправителя и следующие шаги. Если в письме есть подтверждённая дата, появится срок; если её нет, не принимайте предположение за дедлайн. Имена, даты и номер дела можно проверить и исправить перед ответом." },
      { q: "Можно попробовать без входа?", a: "Да, на главной есть демонстрационный пример. Чтобы разобрать свой документ и сохранить результат в «Мои письма», нужно войти в аккаунт." },
    ] },
    { title: "Ответы и переписка", items: [
      { q: "Как подготовить ответ на немецком?", a: "Откройте разобранное письмо и нажмите «Подготовить ответ». Напишите своими словами, что хотите сообщить, проверьте контакты и данные дела. Перед отправкой перечитайте немецкий текст и перевод — особенно даты, суммы и обещания." },
      { q: "Сайт сам отправляет email?", a: "Нет. Он открывает вашу почтовую программу с текстом письма. Окончательно отправляете вы. PDF или DOCX можно скачать и приложить к email отдельно." },
      { q: "Что хранится в «Отправленные письма»?", a: "Ответы, которые вы сами отметили кнопкой «Отметить как отправленное»: видны организация, адресат и дата. Открытие почты отметку не ставит — это не подтверждение доставки. Если отметили по ошибке, снимите отметку." },
    ] },
    { title: "Помощник и переводы", items: [
      { q: "С чем помогают пять тем помощника?", a: "Жильё — аренда и Anmeldung; дети и семья — Kita, школа, Kindergeld; работа — резюме и собеседования; деньги — выплаты и требования оплаты; статус — Aufenthaltstitel, Termin и §24. Выберите тему, нажмите подсказку или опишите ситуацию, затем нажмите «Спросить»." },
      { q: "Чем перевод отличается от разбора?", a: "В «Помощнике» можно вставить текст и выбрать UK, RU или DE: получите перевод с пояснением немецких терминов. Фото и PDF открывают разбор на главной, где перевод идёт вместе со сроком и следующими шагами. Переведённый текст тоже можно передать в разбор." },
      { q: "Вопросы помощнику расходуют бесплатные разборы?", a: `Нет, это отдельный лимит: до ${ASSISTANT_DAILY_LIMIT} вопросов в день. История разговора не сохраняется как письмо; при переходе к другой теме или новом разговоре она очищается. Важный ответ лучше скопировать.` },
    ] },
    { title: "Сроки и история писем", items: [
      { q: "Что означают цвета возле сроков?", a: "Красный обращает внимание на срочный или просроченный срок, жёлтый — на близкий, зелёный — на несрочный. Рядом есть объяснение словами. Цвет помогает сориентироваться, но сам по себе не определяет юридическую важность документа." },
      { q: "Где найти письмо от конкретного учреждения?", a: "В «Мои письма» полученные письма сгруппированы по организациям. Откройте нужную группу и письмо, а для своих ответов перейдите в «Отправленные письма»." },
      { q: "Как не забыть о сроке?", a: "Сверьте дату с оригиналом и добавьте напоминание. Push приходит за 3 дня и в день срока — в выбранное вами время, а ежемесячные напоминания — в 9:00 в выбранный день. Для push нужны разрешение браузера и поддержка устройства. Email-напоминания пока не подключены — важные даты стоит также внести в свой календарь." },
    ] },
    { title: "Ежедневное чтение и обучение", items: [
      { q: "Что есть в разделе «Ежедневно»?", a: "Публикации о жизни в Германии, материалы из официальных источников и миникурсы. В курсах можно читать уроки и проверять себя вопросами. Материалы доступны на украинском, русском и немецком." },
      { q: "Можно считать публикацию официальным решением?", a: "Нет. Это объяснение для ориентации, а не решение учреждения или юридическая консультация. Проверяйте первоисточник и актуальность для своей ситуации. Иллюстрации не являются документальными фото описанных событий." },
    ] },
    { title: "Аккаунт, приватность и доступ", items: [
      { q: "Куда попадают мои данные и как их удалить?", a: "Для разбора документ передаётся AI-сервису, оригинал файла не хранится, а результат и ответ сохраняются в вашем аккаунте. В настройках можно скачать копию всех своих данных, удалить данные или аккаунт с подтверждением. Подробности обработки описаны на странице Datenschutz." },
      { q: "Сколько разборов бесплатно и уже можно оплатить?", a: `Первые ${FREE_ANALYSES} разборов бесплатные. Платный доступ для дальнейших разборов ещё готовится — цену и условия мы сообщим заранее. Сохранённые письма и ответы остаются доступными.` },
      { q: "Что делать, если AI ошибся?", a: "Сверьте ответ с оригиналом и исправьте данные перед отправкой. После разбора можно оценить его полезность и указать, что было не так. Если вопрос касается обжалования, потери выплат или статуса, обратитесь также к специалисту — AI его не заменяет." },
    ] },
  ],
  DE: [
    { title: "Fotos und Briefanalyse", items: [
      { q: "Wie füge ich einen Brief mit mehreren Seiten hinzu?", a: "Fotografieren Sie den Brief auf der Startseite oder laden Sie ein PDF oder Fotos hoch. Mehrere Fotos oder eine weitere Seite sind möglich — bis zu 5 Seiten. Für Dateien gilt ein Limit von 20 MB. Der ganze Text sollte gut lesbar sein. Tippen Sie danach auf «Brief verstehen»." },
      { q: "Was sehe ich nach der Analyse?", a: "Eine Übersetzung, eine verständliche Erklärung, Absenderdaten und nächste Schritte. Eine bestätigte Datumsangabe kann als Frist erscheinen; ohne Beleg ist eine Vermutung keine Frist. Namen, Daten und Aktenzeichen können Sie vor der Antwort prüfen und korrigieren." },
      { q: "Kann ich es ohne Anmeldung ausprobieren?", a: "Ja, auf der Startseite gibt es ein Demobeispiel. Für die Analyse Ihres eigenen Dokuments und das Speichern unter «Meine Briefe» müssen Sie sich anmelden." },
    ] },
    { title: "Antworten und Schriftverkehr", items: [
      { q: "Wie bereite ich eine Antwort auf Deutsch vor?", a: "Öffnen Sie den analysierten Brief und wählen Sie «Antwort vorbereiten». Beschreiben Sie mit eigenen Worten, was Sie mitteilen möchten, und prüfen Sie Kontakte und Aktenangaben. Lesen Sie vor dem Versand den deutschen Text und die Übersetzung — besonders Daten, Beträge und Zusagen." },
      { q: "Versendet die Website E-Mails selbst?", a: "Nein. Sie öffnet Ihr E-Mail-Programm mit dem Brieftext. Den endgültigen Versand übernehmen Sie. PDF oder DOCX können Sie herunterladen und separat anhängen." },
      { q: "Was steht unter «Gesendete Briefe»?", a: "Antworten, die Sie selbst mit «Als gesendet markieren» markiert haben, mit Organisation, Empfänger und Datum. Das Öffnen des E-Mail-Programms setzt keine Markierung; sie bestätigt auch keine Zustellung. Eine versehentliche Markierung können Sie entfernen." },
    ] },
    { title: "Assistent und Übersetzungen", items: [
      { q: "Wobei helfen die fünf Themen?", a: "Wohnen: Miete und Anmeldung; Familie: Kita, Schule und Kindergeld; Arbeit: Lebenslauf und Bewerbungsgespräche; Geld: Leistungen und Zahlungsforderungen; Aufenthalt: Aufenthaltstitel, Termine und §24. Wählen Sie ein Thema, eine vorgeschlagene Frage oder beschreiben Sie Ihre Situation und tippen Sie auf «Fragen»." },
      { q: "Wie unterscheiden sich Übersetzung und Analyse?", a: "Im Assistenten können Sie Text einfügen und UK, RU oder DE wählen: Sie erhalten eine Übersetzung mit Begriffserklärungen. Fotos und PDFs öffnen die Analyse auf der Startseite, mit Übersetzung, Frist und nächsten Schritten. Auch eingefügten Text können Sie zur Analyse weitergeben." },
      { q: "Verbrauchen Fragen kostenlose Briefanalysen?", a: `Nein, dafür gilt ein eigenes Limit von ${ASSISTANT_DAILY_LIMIT} Fragen pro Tag. Gespräche werden nicht als Briefe gespeichert und beim Themenwechsel oder neuen Gespräch geleert. Kopieren Sie wichtige Antworten am besten.` },
    ] },
    { title: "Fristen und Briefhistorie", items: [
      { q: "Was bedeuten die Farben bei Fristen?", a: "Rot weist auf eine dringende oder abgelaufene Frist hin, Gelb auf eine nahe und Grün auf eine nicht dringende. Daneben steht eine Erklärung. Die Farbe dient der Orientierung und bestimmt nicht allein die rechtliche Bedeutung des Dokuments." },
      { q: "Wo finde ich Post einer bestimmten Behörde?", a: "Unter «Meine Briefe» sind empfangene Briefe nach Organisation gruppiert. Öffnen Sie die passende Gruppe und den Brief; Ihre Antworten finden Sie unter «Gesendete Briefe»." },
      { q: "Wie behalte ich eine Frist im Blick?", a: "Prüfen Sie das Datum im Original und legen Sie eine Erinnerung an. Push kommt 3 Tage vorher und am Fristtag zur gewählten Uhrzeit, monatliche Erinnerungen um 9:00 Uhr am gewählten Tag. Push benötigt die Browser-Erlaubnis und ein unterstütztes Gerät. E-Mail-Erinnerungen sind noch nicht eingerichtet — tragen Sie wichtige Daten auch in Ihren eigenen Kalender ein." },
    ] },
    { title: "Täglich lesen und lernen", items: [
      { q: "Was bietet der Bereich «Täglich»?", a: "Beiträge zum Leben in Deutschland, Inhalte aus offiziellen Quellen und Minikurse. In den Kursen können Sie Lektionen lesen und Ihr Wissen mit Fragen prüfen. Die Inhalte sind auf Ukrainisch, Russisch und Deutsch verfügbar." },
      { q: "Ist ein Beitrag eine amtliche Entscheidung?", a: "Nein. Er dient der Orientierung und ersetzt weder einen Behördenbescheid noch Rechtsberatung. Prüfen Sie die Originalquelle und ihre Aktualität für Ihre Situation. Illustrationen sind keine dokumentarischen Fotos der beschriebenen Ereignisse." },
    ] },
    { title: "Konto, Datenschutz und Zugang", items: [
      { q: "Wohin gehen meine Daten und wie lösche ich sie?", a: "Für die Analyse wird das Dokument an einen KI-Dienst übertragen; die Originaldatei wird nicht gespeichert, Ergebnis und Antwort bleiben in Ihrem Konto. In den Einstellungen können Sie eine Kopie aller Ihrer Daten herunterladen sowie Ihre Daten oder Ihr Konto nach Bestätigung löschen. Einzelheiten stehen auf der Datenschutzseite." },
      { q: "Wie viele Analysen sind kostenlos und kann ich schon bezahlen?", a: `Die ersten ${FREE_ANALYSES} Analysen sind kostenlos. Ein kostenpflichtiger Zugang für weitere Analysen ist in Vorbereitung — Preis und Bedingungen teilen wir vorher mit. Gespeicherte Briefe und Antworten bleiben zugänglich.` },
      { q: "Was mache ich bei einem KI-Fehler?", a: "Vergleichen Sie die Antwort mit dem Original und korrigieren Sie Angaben vor dem Versand. Nach der Analyse können Sie deren Nutzen bewerten und Probleme angeben. Bei Anfechtungen, drohendem Leistungs- oder Statusverlust wenden Sie sich auch an eine Fachperson — KI ersetzt sie nicht." },
    ] },
  ],
};
