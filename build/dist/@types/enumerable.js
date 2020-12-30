export function enumerable(value) {
  return function(target, propertyKey, descriptor) {
    descriptor.enumerable = value;
  };
}
