import '@testing-library/jest-dom/vitest';

// JSDOM polyfills and mocks used across tests
// matchMedia for components relying on prefers-color-scheme
if (!window.matchMedia) {
	window.matchMedia = (query) => ({
		matches: query.includes('prefers-color-scheme: dark') ? false : false,
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false,
	});
}

// Canvas getContext mock (Chart.js)
if (typeof HTMLCanvasElement !== 'undefined') {
	HTMLCanvasElement.prototype.getContext = HTMLCanvasElement.prototype.getContext || (() => ({
		// minimal 2d context stub
		canvas: {},
		createLinearGradient: () => ({ addColorStop: () => {} }),
		createRadialGradient: () => ({ addColorStop: () => {} }),
		fillRect: () => {},
		clearRect: () => {},
		getImageData: () => ({ data: [] }),
		putImageData: () => {},
		createImageData: () => ([]),
		setTransform: () => {},
		drawImage: () => {},
		save: () => {},
		fillText: () => {},
		restore: () => {},
		beginPath: () => {},
		moveTo: () => {},
		lineTo: () => {},
		closePath: () => {},
		stroke: () => {},
		translate: () => {},
		scale: () => {},
		rotate: () => {},
		arc: () => {},
		fill: () => {},
		measureText: () => ({ width: 0 }),
		transform: () => {},
		rect: () => {},
		clip: () => {},
	}));
}

// ResizeObserver and IntersectionObserver for UI libs
if (typeof window.ResizeObserver === 'undefined') {
	window.ResizeObserver = class {
		observe() {}
		unobserve() {}
		disconnect() {}
	};
}

if (typeof window.IntersectionObserver === 'undefined') {
	window.IntersectionObserver = class {
		constructor() {}
		observe() {}
		unobserve() {}
		disconnect() {}
		takeRecords() { return []; }
		root = null;
		rootMargin = '';
		thresholds = [];
	};
}

// Stable fake timers default; individual tests can switch as needed
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
	cleanup();
	vi.useRealTimers();
});