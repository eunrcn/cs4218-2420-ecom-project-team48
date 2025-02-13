import { TextEncoder, TextDecoder } from "util";
import "whatwg-fetch"; // Polyfill for fetch and Response

// Mock BroadcastChannel to avoid issues in Node environment (Jest)
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.BroadcastChannel = class {
  postMessage() {}
  close() {}
};
