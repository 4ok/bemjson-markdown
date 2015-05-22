var _ = require('lodash');

var CODE_BLOCK          = '```';
var TABLE_SEPARATOR_COL = '|';
var TABLE_UNDER_HEADER  = '-';
var STRONG              = '**';
var EMPHASIS            = '*';
var BLOCKQUOTE          = '> ';
var HEADER              = '#';
var HORIZONTAL_LINE     = '* * *';
var LIST_ITEM           = '- ';
var CODE                = '`';
var BREAK_LINE          = '   ';
var STRIKETHROUGH       = '~~';

function getContent(bemjson) {

    //return bemjson.content.replace('<br>', '  \n');

    return bemjson.content || '';
}

function getBreak(num) {
    var br = '\n';

    return (num)
        ? _.repeat(br, num)
        : br;
}

function getFormatedTable(content) {
    content = content.replace(/^\s+|\s+$/, '');

    var rows = content.split(
        getBreak()
    );
    var table = rows.map(function (row) {
        var cells = row.split(TABLE_SEPARATOR_COL);

        cells = cells.slice(1, -1);

        return cells;
    });

    var colsLength = [];

    table.forEach(function (row, numRow) {

        row.forEach(function (cell, numCell) {
            var cellLength = cell.length;

            if (0 == numRow) {
                colsLength[numCell] = cellLength;
            } else if (cellLength > colsLength[numCell]) {
                colsLength[numCell] = cellLength;
            }
        });
    });

    var result = table.map(function (row, numRow) {

        var result = row.map(function (cell, numCell) {
            var colLength = colsLength[numCell];
            var result    = '';
            var regex     = new RegExp('^\\' + TABLE_UNDER_HEADER + '+$');

            if (regex.test(cell)) {
                result += _.repeat(TABLE_UNDER_HEADER, colLength + 1);
            } else {
                result += ' '
                + cell
                + _.repeat(' ', colLength - cell.length);
            }

            return result;
        });

        return TABLE_SEPARATOR_COL
            + result.join(TABLE_SEPARATOR_COL)
            + TABLE_SEPARATOR_COL;
    });

    return result.join(
        getBreak()
    );
}

module.exports = { // @todo \n methods

    // Block level

    code : function (bemjson) {
        var lang = '';

        if (bemjson.mods && bemjson.mods.lang) {
            lang = bemjson.mods.lang;
        }

        return getBreak(2)
            + CODE_BLOCK
            + lang
            + getBreak()
            + getContent(bemjson)
            + CODE_BLOCK;
    },

    blockquote : function (bemjson) {

        return getBreak(2)
            + BLOCKQUOTE
            + getContent(bemjson);
    },

    heading : function (bemjson) {

        return getBreak(2)
            + _.repeat(HEADER, bemjson.mods.level)
            + ' '
            + getContent(bemjson);
    },

    hr : function () {

        return getBreak(2)
            + HORIZONTAL_LINE;
    },

    list: function (bemjson) {

        return getBreak()
            + getContent(bemjson);
    },

    listitem: function (bemjson) {

        return getBreak()
            + LIST_ITEM
            + getContent(bemjson);
    },

    paragraph : function (bemjson) {

        return getBreak(2)
            + getContent(bemjson);
    },

    table : function (bemjson) {
        var content = bemjson.content;

        content = getFormatedTable(content);

        return getBreak(2)
            + content;
    },

    tableheader : function (bemjson) {
        var content = bemjson.content.replace(/^\s+|\s+$/, '');
        var matches = content.split(TABLE_SEPARATOR_COL);

        var row = matches.map(function (content) {

            return _.repeat(TABLE_UNDER_HEADER, content.length);
        });

        return getBreak()
            + content
            + getBreak()
            + row.join(TABLE_SEPARATOR_COL);
    },

    tablebody : function (bemjson) {

        return bemjson.content;
    },

    tablerow : function (bemjson) {

        return getBreak()
            + bemjson.content
            + TABLE_SEPARATOR_COL;
    },

    tablecell : function (bemjson) {

        return TABLE_SEPARATOR_COL
            + ' '
            + getContent(bemjson)
            + ' ';
    },

    strong : function (bemjson) {

        return STRONG
            + bemjson.content
            + STRONG;
    },

    em : function (bemjson) {

        return EMPHASIS
            + bemjson.content
            + EMPHASIS;
    },

    codespan : function (bemjson) {

        return CODE
            + bemjson.content
            + CODE;
    },

    br : function () {

        return BREAK_LINE
            + getBreak();
    },

    del : function (bemjson) {

        return STRIKETHROUGH
            + bemjson.content
            + STRIKETHROUGH;
    },

    link : function (bemjson) {
        var result = '['
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

    image : function (bemjson) {
        var alt = bemjson.alt || '';

        var result = '!['
            + alt
            + ']('
            + bemjson.url;

        if (bemjson.title) {
            result += ' "' + bemjson.title + '"';
        }

        //var size;
        //
        //if (bemjson.width) {
        //    size = bemjson.width + 'x';
        //
        //    if (bemjson.height) {
        //        size += bemjson.height;
        //    }
        //
        //    result += ' =' + size;
        //}

        result += ')';

        return result;
    }
};