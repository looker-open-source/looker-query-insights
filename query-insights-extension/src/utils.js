// Copyright 2024 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Generates a hash value from a given string.
 * 
 * @param {string} string - The input string to hash.
 * @returns {number} The generated hash value.
 */
export const stringToHash = (string) => {
  let hash = 0;
  if (string.length === 0) return hash;
  for (let i = 0; i < string.length; i++) {
    const char = string.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
};

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