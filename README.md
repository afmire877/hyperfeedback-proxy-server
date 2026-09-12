# Hyperfeedback Proxy Server

Seamlessly integrate Hyperfeedback visual feedback and commenting into any website.

[![Build Status](https://img.shields.io/circleci/project/github/afmire877/hyperfeedback-proxy-server/main.svg?style=flat-square)](https://circleci.com/gh/afmire877/hyperfeedback-proxy-server/tree/main)
[![Code Coverage](https://img.shields.io/codecov/c/github/afmire877/hyperfeedback-proxy-server.svg?style=flat-square)](https://codecov.io/gh/afmire877/hyperfeedback-proxy-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg?style=flat-square)](http://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D16-blue.svg?style=flat-square)](https://nodejs.org/)

Hyperfeedback lets a product team review a live web page in context. This service
looks up a project's target URL, proxies the page, and injects the commenting UI
into HTML responses while streaming other assets unchanged.

This repository is a compact example of full-stack product infrastructure: a
TypeScript/Express gateway, a Vite-built browser client, Supabase-backed project
resolution, HTML transformation, and automated quality checks.

## Engineering case study

**Problem:** Feedback shared in screenshots and chat loses its relationship to the
page element being discussed.

**Approach:** Give each project a proxy subdomain. The server resolves the project,
requests its configured website, and injects the Hyperfeedback interface into HTML.
The browser client records element selectors and positions so discussion remains
attached to the page.

**Important decisions:**

- Keep project identifiers in subdomains so nested site routes continue to work.
- Transform only HTML; stream images, scripts, and other assets without buffering.
- Build the injected client separately with Vite while keeping the proxy typed with
  TypeScript.
- Treat stored target URLs as untrusted input. Targets must use HTTP(S), resolve
  only to public IP addresses, and cannot redirect through the proxy.

**Current trade-offs:** Redirects are returned to the browser rather than followed
because every redirect destination would otherwise require another DNS safety
check. This service also changes framing headers to support the review experience;
only use it for websites you are authorised to review.

## Features

- **Dynamic Website Proxying**: Load configured public websites through the server.
- **Hyperfeedback UI Injection**: Automatically embeds the Hyperfeedback client script into proxied pages.
- **Subdomain-based Project Identification**: Uses subdomains (`<project_id>.p.yourdomain.com`) to associate proxied sites with specific Hyperfeedback projects.
- **Session Management**: Basic session support for persisting context if needed.
- **Target Boundary**: Rejects credentials, non-HTTP protocols, localhost, and
  private or reserved network addresses.
- **Environment Configuration**: Keeps database credentials and the session secret
  outside source control.
- **Comprehensive Tooling**: Includes linters (ESLint), formatters (Prettier), testing frameworks (Ava), and type checking (TypeScript) for a high-quality codebase.
- **Documentation Generation**: Supports API documentation generation using TypeDoc.

## How it Works

1.  A request comes in to a specially formatted URL, like `http://<project_pid>.p.yourdomain.com/path/to/page`.
2.  The server extracts the `project_pid` (Project ID) from the subdomain.
3.  It fetches the target website URL associated with this `project_pid` (e.g., from a Supabase database).
4.  The server then requests the content from the target website.
5.  If the content is HTML, the server injects the Hyperfeedback client-side JavaScript and CSS into the HTML.
6.  The modified HTML is then streamed back to the user's browser, allowing them to interact with both the original site and the Hyperfeedback UI.
7.  The client-side Hyperfeedback script communicates with the main Hyperfeedback application (e.g., via `postMessage` and a backend like Supabase) to load and save comments.

## Prerequisites

- [Node.js](https://nodejs.org/) 16 or newer
- [Yarn](https://yarnpkg.com/) (or npm)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/afmire877/hyperfeedback-proxy-server.git
cd hyperfeedback-proxy-server
```

### 2. Install Dependencies

```bash
yarn install
# OR
# npm install
```

### 3. Set Up Environment Variables

Copy the example environment file and customize it with your actual credentials and settings:

```bash
cp .env.example .env
```

Now, edit the `.env` file. Key variables include:

- `PORT`: The port the server will run on (default: `5000`).
- `SESSION_SECRET`: A long, random value used to sign session cookies.
- `PUBLIC_SUPABASE_URL`: Your Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: Server-side Supabase credential. Prefer a restricted
  key and database policies that expose only the project data this service needs.
- `HF_APP_URL`: The URL of your main Hyperfeedback application (e.g., `http://localhost:3000`). This is used by the server and also by Vite for client-side scripts.
- `NEXT_PUBLIC_PROXY_BASE_URL`: The base domain under which this proxy server will operate. For local development, this could be `localhost:PORT` or a custom domain configured in your hosts file. For production, this would be your public domain (e.g., `hyperfeedback.io`). The proxy works by creating URLs like `<pid>.p.NEXT_PUBLIC_PROXY_BASE_URL`.

Vite will automatically pick up variables prefixed with `VITE_` from the `.env` file. The `.env.example` includes `VITE_HF_APP_URL=${HF_APP_URL}` to ensure the client-side script knows where the Hyperfeedback app is.

### 4. Running the Server

- **Development Mode (with hot reloading for server and client-side library):**

  ```bash
  npm run dev
  ```

  This concurrently runs `npm run js:dev` (which is `tsc && vite build --watch`) and `nodemon` for the server.

- **Production Mode:**

  First, build the server and client-side library:

  ```bash
  npm run build
  ```

  Then, start the server:

  ```bash
  npm start
  ```

  This runs `node build/main/index.js`.

## Usage

Once the server is running and configured:

1.  Ensure you have a project set up in your Hyperfeedback system (e.g., in your Supabase database) with a `pid` (Project ID) and an associated `website_url`.
2.  Access a website through the proxy using a URL like:
    `http://<pid>.p.<NEXT_PUBLIC_PROXY_BASE_URL>/any/path/on/the/target/site`

    For example, if your `NEXT_PUBLIC_PROXY_BASE_URL` is `localhost:5000` and your project `pid` is `project123`, you would use:
    `http://project123.p.localhost:5000/`

    The Hyperfeedback UI should be injected into the proxied page.

The communication between the injected client script and the main Hyperfeedback application (running at `HF_APP_URL`) typically uses `window.postMessage` for cross-origin communication if the main app is in an iframe, or direct API calls if the architecture allows.

## Security model

The proxy validates the final constructed target before each outbound request. DNS
must return at least one address and every returned address must be public. Loopback,
link-local, private, documentation, multicast, and other reserved ranges are
blocked for IPv4 and IPv6. Automatic redirects are disabled.

This reduces server-side request forgery risk, but it is not a complete production
sandbox. A hardened deployment should also use outbound firewall rules, revalidate
redirect destinations if redirect support is added, restrict which users can set
project URLs, rate-limit requests, and cap buffered HTML response sizes.

## Development

This project comes with a suite of scripts to aid in development:

- `npm start`: Starts the server from the build output (for production-like execution).
- `npm run dev`: Starts the server in development mode with Nodemon for server restarts and Vite for client-side library rebuilds on change.
- `npm run build`: Compiles TypeScript for main (CommonJS) and module (ESNext) outputs, and builds the client-side library with Vite.
  - `npm run build:main`: Compiles TypeScript to `build/main` (CommonJS).
  - `npm run build:module`: Compiles TypeScript to `build/module` (ESNext).
  - `npm run build:lib`: Runs `tsc && vite build` for the client library.
- `npm run fix`: Runs Prettier and ESLint to format and fix code.
  - `npm run fix:prettier`: Formats code with Prettier.
  - `npm run fix:lint`: Fixes linting issues with ESLint.
- `npm run test`: Runs all tests (lint, prettier, spelling, unit).
  - `npm run test:lint`: Lints the codebase.
  - `npm run test:prettier`: Checks for Prettier formatting issues.
  - `npm run test:spelling`: Checks for spelling errors using cspell.
  - `npm run test:unit`: Runs unit tests with Ava.
- `npm run cov`: Runs unit tests and generates coverage reports.
- `npm run doc`: Generates API documentation using TypeDoc and attempts to open it.

### Project Structure

```
.
├── build/                  # Compiled output
├── public/                 # Static assets served by Vite (e.g., for client lib dev)
├── src/                    # Source code
│   ├── lib/                # Client-side library (injected into proxied sites)
│   │   ├── utils/
│   │   ├── main.ts         # Main entry for client lib
│   │   └── ui.controller.ts
│   ├── middleware/         # Express middleware
│   ├── routes/             # Express routes (e.g., proxy.ts)
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Server-side utility functions
│   └── index.ts            # Main server entry point
├── .env.example            # Example environment variables
├── .eslintrc.json          # ESLint configuration
├── package.json            # Project metadata and dependencies
├── tsconfig.json           # TypeScript configuration (for main CJS build)
├── tsconfig.module.json    # TypeScript configuration (for ES module build)
├── tsconfig.vite.json      # TypeScript configuration (for Vite client lib build)
└── vite.config.ts          # Vite configuration
```

## Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -am 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Create a new Pull Request.

Please ensure your code adheres to the linting and formatting standards by running `npm run fix` before committing.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
