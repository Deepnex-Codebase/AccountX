/**
 * Utility functions for data transformation
 */

/**
 * Group an array of objects by a specific key
 * @param {Array} array - The array to group
 * @param {string|Function} key - The key to group by or a function that returns the key
 * @returns {Object} Grouped object with keys and arrays of matching items
 */
export const groupBy = (array, key) => {
  if (!Array.isArray(array)) return {};
  
  return array.reduce((result, item) => {
    // Get the key value, either by property name or function
    const keyValue = typeof key === 'function' ? key(item) : item[key];
    
    // If the key doesn't exist yet, create it
    if (!result[keyValue]) {
      result[keyValue] = [];
    }
    
    // Add the item to the key's array
    result[keyValue].push(item);
    
    return result;
  }, {});
};

/**
 * Sort an array of objects by a specific key
 * @param {Array} array - The array to sort
 * @param {string|Function} key - The key to sort by or a function that returns the value to sort by
 * @param {string} direction - The sort direction ('asc' or 'desc')
 * @returns {Array} Sorted array
 */
export const sortBy = (array, key, direction = 'asc') => {
  if (!Array.isArray(array)) return [];
  
  const sortedArray = [...array];
  const directionMultiplier = direction.toLowerCase() === 'desc' ? -1 : 1;
  
  return sortedArray.sort((a, b) => {
    const aValue = typeof key === 'function' ? key(a) : a[key];
    const bValue = typeof key === 'function' ? key(b) : b[key];
    
    // Handle string comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return directionMultiplier * aValue.localeCompare(bValue);
    }
    
    // Handle number comparison
    if (aValue < bValue) return -1 * directionMultiplier;
    if (aValue > bValue) return 1 * directionMultiplier;
    return 0;
  });
};

/**
 * Filter an array of objects based on a predicate function
 * @param {Array} array - The array to filter
 * @param {Function} predicate - The filter predicate function
 * @returns {Array} Filtered array
 */
export const filterBy = (array, predicate) => {
  if (!Array.isArray(array) || typeof predicate !== 'function') return [];
  
  return array.filter(predicate);
};

/**
 * Map an array of objects to a new array with only specific keys
 * @param {Array} array - The array to map
 * @param {Array} keys - The keys to include in the result
 * @returns {Array} Mapped array with only the specified keys
 */
export const pickKeys = (array, keys) => {
  if (!Array.isArray(array) || !Array.isArray(keys)) return [];
  
  return array.map(item => {
    const result = {};
    
    keys.forEach(key => {
      if (Object.prototype.hasOwnProperty.call(item, key)) {
        result[key] = item[key];
      }
    });
    
    return result;
  });
};

/**
 * Convert an array of objects to a map/object using a key
 * @param {Array} array - The array to convert
 * @param {string|Function} key - The key to use as the map key or a function that returns the key
 * @returns {Object} Map with keys and corresponding items
 */
export const arrayToMap = (array, key) => {
  if (!Array.isArray(array)) return {};
  
  return array.reduce((result, item) => {
    const keyValue = typeof key === 'function' ? key(item) : item[key];
    result[keyValue] = item;
    return result;
  }, {});
};

/**
 * Convert a map/object to an array of objects
 * @param {Object} map - The map to convert
 * @param {Function} transformer - Optional function to transform each entry
 * @returns {Array} Array of objects
 */
export const mapToArray = (map, transformer = null) => {
  if (typeof map !== 'object' || map === null) return [];
  
  return Object.entries(map).map(([key, value]) => {
    if (typeof transformer === 'function') {
      return transformer(key, value);
    }
    
    return { key, value };
  });
};

/**
 * Flatten a nested array
 * @param {Array} array - The array to flatten
 * @param {number} depth - The depth to flatten to (default: Infinity)
 * @returns {Array} Flattened array
 */
export const flatten = (array, depth = Infinity) => {
  if (!Array.isArray(array)) return [];
  
  return array.flat(depth);
};

/**
 * Create a unique array by removing duplicates
 * @param {Array} array - The array to make unique
 * @param {string|Function} key - Optional key or function to determine uniqueness
 * @returns {Array} Array with duplicates removed
 */
export const unique = (array, key = null) => {
  if (!Array.isArray(array)) return [];
  
  if (key === null) {
    return [...new Set(array)];
  }
  
  const seen = new Set();
  return array.filter(item => {
    const keyValue = typeof key === 'function' ? key(item) : item[key];
    if (seen.has(keyValue)) {
      return false;
    }
    seen.add(keyValue);
    return true;
  });
};

/**
 * Chunk an array into smaller arrays of a specified size
 * @param {Array} array - The array to chunk
 * @param {number} size - The size of each chunk
 * @returns {Array} Array of chunks
 */
export const chunk = (array, size = 1) => {
  if (!Array.isArray(array) || size <= 0) return [];
  
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  
  return chunks;
};

/**
 * Merge multiple objects into a single object
 * @param {...Object} objects - The objects to merge
 * @returns {Object} Merged object
 */
export const mergeObjects = (...objects) => {
  return Object.assign({}, ...objects);
};

/**
 * Deep merge multiple objects into a single object
 * @param {...Object} objects - The objects to merge
 * @returns {Object} Deeply merged object
 */
export const deepMerge = (...objects) => {
  const isObject = obj => obj && typeof obj === 'object' && !Array.isArray(obj);
  
  return objects.reduce((result, obj) => {
    if (!obj) return result;
    
    Object.keys(obj).forEach(key => {
      if (isObject(result[key]) && isObject(obj[key])) {
        result[key] = deepMerge(result[key], obj[key]);
      } else if (Array.isArray(result[key]) && Array.isArray(obj[key])) {
        result[key] = [...result[key], ...obj[key]];
      } else {
        result[key] = obj[key];
      }
    });
    
    return result;
  }, {});
};

/**
 * Create a deep clone of an object or array
 * @param {any} value - The value to clone
 * @returns {any} Deep clone of the value
 */
export const deepClone = (value) => {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  
  if (Array.isArray(value)) {
    return value.map(item => deepClone(item));
  }
  
  const clone = {};
  Object.keys(value).forEach(key => {
    clone[key] = deepClone(value[key]);
  });
  
  return clone;
};

/**
 * Convert a flat array to a tree structure
 * @param {Array} array - The flat array
 * @param {Object} options - Configuration options
 * @param {string} options.idKey - The key for the unique identifier (default: 'id')
 * @param {string} options.parentKey - The key for the parent identifier (default: 'parentId')
 * @param {string} options.childrenKey - The key for the children array (default: 'children')
 * @returns {Array} Tree structure
 */
export const arrayToTree = (array, {
  idKey = 'id',
  parentKey = 'parentId',
  childrenKey = 'children'
} = {}) => {
  if (!Array.isArray(array)) return [];
  
  const map = {};
  const tree = [];
  
  // Create a map of all items by their id
  array.forEach(item => {
    map[item[idKey]] = { ...item, [childrenKey]: [] };
  });
  
  // Add each item to its parent's children array or to the root
  array.forEach(item => {
    const id = item[idKey];
    const parentId = item[parentKey];
    
    if (parentId && map[parentId]) {
      map[parentId][childrenKey].push(map[id]);
    } else {
      tree.push(map[id]);
    }
  });
  
  return tree;
};

/**
 * Convert a tree structure to a flat array
 * @param {Array} tree - The tree structure
 * @param {Object} options - Configuration options
 * @param {string} options.childrenKey - The key for the children array (default: 'children')
 * @returns {Array} Flat array
 */
export const treeToArray = (tree, { childrenKey = 'children' } = {}) => {
  if (!Array.isArray(tree)) return [];
  
  const result = [];
  
  const flatten = (items) => {
    items.forEach(item => {
      const { [childrenKey]: children, ...rest } = item;
      result.push(rest);
      
      if (Array.isArray(children) && children.length > 0) {
        flatten(children);
      }
    });
  };
  
  flatten(tree);
  return result;
};