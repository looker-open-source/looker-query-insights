// MIT License

// Copyright (c) 2023 Looker Data Sciences, Inc.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

/**
 * A generator function that extracts nested values from a complex object structure.
 * 
 * @param {Object} data - The input object containing nested data.
 * @yields {string} A comma-separated string of extracted values.
 */
export function* extractNestedValuesGenerator(data) {
  /**
   * Recursively extracts values from an object.
   * 
   * @param {Object} obj - The object to extract values from.
   * @param {string} [prefix=''] - The prefix to use for nested keys.
   * @returns {string[]} An array of extracted value strings.
   */
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