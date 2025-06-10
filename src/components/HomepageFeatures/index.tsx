import type { ReactNode } from "react";
import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

type FeatureItem = {
  title: string;
  titleEn: string;
  Svg: React.ComponentType<React.ComponentProps<"svg">>;
  description: ReactNode;
  descriptionEn: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: "Application Ludique",
    titleEn: "Gamified Experience",
    Svg: require("@site/static/img/undraw_docusaurus_mountain.svg").default,
    description: (
      <>
        TrioSigno transforme l'apprentissage de la LSF en une expérience ludique
        et motivante avec un système de points, de niveaux et de défis.
      </>
    ),
    descriptionEn: (
      <>
        TrioSigno transforms FSL learning into a fun and motivating experience
        with a system of points, levels, and challenges.
      </>
    ),
  },
  {
    title: "IA de Reconnaissance",
    titleEn: "Sign Recognition AI",
    Svg: require("@site/static/img/undraw_docusaurus_tree.svg").default,
    description: (
      <>
        Notre IA reconnaît et évalue vos gestes en temps réel, en vous donnant
        un retour immédiat pour améliorer votre technique.
      </>
    ),
    descriptionEn: (
      <>
        Our AI recognizes and evaluates your gestures in real-time, giving you
        immediate feedback to improve your technique.
      </>
    ),
  },
  {
    title: "Architecture Moderne",
    titleEn: "Modern Architecture",
    Svg: require("@site/static/img/undraw_docusaurus_react.svg").default,
    description: (
      <>
        Développée avec des technologies modernes (React, NestJS, PostgreSQL,
        Docker), TrioSigno offre une expérience fluide et réactive.
      </>
    ),
    descriptionEn: (
      <>
        Developed with modern technologies (React, NestJS, PostgreSQL, Docker),
        TrioSigno offers a smooth and responsive experience.
      </>
    ),
  },
];

function Feature({
  title,
  titleEn,
  Svg,
  description,
  descriptionEn,
}: FeatureItem) {
  const { i18n } = useDocusaurusContext();
  const isEnglish = i18n.currentLocale === "en";

  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{isEnglish ? titleEn : title}</Heading>
        <p>{isEnglish ? descriptionEn : description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
