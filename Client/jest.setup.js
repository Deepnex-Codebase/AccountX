import '@testing-library/jest-dom';

// Mock for IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    return null;
  }
  unobserve() {
    return null;
  }
  disconnect() {
    return null;
  }
};

// Mock for matchMedia
global.matchMedia = () => ({
  matches: false,
  addListener: () => {},
  removeListener: () => {},
});