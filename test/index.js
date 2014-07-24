var util = require('util');
var assert = require('chai').assert;
var mixin = require('../index.js');

describe('mixin', function() {
	it('should add non-function properties', function() {
		var A = function() {};
		var B = mixin.define({x: 1, y: 2, z: 3});
		mixin.apply(A, B);

		var a = new A();
		assert.equal(a.x, 1);
		assert.equal(a.y, 2);
		assert.equal(a.z, 3);
	});
	it('should not be able to have non-function properties when condition given', function() {
		assert.throws(function() {
			mixin.define(function() { return true; }, {a: 1, b: 2, c: 3});
		}, "Mixin cannot have non-function properties when condition given");
	});
	it('should not override methods that are not defined in mixins', function() {
		var A = function() {};
		A.prototype.name = function() {};
		var B = mixin.define(function() { return true; }, { test: function() {} });
		mixin.apply(A, B);

		assert.strictEqual((new A()).name, A.prototype.name);
	});
	it('should use proper this context on mixed-in methods', function(done) {
		var A = function() {};
		A.prototype.prop = true;
		var B = mixin.define(function() { return true; }, {
			name: function() {
				assert.instanceOf(this, A);
				assert.isTrue(this.prop, 'correct this context');
				done();
			}
		});

		mixin.apply(A, B);
		(new A()).name();
	});
	it('should pick first matching candidate', function() {
		var A = function(type) { this.type = type; };
		var B = mixin.define(function() { return this.type === 1; }, {
			name: function() { return 'B'; }
		});
		var C = mixin.define(function() { return this.type === 2; }, {
			name: function() { return 'C'; }
		});

		mixin.apply(A, B);
		mixin.apply(A, C);

		assert.equal((new A(1)).name(), 'B');
		assert.equal((new A(2)).name(), 'C');
	});
	it('should include base methods as available candidates', function() {
		var A = function(type) { this.type = type; };
		A.prototype.name = function() { return 'A'; }
		var B = mixin.define(function() { return this.type === 1; }, {
			name: function() { return 'B'; }
		});

		mixin.apply(A, B);
		assert.equal((new A(0)).name(), 'A');
	});
	it('should call original function if no matching candidates', function() {
		var A = function(type) { this.type = type; };
		var B = mixin.define(function() { return this.type === 1; }, {
			name: function() { return 'B'; }
		});
		var C = mixin.define(function() { return this.type === 2; }, {
			name: function() { return 'C'; }
		});

		mixin.apply(A, B);
		mixin.apply(A, C);

		assert.equal((new A(1)).name(), 'B');
		assert.equal((new A(2)).name(), 'C');
	});
	it('should throw error if no matching candidates', function() {
		var A = function() { };
		var B = mixin.define(function() { return false; }, {
			name: function() { return 'B'; }
		});
		var C = mixin.define(function() { return false; }, {
			name: function() { return 'C'; }
		});
		mixin.apply(A, B);
		mixin.apply(A, C);

		assert.throws(function() { (new A()).name(); }, "No matching mixin candidates found");
	});
	it('should invoke candidate with same arguments and return same result', function() {
		var A = function() { return this.prefix = 'hello '; };
		var B = mixin.define(function() { return true; }, {
			hello: function(greeting) {
				return this.prefix + greeting;
			}
		});
		mixin.apply(A, B);
		var a = new A();
		assert.equal(a.hello('someone'), 'hello someone');
	});
	it('should add _mixinParent() that returns original properties (with functions bound)', function() {
		var Base = function() {};
		Base.prototype.inheritedSelf = function() { return this; };

		var A = function() { };
		util.inherits(A, Base);
		A.prototype.x = 1;
		A.prototype.realSelf = function() { return this; };
		A.prototype.self = function() {
			return this;
		};
		var B = mixin.define({
			x: 2,
			self: function() { return false; }
		});
		mixin.apply(A, B);

		var a = new A();
		assert.property(a, '_mixinParent');
		assert.equal(a._mixinParent().inheritedSelf(), a.realSelf());
		assert.equal(a._mixinParent().self(), a.realSelf());
		assert.equal(a._mixinParent().x, 1);
	});
});

describe('mixin candidate test', function() {
	it('should be able to be omitted', function() {
		var A = function(type) { this.type = type; };
		A.prototype.name = function() { return 'A'; };
		var B = mixin.define({
			name: function() { return 'B'; }
		});
		var C = mixin.define(function() { return this.type === 2; }, {
			name: function() { return 'C'; }
		});

		mixin.apply(A, B);
		mixin.apply(A, C);

		assert.equal((new A(2)).name(), 'C');
		assert.equal((new A(4)).name(), 'B');
	});
	it('should support callback function', function() {
		var A = function(type) { this.type = type; };
		A.prototype.name = function() { return 'A'; };
		var B = mixin.define(function() { return this.type === 1; }, {
			name: function() { return 'B'; }
		});
		var C = mixin.define(function() { return this.type === 2; }, {
			name: function() { return 'C'; }
		});

		mixin.apply(A, B);
		mixin.apply(A, C);

		assert.equal((new A(0)).name(), 'A');
		assert.equal((new A(1)).name(), 'B');
		assert.equal((new A(2)).name(), 'C');
	});
	it('should support object with properties', function() {
		var A = function(x, y) {
			this.x = x;
			this.y = y;
		};
		A.prototype.name = function() { return 'A'; };
		var B = mixin.define({x: 1}, {
			name: function() { return 'B'; }
		});
		var C = mixin.define({x: 2, y: 3}, {
			name: function() { return 'C'; }
		});

		mixin.apply(A, B);
		mixin.apply(A, C);

		assert.equal((new A(1,2)).name(), 'B');
		assert.equal((new A(2,2)).name(), 'A');
		assert.equal((new A(2,3)).name(), 'C');
	});
	it('should support object with nested properties', function() {
		var A = function(x, y, z) {
			this.pt = {x: x, y: y};
			this.z = z;
		};
		A.prototype.name = function() { return 'A'; };
		var B = mixin.define({'pt.x': 1}, {
			name: function() { return 'B'; }
		});
		var C = mixin.define({'pt.x': 2, 'pt.y': 3}, {
			name: function() { return 'C'; }
		});
		var D = mixin.define({'z': 5, 'pt.x': 2, 'pt.y': 3}, {
			name: function() { return 'D'; }
		});

		mixin.apply(A, B);
		mixin.apply(A, C);
		mixin.apply(A, D);

		assert.equal((new A(1,2)).name(), 'B');
		assert.equal((new A(2,2)).name(), 'A');
		assert.equal((new A(2,3)).name(), 'C');
		assert.equal((new A(2,3,5)).name(), 'D');
		assert.equal((new A(2,3,6)).name(), 'C');
	});
});