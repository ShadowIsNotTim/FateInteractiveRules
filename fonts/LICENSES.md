# Лицензии шрифтов

Сайт использует три шрифта: **Kablammo** для крупных заголовков, **Tsap-Tsarap** для подзаголовков и подписей, **Liberation Sans** для основного текста.

| Шрифт | Где используется | Лицензия | Можно ли встраивать в публичный HTML |
|---|---|---|---|
| **Kablammo** | Крупные заголовки | **SIL OFL 1.1** | Да, с текстом лицензии и копирайтом |
| **Tsap-Tsarap** | Подзаголовки, подписи | Автор пишет: **«Free font for any type of use»** | Да, но это не формальная лицензия; желательно указать автора и приложить readme |
| **Liberation Sans** | Основной текст | **SIL OFL 1.1** | Да, с текстом лицензии и копирайтом |

Полные тексты лицензий и копирайты лежат рядом:

- `licenses/Kablammo-OFL-1.1.txt`
- `licenses/Kablammo-COPYRIGHT.txt`
- `licenses/Tsap-Tsarap-README.txt`
- `licenses/Liberation-Sans-copyright.txt`

Файлы Kablammo и Tsap-Tsarap лежат в `fonts/extracted/`. Liberation Sans в репозиторий не встроен: браузер берёт его из системы, а при отсутствии — DejaVu Sans или Arial.

## Текст лицензии без самого шрифта

В `licenses/` также лежит `Noto-Serif-Display-copyright.txt`: сам шрифт **Noto Serif Display** (**SIL OFL 1.1**, `fonts-noto-core`) в репозиторий не добавлен и на сайте не используется — сохранён только текст копирайта на случай замены шрифта.

## Указание авторства

При распространении сайта или его копии сохраняйте копирайты и тексты лицензий для Kablammo и Tsap-Tsarap, а также ссылку на Tsap-Tsarap readme. Для Liberation Sans достаточно сохранить текст `licenses/Liberation-Sans-copyright.txt`.
