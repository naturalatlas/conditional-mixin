/**
 * Creates a mixin that can be applied to a constructor via mixin.apply.
 *
 * mixin.define({<properties>}));
 * mixin.define({type: 1}, {<properties>});
 * mixin.define(function() { ... }, {<properties>});
 *
 * @throws
 * @param {object|function} test
 * @param {object} properties
 * @return {object}
 */
module.exports.define = function() {
	var test, properties;
	if (arguments.length === 1) {
		properties = arguments[0];
	} else {
		test = arguments[0];
		properties = arguments[1];
	}

	if (test && typeof test === 'object') {
		test = objectMatcher(test);
	}

	if (test) {
		for (var key in properties) {
			if (properties.hasOwnProperty(key) && typeof properties[key] !== 'function') {
				throw new Error('Mixin cannot have non-function properties when condition given');
			}
		}
	}

	return {
		test: test,
		props: properties
	};
};

/**
 * Applies a mixin to a Constructor.
 *
 * @param {function} Constructor
 * @param {object} mixin
 * @return {void}
 */
module.exports.apply = function(Constructor, mixin) {
	var overrideMethod = function(method_name) {
		var method = Constructor.prototype[method_name];
		if (method && method.overridden) return method;

		var original = Constructor.prototype[method_name];
		method = Constructor.prototype[method_name] = function() {
			var matches = 0, match;
			for (var i = 0, n = candidates.length; i < n; i++) {
				if (!candidates[i][0] || candidates[i][0].apply(this, [])) {
					return candidates[i][1].apply(this, arguments);
				}
			}

			throw new Error('No matching mixin candidates found');
		};

		var candidates = method.candidates = [];
		method.overridden = true;

		if (original) {
			method.candidates.unshift([null, original]);
		}
		return method;
	};
	var addMethod = function(method_name, fn) {
		overrideMethod(method_name).candidates.unshift([mixin.test, fn]);
	};

	var key, value;
	for (var key in mixin.props) {
		if (mixin.props.hasOwnProperty(key)) {
			value = mixin.props[key];
			if (typeof value === 'function') {
				addMethod(key, value);
			} else if (!mixin.test) {
				Constructor.prototype[key] = value;
			}
		}
	}
};

/**
 * Tests `this` for matching properties.
 *
 * @param {object} props
 * @return {boolean}
 */
var objectMatcher = function(props) {
	var key, value;
	var keys = [];
	var values = [];
	for (key in props) {
		if (props.hasOwnProperty(key)) {
			keys.push(key);
			values.push(props[key]);
		}
	}
	if (!values.length) {
		return function() { return false; };
	}
	if (values.length === 1) {
		key = keys[0];
		value = values[0];
		return function() {
			return this[key] === value;
		};
	}

	return function() {
		for (var i = 0, n = keys.length; i < n; i++) {
			if (this[keys[i]] !== values[i]) {
				return false;
			}
		}
		return true;
	}
};