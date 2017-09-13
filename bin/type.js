var types = require("dis-isa");

function Type(type) {
  this.name = arguments.length ? types.typeName(type) : undefined;
  this.transform = coerceValue;
}

Type.prototype.matchType = function(value) {
  return this.name ? this.name === types.typeName(value) : true;
};

Type.prototype.withDefault = function(value) {
  this.default = value;
  return this;
};

Type.prototype.hasDefault = function() {
  return this.hasOwnProperty("default");
};

Type.prototype.withItem = function(item) {
  if (this.name !== "array") {
    throw new TypeError("item is only valid for array types");
  }

  this.item = item;
  return this;
};

Type.prototype.withTransform = function(transform) {
  this.transform = transform;
  return this;
};

Object.defineProperties(Type, {
  "Any": {
    get: () => new Type()
  },
  "Boolean": {
    get: () => new Type(true)
  },
  "Number": {
    get: () => new Type(1)
  },
  "Array": {
    get: () => new Type([])
  },
  "String": {
    get: () => new Type("")
  }
});

function coerceValues(value, valueType) {
  if (!valueType) {
    return value;
  }

  var result;

  if (Type.check.isPlainObject(value)) {
    result = {};
    Object
      .keys(value)
      .forEach(key => result[key] = valueType[key] ? coerceValues(value[key], valueType[key]) : value[key]);
  }
  else if (Type.check.isArray(value) && valueType.item) {
    result = value.map(v => coerceValues(v, valueType.item));
  }
  else {
    result = value;
  }

  return valueType instanceof Type ? valueType.transform(result, valueType) : result;
}

function coerceValue(value, type) {
  if (!type.matchType(value)) {
    switch(type.name) {
      case "boolean":
        value = (
          value === "true" ? true :
          value === "false" ? false :
          Boolean(value)
        );
        break;
      case "number":
        value = Number(value);
        break;
      case "string":
        value = value === null || value === undefined ? value : value.toString();
        break;
      case "array":
        value = [].contact(value);
        break;
    }
  }

  return value;
}

module.exports = Type;
module.exports.check = types;
module.exports.coerceValues = coerceValues;
