# Котопад / Meowfall — kotopad.fun

Официальный сайт iOS-игры: главная, поддержка, конфиденциальность, условия и управление данными на русском и английском. Отдельный репозиторий сайта; исходники игры не изменяются.

## Адреса для App Store

| Поле | Русский | English |
| --- | --- | --- |
| Marketing URL | https://kotopad.fun/ | https://kotopad.fun/en/ |
| Support URL | https://kotopad.fun/support/ | https://kotopad.fun/en/support/ |
| Privacy Policy URL | https://kotopad.fun/privacy/ | https://kotopad.fun/en/privacy/ |
| User Privacy Choices URL | https://kotopad.fun/data/ | https://kotopad.fun/en/data/ |
| Условия | https://kotopad.fun/terms/ | https://kotopad.fun/en/terms/ |

Контакт, предоставленный владельцем: `support@denary.store`. Старые GitHub Pages URL `/` и `/privacy.html` сохранены как переходы на новые поддержку и политику. Уже собранная игра продолжит открывать политику.

## Разработка

Нужен Node.js 20+. Установка пакетов не требуется.

```sh
npm run build
npm run check
npm run preview
```

Локальная версия: http://localhost:4173. `src/content.mjs` содержит локализации и документы; `scripts/build.mjs` создаёт 10 статических страниц, sitemap, robots.txt и 404. Оформление и интерактивность — в `src/style.css` и `src/site.js`. Документы и поддержка читаются без JavaScript.

Готовый сайт — `dist/`. Нет runtime-зависимостей, базы, аналитики, cookie или localStorage. Сайт не принимает формы и не обрабатывает игровые сохранения. Письмо в поддержку открывается в почтовом клиенте пользователя.

## Графика

Котики экспортированы родным `CatPainter` игры, скриншоты взяты из App Store-серии 1.3 (7). Промоиллюстрации не выдаются за игровой интерфейс. Повторный импорт на macOS:

```sh
bash scripts/import-assets.sh ../game-ios/some-game
```

Нужны Swift и `cwebp`. Готовые WebP включены в Git; обычная сборка не требует этих инструментов или репозитория игры. Nunito хранится локально с OFL-лицензией в `public/assets/fonts/`.

## Развёртывание

Hostinger VPS: `72.62.146.124`, Nginx, отдельный каталог `/var/www/kotopad`, отдельный vhost `/etc/nginx/sites-available/kotopad.fun`. Никаких новых Docker-контейнеров. DNS: apex A → VPS, `www` CNAME → apex.

```sh
npm run deploy
```

Скрипт собирает и проверяет сайт, загружает только `dist/`, создаёт версию в `/var/www/kotopad/releases/` и атомарно переключает `current`. Сохраняет прежнюю конфигурацию своего vhost; при ошибке `nginx -t` возвращает её и предыдущий релиз. Остальные сайты и сервисы не изменяются. При первом запуске каталог `/var/www/kotopad` должен существовать.

HTTP и `www` перенаправляются на HTTPS. Let's Encrypt обновляется через существующий `certbot.timer`; deploy hook проверяет и перезагружает Nginx. Журнал посещений отключён. Для ошибок настроена ежедневная ротация (7 архивов, maxage 7 дней); политика сайта предусматривает верхний предел 14 дней.

Откат: переключить `/var/www/kotopad/current` на предыдущую папку в `releases/`. Изменение vhost не требуется.

API-ключи Hostinger и приватные SSH/TLS-ключи не хранятся в исходниках и не публикуются в Git. Для повторного деплоя используется обычный SSH владельца.

## Перед выходом в App Store

Сайт сейчас сообщает «Скоро в App Store» без неработающей кнопки загрузки. После публикации игры нужно заменить статус на проверенную ссылку App Store в шаблоне главной и шапки. URL выше готовы для App Store Connect; сайт не меняет карточку приложения автоматически.

Документы сверены с текущим кодом сохранений, iCloud, Game Center и покупок. Политика отдельно описывает рабочую резервную копию, пять архивных копий, метку устройства в Keychain и обращения в поддержку. Сброс не называется полным удалением.
