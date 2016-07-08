var path = require('path');
var _    = require('lodash');

BemjsonMarkdown = function (options) {

    var _getRules = function () {

        return require(
            path.join(__dirname, 'rules/default.js')
        );
    };

    var _getMasks = function () {
        var result = options.masks;

        if (!result) {
            result = require(
                path.join(__dirname, '/masks/default.js')
            );
        }

        return result;
    };

    var rules = _getRules();
    var masks = _getMasks();

    this.convert = function (bemjson) {
        var result =_convert(bemjson);

        if (_.isString(result)) {
            result = result.replace(/^\s+|\s+$/, '');
        }

        return result;
    };

    var _convert = function (bemjson) {
        var result;

        if (_.isArray(bemjson)) {
            result = '';

            bemjson.forEach(function (item) {
                result += _convert(item);
            });
        } else if (_.isPlainObject(bemjson)
            && (bemjson.block || bemjson.elem)
        ) {

            _.every(masks, function (mask, ruleName) {
                var isMatched = _isMaskMatched(bemjson, mask);

                if (isMatched) {
                    result = _getRuleResult(ruleName, bemjson);
                }

                return !isMatched;
            });

            if (undefined === result) {
                result = '\n\n```javascript\n'
                    + JSON.stringify(bemjson, null, 4)
                    + '\n```';
            }
        } else {
            result = bemjson;
        }

        return result;
    };

    var _isMaskMatched = function (bemjson, mask) {
        var bemjsonCopy = _.clone(bemjson);

        if (mask.mods && bemjsonCopy.mods) {
            bemjsonCopy.mods = _.pick(bemjsonCopy.mods, Object.keys(mask.mods));
        }

        if (mask.mix
            && bemjsonCopy.mix
            && _.isArray(bemjsonCopy.mix)
            && _.some(bemjsonCopy.mix, mask.mix)
        ) {
            bemjsonCopy.mix = mask.mix;
        }

        bemjsonCopy = _.pick(
            bemjsonCopy,
            Object.keys(mask)
        );

        return _.isEqual(bemjsonCopy, mask);
    };

    var _getRuleResult = function (ruleName, bemjson) {
        var result;

        if (!rules[ruleName]) {
            throw new Error(
                'Incorrect Rule name "'
                + ruleName
                + '"'
            );
        } else {
            var callback = rules[ruleName];

            if (!_.isFunction(callback)) {
                throw new Error(
                    'Rule "'
                    + ruleName
                    + '" must be a function'
                );
            }

            if (bemjson.content) {
                var args = [bemjson.content];

                bemjson.content = _convert.apply(this, args);
            }

            result = callback(bemjson);
        }

        return result;
    }
};

module.exports = function (options) {
    var result;

    if (undefined === options) {
        options = {};
    }

    if (!_.isPlainObject(options)) {
        var error = 'Options should be a simple object';

        throw new Error(error);
    }

    if (!(this instanceof BemjsonMarkdown)) {
        result = new BemjsonMarkdown(options);
    }

    return result;
};
