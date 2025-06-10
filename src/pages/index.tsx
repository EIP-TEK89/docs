import type { ReactNode } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import Heading from "@theme/Heading";
import { translate } from "@docusaurus/Translate";

import styles from "./index.module.css";

function HomepageHeader() {
  const { siteConfig, i18n } = useDocusaurusContext();
  const isEnglish = i18n.currentLocale === "en";

  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro"
          >
            {isEnglish ? "Get Started" : "Commencer"} 🚀
          </Link>
          <Link
            className="button button--outline button--lg button--secondary"
            style={{ marginLeft: "12px" }}
            to="https://triosigno.com"
          >
            {isEnglish ? "Visit Website" : "Visiter le site web"} 🌐
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const { siteConfig, i18n } = useDocusaurusContext();
  const isEnglish = i18n.currentLocale === "en";

  return (
    <Layout
      title={isEnglish ? "TrioSigno Documentation" : "Documentation TrioSigno"}
      description={
        isEnglish
          ? "Learn French Sign Language with gamification"
          : "Apprenez la langue des signes française de façon ludique"
      }
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
