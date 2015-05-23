# bemjson-markdown

Конвертирует данные из формата [bemjson](https://ru.bem.info/technology/bemjson/v2/bemjson/) в [markdown](https://ru.wikipedia.org/wiki/Markdown)

Для обратного преобразования (markdown в bemjson) используйте модуль [markdown-bemjson](https://github.com/bem-incubator/markdown-bemjson)

## Зависимости

- [lodash](https://www.npmjs.com/package/lodash)

## Установка

__npm__

```bash
npm i bemjson-markdown --save
```

__git__

```bash
git clone https://github.com/4ok/bemjson-markdown.git
```

## Простой пример

```javascript

// Классический путь
var BemjsonMarkdown = require('bemjson-markdown');
var bemjsonMarkdown = new BemjsonMarkdown();

// Тоже самое, но с сахаром
var bemjsonMarkdown = require('bemjson-markdown')();

var bemjson = {
    block   : 'content',
    content : [
        {
            elem : 'header',
            mods : {
                level : 3
            },
            content : 'Header level 3'
        },
        {
            elem     : 'p',
            content  : [
                'I am using ',
                {
                    elem    : 'strong',
                    content : 'markdown'
                }
            ]
        }
    ]
};
var markdown = bemjsonMarkdown.convert(bemjson.content);

console.log(markdown);
/*
### Header level 3

I am using **markdown**
*/
```
## Документация

### @contructor([options])

__options__

Type: `object`

Настройки

*****

__options.masks__

Type: `object`

Коллекция масок.  

#### Пример коллекции масок:

```javascript
{
    paragraph : {
        elem : 'p'
    },
    
    list : {
        block : 'list',
        mods  : {
            block : 'content',
            elem  : 'list
        }
    }
}
```

#### Пример наложения маски

**К примеру мы имеем часть bemjson следующего вида:**

```javascript
{
    block : 'any-list',
    mods  : {
        block : 'any-block',
        mods  : {
            theme : 'theme-a'
        },
        mix : [
            {
               block : 'mix-block-a',
            },
            {
                block : 'mix-block-b',
                elem  : 'mix-elem-b'
            }
        ]
    }
}
```

**На нее легко накладывается следующая маска:**

```javascript
list : {
    block : 'any-list',
    mods  : {
        block : 'any-block',
        mix {
            block : 'mix-block-b',
            elem  : 'mix-elem-b'
        }
    }
}
```

Если маска совпадает, то будет вызвано соответствующее преобразование в markdown.

**Правило** по которому будет применено преобразование указано как ключ для маски, для примера выше это `paragraph` и `list`.

Если ни одна из масок не совпала, то не распознанный bemjson будет обертнут как код javascript:

<pre>
<code>
&#96;&#96;&#96;javascript
{
    block   : 'block',
    content : 'content
}
&#96;&#96;&#96;
</code>
</pre>

__[Маски применяемые по умолчанию](masks/default.js)__

#### Доступные правила

__Block level__

- code - _блок кода_
- blockquote - _цитата_
- heading - _заголовок_
- hr - _горизонтальная линия_
- list - _блок списка_
- listitem - _элемент списка_
- paragraph - _параграф_
- table - _таблица_
- tablerow - _строка таблицы_
- tablecell - _ячейка таблицы_

__Inline level__

- strong - _выделение текста жирным_
- em - _выделение текста курсивом_
- codespan - _код инлайн_
- br - _перевод строки_
- del - _перечеркнутый текст_
- link - _ссылка_
- image - _изображение_

### convert(bemjson)

__bemjson__

Type: `object`

Bemjson

## Авторы

- [4ok](https://github.com/4ok)

## Идеи, замечания и пожелания

Все это можно оформить в виде [issues](https://github.com/bem-incubator/bemjson-markdown/issues) на GitHub.

## Лицензия

[MIT](http://en.wikipedia.org/wiki/MIT_License) Лицензия