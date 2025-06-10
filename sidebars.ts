import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  mainSidebar: [
    "intro",
    {
      type: "category",
      label: "Démarrage Rapide",
      link: {
        type: "generated-index",
        title: "Démarrage Rapide",
        description: "Apprenez à installer et configurer TrioSigno rapidement",
      },
      items: ["getting-started/installation", "getting-started/configuration"],
    },
    {
      type: "category",
      label: "FAQ",
      link: {
        type: "doc",
        id: "faq/general",
      },
      items: [
        "faq/general",
        "faq/frontend",
        "faq/backend",
        "faq/ai",
        "faq/troubleshooting",
      ],
    },
    {
      type: "category",
      label: "Frontend",
      link: {
        type: "doc",
        id: "frontend/overview",
      },
      items: ["frontend/overview", "frontend/architecture", "frontend/testing"],
    },
    {
      type: "category",
      label: "Backend",
      link: {
        type: "doc",
        id: "backend/overview",
      },
      items: ["backend/overview", "backend/api-endpoints", "backend/database"],
    },
    {
      type: "category",
      label: "IA",
      link: {
        type: "doc",
        id: "ia/overview",
      },
      items: ["ia/overview"],
    },
    {
      type: "category",
      label: "Déploiement",
      link: {
        type: "generated-index",
        title: "Déploiement",
        description: "Documentation sur le déploiement de TrioSigno",
      },
      items: [
        "deployment/docker-compose",
        "deployment/ci-cd",
        "deployment/monitoring",
      ],
    },
    {
      type: "category",
      label: "Contribution",
      link: {
        type: "generated-index",
        title: "Contribution",
        description: "Comment contribuer au projet TrioSigno",
      },
      items: ["contribution/code-guidelines"],
    },
  ],
};

export default sidebars;
