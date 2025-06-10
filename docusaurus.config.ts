import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "TrioSigno Documentation",
  tagline: "Apprendre la langue des signes française de façon ludique",
  favicon: "img/favicon.ico",

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: "https://doc.triosigno.com",
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: "/",

  // GitHub pages deployment config.
  organizationName: "triosigno", // Usually your GitHub org/user name.
  projectName: "docs-triosigno", // Usually your repo name.

  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",

  // Configuration pour l'internationalisation (français et anglais)
  i18n: {
    defaultLocale: "fr",
    locales: ["fr", "en"],
    localeConfigs: {
      fr: {
        htmlLang: "fr",
        label: "Français",
      },
      en: {
        htmlLang: "en",
        label: "English",
      },
    },
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          // Remplacez par votre dépôt GitHub
          editUrl: "https://github.com/EIP-TEK89/trio-signo-fullstack",
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,
          },
          // Remplacez par votre dépôt GitHub
          editUrl: "https://github.com/EIP-TEK89/trio-signo-fullstack",
          // Options utiles pour respecter les meilleures pratiques de blog
          onInlineTags: "warn",
          onInlineAuthors: "warn",
          onUntruncatedBlogPosts: "warn",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/triosigno-social-card.svg",
    navbar: {
      title: "TrioSigno",
      logo: {
        alt: "TrioSigno Logo",
        src: "img/triosigno-logo.svg",
      },
      items: [
        // Documentation
        {
          type: "docSidebar",
          sidebarId: "mainSidebar",
          position: "left",
          label: "Documentation",
        },
        // Blog
        { to: "/blog", label: "Blog", position: "left" },
        // GitHub
        {
          href: "https://github.com/triosigno",
          label: "GitHub",
          position: "right",
        },
        // Sélecteur de langue
        {
          type: "localeDropdown",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Documentation",
          items: [
            {
              label: "Introduction",
              to: "/docs/",
            },
            {
              label: "Frontend",
              to: "/docs/frontend/overview",
            },
            {
              label: "Backend",
              to: "/docs/backend/overview",
            },
            {
              label: "IA",
              to: "/docs/ia/overview",
            },
          ],
        },
        {
          title: "Communauté",
          items: [
            {
              label: "Discord",
              href: "https://discord.gg/triosigno",
            },
            {
              label: "Twitter",
              href: "https://twitter.com/triosigno",
            },
            {
              label: "LinkedIn",
              href: "https://linkedin.com/company/triosigno",
            },
          ],
        },
        {
          title: "Plus",
          items: [
            {
              label: "Blog",
              to: "/blog",
            },
            {
              label: "GitHub",
              href: "https://github.com/triosigno",
            },
            {
              label: "Site Web",
              href: "https://triosigno.com",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} TrioSigno. Construit avec Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
