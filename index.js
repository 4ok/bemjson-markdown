const path = require('path');
const _ = require('lodash');

const getRules = () => {
    const defaultRuleFile = path.join(__dirname, 'rules/default.js');

    // eslint-disable-next-line global-require, import/no-dynamic-require
    return require(defaultRuleFile);
};

const getMasks = (options) => {
    let result = options.masks;

    if (!result) {
        const defaultMaskFile = path.join(__dirname, '/masks/default.js');

        // eslint-disable-next-line global-require, import/no-dynamic-require
        result = require(defaultMaskFile);
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

    bemjsonCopy = _.pick(bemjsonCopy, Object.keys(mask));

    return _.isEqual(bemjsonCopy, mask);
};

const BemjsonMarkdown = (options) => {
    const rules = getRules();
    const masks = getMasks(options);

    const convert = (bemjson) => {
        let convertResult;

        const getRuleResult = (ruleName, ruleBemjson) => {
            let result;

            if (!rules[ruleName]) {
                const message = 'Incorrect Rule name "'
                    + ruleName
                    + '"';

                throw new Error(message);
            } else {
                const callback = rules[ruleName];

                if (!_.isFunction(callback)) {
                    const message = 'Rule "'
                        + ruleName
                        + '" must be a function';

                    throw new Error(message);
                }

                if (ruleBemjson.content) {
                    const args = [ruleBemjson.content];

                    ruleBemjson.content = convert.apply(this, args);
                }

                result = callback(ruleBemjson);
            }

            return result;
        };

        if (_.isArray(bemjson)) {
            convertResult = '';

            bemjson.forEach((item) => {
                convertResult += convert(item);
            });
        } else if (_.isPlainObject(bemjson)
            && (bemjson.block || bemjson.elem)
        ) {
            _.every(masks, (mask, ruleName) => {
                const isMatched = isMaskMatched(bemjson, mask);

                if (isMatched) {
                    convertResult = getRuleResult(ruleName, bemjson);
                }

                return !isMatched;
            });

            if (convertResult === undefined) {
                convertResult = '\n\n```javascript\n'
                    + JSON.stringify(bemjson, null, 4)
                    + '\n```';
            }
        } else {
            convertResult = bemjson;
        }

        return convertResult;
    };

    this.convert = (bemjson) => {
        let result = convert(bemjson);

        if (_.isString(result)) {
            result = result.replace(/^\s+|\s+$/, '');
        }

        return result;
    };
};

module.exports = (options) => {
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
