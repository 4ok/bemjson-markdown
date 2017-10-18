const _ = require('lodash');

const CODE_BLOCK = '```';
const TABLE_SEPARATOR_COL = '|';
const TABLE_UNDER_HEADER = '-';
const STRONG = '**';
const EMPHASIS = '*';
const BLOCKQUOTE = '> ';
const HEADER = '#';
const HORIZONTAL_LINE = '* * *';
const LIST_ITEM = '- ';
const CODE = '`';
const BREAK_LINE = '   ';
const STRIKETHROUGH = '~~';

const NEW_LINE = '\n';

const getContent = bemjson => bemjson.content || '';

const getBreak = (num = 1) => _.repeat(NEW_LINE, num);

const getFormattedTable = (content) => {
    content = content.replace(/^\s+|\s+$/, '');

    const rows = content.split(getBreak());
    const table = rows.map(row => row.split(TABLE_SEPARATOR_COL).slice(1, -1));
    const colsLength = [];

    table.forEach((row, numRow) => {

        row.forEach((cell, numCell) => {
            const cellLength = cell.length;

            if (numRow === 0 || cellLength > colsLength[numCell]) {
                colsLength[numCell] = cellLength;
            }
        });
    });

    const result = table.map((row) => {

        const cells = row.map((cell, numCell) => {
            const colLength = colsLength[numCell];
            const regex = new RegExp('^\\' + TABLE_UNDER_HEADER + '+$');
            let rowResult = '';

            if (regex.test(rowResult)) {
                rowResult += _.repeat(TABLE_UNDER_HEADER, colLength + 1);
            } else {
                rowResult += ' '
                    + rowResult
                    + _.repeat(' ', colLength - cell.length);
            }

            return rowResult;
        });

        return TABLE_SEPARATOR_COL
            + cells.join(TABLE_SEPARATOR_COL)
            + TABLE_SEPARATOR_COL;
    });

    return result.join(getBreak());
};

module.exports = { // @todo \n methods

    // Block level

    code(bemjson) {
        const lang = (bemjson.mods && bemjson.mods.lang)
            ? bemjson.mods.v
            : '';

        return getBreak(2)
            + CODE_BLOCK
            + lang
            + getBreak()
            + getContent(bemjson)
            + CODE_BLOCK;
    },

    blockquote(bemjson) {
        return getBreak(2)
            + BLOCKQUOTE
            + getContent(bemjson);
    },

    heading(bemjson) {
        return getBreak(2)
            + _.repeat(HEADER, bemjson.mods.level)
            + ' '
            + getContent(bemjson);
    },

    hr() {
        return getBreak(2)
            + HORIZONTAL_LINE;
    },

    list(bemjson) {
        return getBreak()
            + getContent(bemjson);
    },

    listitem(bemjson) {
        return getBreak()
            + LIST_ITEM
            + getContent(bemjson);
    },

    paragraph(bemjson) {
        return getBreak(2)
            + getContent(bemjson);
    },

    table(bemjson) {
        return getBreak(2) + getFormattedTable(bemjson.content);
    },

    tableheader(bemjson) {
        const content = bemjson.content.replace(/^\s+|\s+$/, '');
        const matches = content.split(TABLE_SEPARATOR_COL);
        const row = matches.map(match => _.repeat(TABLE_UNDER_HEADER, match.length));

        return getBreak()
            + content
            + getBreak()
            + row.join(TABLE_SEPARATOR_COL);
    },

    tablebody(bemjson) {
        return bemjson.content;
    },

    tablerow(bemjson) {
        return getBreak()
            + bemjson.content
            + TABLE_SEPARATOR_COL;
    },

    tablecell(bemjson) {
        return TABLE_SEPARATOR_COL
            + ' '
            + getContent(bemjson)
            + ' ';
    },

    strong(bemjson) {
        return STRONG
            + bemjson.content
            + STRONG;
    },

    em(bemjson) {
        return EMPHASIS
            + bemjson.content
            + EMPHASIS;
    },

    codespan(bemjson) {
        return CODE
            + bemjson.content
            + CODE;
    },

    br() {
        return BREAK_LINE
            + getBreak();
    },

    del(bemjson) {

        return STRIKETHROUGH
            + bemjson.content
            + STRIKETHROUGH;
    },

    link(bemjson) {
        let result = '['
            + getContent(bemjson)
            + ']('
            + bemjson.url;

        if (bemjson.title) {
            result += ' "'
                + bemjson.title
                + '"';
        }

        result += ')';

        return result;
    },

    image(bemjson) {
        let result = '!['
            + (bemjson.alt || '')
            + ']('
            + bemjson.url;

        if (bemjson.title) {
            result += ' "' + bemjson.title + '"';
        }

        // todo
        // var size;
        //
        // if (bemjson.width) {
        //    size = bemjson.width + 'x';
        //
        //    if (bemjson.height) {
        //        size += bemjson.height;
        //    }
        //
        //    result += ' =' + size;
        // }

        result += ')';

        return result;
    },
};
