# TrioSigno Documentation

This repository contains the official documentation for TrioSigno, an innovative application for learning French Sign Language (FSL) with a gamified system.

## About TrioSigno

TrioSigno is a fullstack application that allows users to learn French Sign Language in a fun and interactive way. The application uses a gamified approach to keep users motivated and engaged throughout their learning journey.

## Technologies

- **Frontend**: React, TypeScript
- **Backend**: NestJS, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **AI**: Python, based on Google's hand models
- **Deployment**: Docker, Docker Compose
- **CI/CD**: GitHub Actions
- **Testing**: Playwright (frontend), Jest (backend)

## Documentation Structure

The documentation is organized into the following sections:

- **Getting Started**: Installation and configuration guides
- **Frontend**: Frontend architecture, components, and state management
- **Backend**: Backend architecture, API endpoints, and database
- **AI**: AI model architecture, training, and inference
- **Deployment**: Docker Compose setup, CI/CD, and monitoring
- **Contribution**: Code guidelines, pull requests, and bug reports

## Running the Documentation Locally

This documentation is built using [Docusaurus 3](https://docusaurus.io/).

### Prerequisites

- Node.js (version 18 or above)
- npm or yarn

### Installation

```bash
npm install
# or
yarn
```

### Local Development

```bash
npm run start
# or
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```bash
npm run build
# or
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

The documentation is automatically deployed to [docs.triosigno.com](https://docs.triosigno.com/) through GitHub Actions when changes are pushed to the main branch.

## Contributing

Contributions to the TrioSigno documentation are welcome! Please see our [contribution guidelines](https://docs.triosigno.com/docs/contribution/code-guidelines) for more information.

## License

This documentation is licensed under the MIT License.

## Contact

For questions or support, please join our [Discord server](https://discord.gg/triosigno) or open an [issue on GitHub](https://github.com/triosigno/docs-triosigno/issues).
