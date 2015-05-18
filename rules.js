var _ = require('lodash');

var TABLE_SEPARATOR_COL     = '|';
var TABLE_UNDER_HEADER_CHAR = '-';

function getContent(bemjson) {

    return bemjson.content.replace('<br>', '  \n');
}

module.exports = {
    elem : {
        strict : {
            p : function (bemjson) {

                return '\n\n'
                    + getContent(bemjson);
            },
            strong : function (bemjson) {

                return '**'
                    + bemjson.content
                    + '**';
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
            },
            br : function () {

            }
        },
        regexp : [
            {
                pattern  : /h([1-6])/,
                callback : function (bemjson, matches) {

                    return '\n\n'
                        + _.repeat('#', matches[1])
                        + ' '
                        + getContent(bemjson);
                }
            }
        ]
    },
    block : {
        strict : {
            list: {
                callback: function (bemjson) {

                    return '\n'
                        + getContent(bemjson);
                },
                rules: {
                    elem: {
                        strict : {
                            item: function (bemjson) {

                                return '\n- '
                                    + getContent(bemjson);
                            }
                        }
                    }
                }
            },
            table : {
                callback: function (bemjson) {
                    var content = bemjson.content;

                    content = content.replace(/^\s+|\s+$/, '');

                    var rows  = content.split('\n');
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
                            var regex     = new RegExp('^\\' + TABLE_UNDER_HEADER_CHAR + '+$');

                            if (regex.test(cell)) {
                                result += _.repeat(TABLE_UNDER_HEADER_CHAR, colLength + 1);
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

                    return '\n\n' + result.join('\n');
                },
                rules: {
                    elem: {
                        strict: {
                            header : function (bemjson) {
                                var content = bemjson.content.replace(/^\s+|\s+$/, '');
                                var matches = content.split(TABLE_SEPARATOR_COL);
                                var row     = matches.map(function (content) {

                                    return _.repeat(TABLE_UNDER_HEADER_CHAR, content.length);
                                });

                                return '\n'
                                    + content
                                    + '\n'
                                    + row.join(TABLE_SEPARATOR_COL);
                            },
                            body : function (bemjson) {

                                return bemjson.content;
                            },
                            row : function (bemjson) {

                                return '\n'
                                    + bemjson.content
                                    + TABLE_SEPARATOR_COL;
                            },
                            cell : function (bemjson) {

                                return TABLE_SEPARATOR_COL
                                    + ' '
                                    + getContent(bemjson)
                                    + ' ';
                            }
                        }
                    }
                }
            }
        }
    }
};