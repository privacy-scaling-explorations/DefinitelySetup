<p align="center">
    <h1 align="center">
        DefinitelySetup frontend 🌵
    </h1>
    <p align="center">The frontend for DefinitelySetup.</p>
</p>

<div align="center">
    <h4>
        <a href="https://github.com/privacy-scaling-explorations/DefinitelySetup/blob/main/CONTRIBUTING.md">
            👥 Contributing
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="https://github.com/privacy-scaling-explorations/DefinitelySetup/blob/main/CODE_OF_CONDUCT.md">
            🤝 Code of conduct
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="https://discord.gg/sF5CT5rzrR">
            🗣️ Chat &amp; Support
        </a>
    </h4>
</div>

| This folder contains the frontend code for DefinitelySetup. DefinitelySetup is a product designed to run and monitor Trusted Setup ceremonies for groth16 based snarks. |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |


## 🛠 Installation

### pnpm

First, ensure **pnpm** is installed on your machine.

```bash
npm install -g pnpm
```

Then, install required dependencies with:

```bash
pnpm install
```

## 📜 Usage

### Local Development

**Prerequisities**

-  Node.js version 16.0 or higher.
-  pnpm version 8.6.7 or higher.

Copy the `.default.env` file to `.env`:

```bash
cp .env.default .env
```

And add your environment variables.

### Build

Run:

```bash
pnpm build
```

### Start development server

```bash
pnpm dev
```