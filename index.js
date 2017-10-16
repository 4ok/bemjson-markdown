const path = require('path');
const _    = require('lodash');

const BemjsonMarkdown = options => {

    const getRules = () => {
        // eslint-disable-next-line import/no-dynamic-require
        return require(
            path.join(__dirname, 'rules/default.js')
        );
    };

    const getMasks = () => {
        let result = options.masks;

        if (!result) {
            // eslint-disable-next-line import/no-dynamic-require
            result = require(
                path.join(__dirname, '/masks/default.js')
            );
        }

        return result;
    };

    const rules = getRules();
    const masks = getMasks();

    this.convert = bemjson => {
        let result =convert(bemjson);

        if (_.isString(result)) {
            result = result.replace(/^\s+|\s+$/, '');
        }

        return result;
    };

    const convert = bemjson => {
        let result;

        if (_.isArray(bemjson)) {
            result = '';

            bemjson.forEach(item => {
                result += convert(item);
            });
        } else if (_.isPlainObject(bemjson)
            && (bemjson.block || bemjson.elem)
        ) {

            _.every(masks, (mask, ruleName) => {
                const isMatched = isMaskMatched(bemjson, mask);

                if (isMatched) {
                    result = getRuleResult(ruleName, bemjson);
                }

                return !isMatched;
            });

            if (result === undefined) {
                result = '\n\n```javascript\n'
                    + JSON.stringify(bemjson, null, 4)
                    + '\n```';
            }
        } else {
            result = bemjson;
        }

        return result;
    };

    const isMaskMatched = (bemjson, mask) => {
        let bemjsonCopy = _.clone(bemjson);

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

    const getRuleResult = (ruleName, bemjson) => {
        let result;

        if (!rules[ruleName]) {
            throw new Error(
                'Incorrect Rule name "'
                + ruleName
                + '"'
            );
        } else {
            const callback = rules[ruleName];

            if (!_.isFunction(callback)) {
                throw new Error(
                    'Rule "'
                    + ruleName
                    + '" must be a function'
                );
            }

            if (bemjson.content) {
                const args = [bemjson.content];

                bemjson.content = convert.apply(this, args);
            }

            result = callback(bemjson);
        }

        return result;
    }
};

module.exports = function (options) {
    let result;

    if (options === undefined) {
        options = {};
    }

    if (!_.isPlainObject(options)) {
        const error = 'Options should be a simple object';

        throw new Error(error);
    }

    if (!(this instanceof BemjsonMarkdown)) {
        result = new BemjsonMarkdown(options);
    }

    return result;
};
