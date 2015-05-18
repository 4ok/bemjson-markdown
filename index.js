var path = require('path');
var _    = require('lodash');

module.exports = {

    convert: function (bemjson)
    {
        var rules  = this._getRules();
        var result = this._convert(bemjson, rules);

        if (_.isString(result)) {
            result = result.replace(/^\s+|\s+$/, '');
        }

        return result;
    },

    _getRules: function () {

        return require(
            path.join(__dirname, 'rules.js')
        );
    },

    _convert: function (bemjson, rules)
    {
        var self = this;
        var result;

        if (_.isArray(bemjson)) {
            result = '';

            bemjson.forEach(function (item) {
                result += self._convert(item, rules);
            });
        } else if (_.isPlainObject(bemjson)) {

            _.every(rules, function (sections, prop) {
                var sectionsAliases = ['strict', 'regexp']; // @todo to const

                return sectionsAliases.every(function (sectionAlias) {
                    var noBreak = true;

                    if (bemjson.hasOwnProperty(prop)) {

                        if (sections[sectionAlias]) {
                            var itemsRules = sections[sectionAlias];
                            var key        = bemjson[prop];

                            if ('regexp' != sectionAlias) {

                                if (itemsRules.hasOwnProperty(key)) {
                                    var params = itemsRules[key];
                                    var callback;

                                    if ('block' == prop) {
                                        callback = params.callback;
                                        rules    = params.rules;
                                    } else {
                                        callback = params;
                                    }

                                    bemjson.content = self._convert(bemjson.content, rules);

                                    result  = callback(bemjson);
                                    noBreak = false;
                                }
                            } else {
                                itemsRules.forEach(function (item) {
                                    var matches = item.pattern.exec(key);

                                    if (matches) {
                                        bemjson.content = self._convert(bemjson.content, rules);

                                        result  = item.callback(bemjson, matches);
                                        noBreak = false;
                                    }
                                });
                            }
                        }
                    }

                    return noBreak;
                });
            });

            if (undefined === result) {
                result = "\n\n```javascript\n" + JSON.stringify(bemjson, null, 4) + "\n```";
            }
        } else {
            result = bemjson;
        }

        return result;
    }
};