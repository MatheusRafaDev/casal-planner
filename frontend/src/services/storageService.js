// frontend/src/services/storageService.js

const getPrefix = () => 'casal_planner_';

export const storageService = {
  setItem: (key, value) => {
    try {
      const prefixedKey = `${getPrefix()}${key}`;
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(prefixedKey, serializedValue);
    } catch (error) {
      console.error('Error saving to localStorage', error);
    }
  },

  getItem: (key, defaultValue = null) => {
    try {
      const prefixedKey = `${getPrefix()}${key}`;
      const item = localStorage.getItem(prefixedKey);
      
      if (item === null) return defaultValue;
      
      try {
        return JSON.parse(item);
      } catch {
        return item; // If it's just a plain string
      }
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return defaultValue;
    }
  },

  removeItem: (key) => {
    try {
      const prefixedKey = `${getPrefix()}${key}`;
      localStorage.removeItem(prefixedKey);
    } catch (error) {
      console.error('Error removing from localStorage', error);
    }
  },

  clear: () => {
    try {
      const prefix = getPrefix();
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error clearing localStorage', error);
    }
  }
};
