# JAM-N

# Decentralized Music Discovery & Beat Marketplace

JAM'N is a specialized, community-driven music discovery web application and B2C multi-vendor e-commerce marketplace built specifically for independent South African artists, producers, and music consumers.

The platform bridges the gap between emerging local talent and global audiences by combining modern social engagement loops with direct-to-fan beat licensing and commercial monetization.

- **Figma UI/UX Design System:** [View Design Prototype](https://www.figma.com/design/wZBJ5r5cWHu22gxKfd9NJU/JAM-N?node-id=0-1&t=xn3PHMyqmVs1pjpk-1)
- **Project Documentation:** [View Project Proposal Document](./docs/Project-Proposal-JAM'N.pdf)

---

## Technical Architecture & Tech Stack

The application is engineered as a modern Single Page Application (SPA) focusing on high reactivity, modular component design, and seamless state synchronization.

- **Core Framework:** Vue 3 (Composition API)
- **Build Tooling:** Vite for lightning-fast hot module replacement (HMR) and optimized production builds
- **Routing:** Vue Router for dynamic client-side view management and guarded routes
- **State Management:** Pinia for centralized, modular reactive stores (managing user sessions, audio player states, carts, and artist data)
- **Styling & Assets:** Custom modern CSS architecture, dynamic SVG trend charts, and responsive UI components
- **Payment Gateway Integration:** Integrated Payfast transaction processing flow for secure checkout handling

---

## Key System Modules & Features

- **Discover Feed:** A real-time, social-style stream allowing users to explore tracks, view creator updates, interact with audio snippets, and engage with community posts.
- **Beat Store & Licensing E-Commerce:** A dedicated multi-vendor marketplace where producers list instrumental beats with flexible licensing tier controls (non-exclusive vs. exclusive rights) and streamlined cart management.
- **Interactive Audio Player:** A persistent bottom-bar audio engine handling playback states, track queuing, and continuous navigation across views.
- **Artist & Public Profiles:** Dedicated creator spaces featuring dynamic tracklists, bio management, social metrics, and follower dynamics.
- **Curated Events Discovery:** A localized events module for exploring upcoming independent music festivals, live gigs, and cultural showcases.

---

## Project Structure

```text
JAM-N/
├── Frontend/
│   ├── public/             # Static assets, images, audio and icons
│   ├── src/
│   │   ├── components/     # Reusable UI elements (Common, Modals, Audio Engine)
│   │   ├── router/         # Vue Router configuration
│   │   ├── stores/         # Pinia state stores (artists, playback, commerce)
│   │   ├── views/          # Page-level components (Discover, Profile, Store, Events)
│   │   ├── App.vue         # Root application layout
│   │   └── main.js         # Application entry point
│   ├── package.json        # Dependencies and build scripts
│   └── vite.config.js      # Vite configuration
├── docs/                   # Project proposal & documentation assets
└── README.md
```

---

## Local Development & Setup

### Prerequisites

- Node.js (v16+ recommended)
- npm or yarn package manager

### Installation & Execution Guide

1. Clone the repository:
   ```bash
   git clone [https://github.com/totoseahlumile-dot/JAM-N.git](https://github.com/totoseahlumile-dot/JAM-N.git)
   cd JAM-N
   ```
