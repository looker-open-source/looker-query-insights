/**
 * 
 * @param {*} string 
 */
export const stringToHash = (string) => {
    let hash = 0;

    if (string.length == 0) return hash;

    for (let i = 0; i < string.length; i++) {
      let char = string.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    return hash;
}

/**
 * 
 * @param {*} data 
 */
export function* extractNestedValuesGenerator(data) {
  const extractValues = (obj, prefix = '') => {
    const values = [];
    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        if (typeof value === 'object' && value !== null) {
          if ('value' in value && value.value !== null) {
            const pivotLabel = prefix ? `${prefix.split('.')[1]} ${key}` : key;
            values.push(`${pivotLabel}:${value.value}`);
          } else if (Object.keys(value).length > 0) {
            // Recursively extract values from nested objects
            values.push(...extractValues(value, key));
          }
        }
      }
    }
    return values;
  };

  yield extractValues(data).join(',');
}