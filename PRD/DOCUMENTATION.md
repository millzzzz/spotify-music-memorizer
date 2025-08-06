# Spotify Music Memorizer: Engineering Journey

This document details the engineering challenges, solutions, and key learnings from the development of the Spotify Music Memorizer application.

## 1. Core Engineering Challenges & Solutions

### Challenge: Authentication & Authorization
- **Problem:** Securely connecting to the Spotify API proved to be the most significant hurdle. We faced a series of cascading errors, including `INVALID_CLIENT`, `SyntaxError`, and `NO_ACTIVE_DEVICE`.
- **Solution:** This required a multi-step solution. We transitioned from a faulty third-party library to direct `fetch` calls for all player commands. This gave us the control needed to handle Spotify's specific API responses, including empty `204 No Content` statuses that were crashing the old library. The final breakthrough was realizing that Spotify's API requires an explicit playback transfer to the in-browser player, which we solved by architecting a centralized, "hydration-aware" player state in our Zustand store.

### Challenge: Real-Time Playback & State Management
- **Problem:** The application's state needed to be perfectly synchronized with the user's mental model. Early versions had audio latency, and the playback state would incorrectly reset upon navigation.
- **Solution:** We architected a robust, centralized state management system using Zustand. All application state, including the player instance and playback status, is managed in this global store. This decouples the state from the component lifecycle, ensuring a seamless and intuitive user experience.

### Challenge: UI/UX & Iterative Refinement
- **Problem:** The initial UI was cluttered and lacked a clear user flow.
- **Solution:** We refactored the UI into a clean, multi-step process, creating dedicated components for each stage of the user journey (Playlist Selection, Deck Overview, Review). We also integrated a professional design system, including the Inter font and the IBM Developer color palette, to create a polished and cohesive visual identity.

## 2. Key Learnings & Engineering Best Practices

- **Third-Party Libraries are a Double-Edged Sword:** While libraries can accelerate development, they can also introduce opaque bugs. Our issues with the `spotify-web-api-js` library taught us that for critical API interactions, direct `fetch` calls can provide the control and robustness needed.
- **State Management is Architecture:** A well-designed state management system is the backbone of a modern web application. Our move to a centralized Zustand store was the key to solving a wide range of bugs and creating a seamless user experience.
- **Automated Testing is Non-Negotiable:** Our iterative debugging process highlighted the need for a robust testing suite. The introduction of `vitest` and our first unit test for the spaced repetition algorithm is a critical step towards building a truly professional-grade application.

This project has been an excellent example of how a dedicated, iterative approach to development, guided by sharp user feedback, can transform a great idea into a high-quality product. 