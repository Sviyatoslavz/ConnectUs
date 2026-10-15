# Ukrainian Germany AI — пакет исправлений перед запуском

Этот каталог — исходники Lovable-проекта с исправлениями по итогам аудита.
Сюда не входят `src/components/ui/*` (стандартные shadcn-компоненты: в Lovable они уже есть и не менялись),
изображения `src/assets/*.jpg` (в проекте Lovable лежат оригиналы), `.env`, `node_modules`, `.output`.

## Как перенести в Lovable

Вариант А (рекомендуется): Lovable → GitHub → Connect, затем скопировать файлы из этого каталога
в подключённый репозиторий поверх существующих (папку `src/components/ui` и картинки не трогать)
и удалить файлы из списка ниже.

Вариант Б: пополнить кредиты Lovable и попросить агента применить изменения из этой ветки.

### Удалить в проекте Lovable
- `src/routes/_shell.documents.index.tsx`
- `src/components/app/badges.tsx`
- `src/components/app/kit.tsx`

### Зависимости
В `package.json` добавлены `@fontsource-variable/inter`, `@fontsource-variable/manrope`,
`@fontsource-variable/onest` (шрифты без Google Fonts). Lovable обновит `bun.lock` сам.

## База данных
- `drizzle/migrations/0014_launch_hardening.sql` — **уже применена** в production
  (каскадное удаление, `reminders.letter_id`, таблица `consents`, `delete_user_data`, cron owner-notifications раз в 5 минут).
- `drizzle/migrations/0015_reminder_push_hourly.sql` — **применить сразу после деплоя нового кода**
  (cron `reminder-push-daily` → ежечасно). Раньше применять нельзя: старый код будет слать пуши ночью.

## Что нужно заполнить владельцу
- `src/lib/legal-config.ts`: имя/фирма оператора, адрес, e-mail, AI-провайдер и основание передачи данных
  (`aiTransferNote`), хостинг, надзорный орган (`supervisoryAuthority`). Пока данные не заполнены,
  на страницах Impressum/Datenschutz показывается предупреждение.
- Юридическая проверка текста Datenschutz (особенно Art. 9 — данные из писем ведомств).
- Supabase Auth: включить подтверждение e-mail и, по желанию, captcha.
- Оплата: цена скрыта, пока нет Stripe. После подключения Stripe вернуть цену в `billing.ts`/копирайт.

## Проверено
- `npm run build` — OK; `npx vitest run` — 17 файлов, 122 теста, все проходят.
- SSR: все страницы 200, старые маршруты 307-редирект, 404 локализован, `reminder-push` без секрета → 401.
- Браузер (Playwright): согласие Art. 9, пометка демо, переключение языка на /auth, 0 запросов к Google Fonts, без JS-ошибок.
- БД: 11 FK с каскадом, RLS на `consents`, `delete_user_data` недоступна обычным пользователям,
  симуляция RLS — пользователь видит только свои письма.

## Не удалось проверить (нужны ключи/устройства)
- Реальный AI-анализ письма и server functions end-to-end (нужен AI-ключ и service-role).
- Фактическая доставка push на телефон.
- Настройки Supabase Auth.
