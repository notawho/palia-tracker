# Palia Tracker

Simple project that tracks various changes in [Palia](https://palia.com)

## About project status

The project is **archived**, there are no plans to update the project. The code is presented "as is", no support is provided.

## Introduction

This project was made for Node.js 20, however it can be used with Node.js >=17.

## Building docker image

1. Make sure that docker is installed
2. Run `docker build -t tag .` (replace `tag` with your image name)

## Scripts

- `npm run lint` - run eslint task to check is everything ok
- `npm run dev` - run `src/index.ts` in development mode (using ts-node)
- `npm run build` - build `src/**.ts` files into `dist/**.js`
- `npm run start` - run built `dist/index.js`

## Modules

### Production modules

- `@starkow/logger` - fancy console logger
- `common-tags` - misc string utilities
- `dotenv` - parse .env file
- `puregram` - Telegram bot framework
- `ioredis` - Redis client
- `node-cron` - Cronjob handling

### Development modules

- `eslint` - [standardjs](https://standardjs.com/) config with custom rules
- `husky` - git hooks to avoid "style: lint" commits with lint fixes
- `typescript` - used for compiling .ts files
- `ts-node` - used for development
