# Project Tooling & Convention Summary

## Dependencies

- @google-cloud/bigquery: ^6.2.0
- axios: ^1.6.0
- dotenv: ^16.3.1
- firebase-admin: ^11.11.0
- pg: ^8.11.3
- zod: ^3.22.4

## Dev Dependencies

- @types/jest: ^29.5.6
- @types/node: ^20.8.0
- @types/pg: ^8.10.7
- @typescript-eslint/eslint-plugin: ^6.9.0
- @typescript-eslint/parser: ^6.9.0
- eslint: ^8.52.0
- husky: ^8.0.3
- jest: ^29.7.0
- lint-staged: ^15.2.0
- prettier: ^3.0.3
- ts-jest: ^29.1.1
- ts-node: ^10.9.1
- typescript: ^5.2.2

## NPM Scripts

- build: tsc
- dev: ts-node scripts/
- start: node dist/
- test: jest
- lint: eslint . --ext .ts
- format: prettier --write .
- validate: npm run lint && npm run test && npm run build
- prepare: husky install
- summarize: ts-node scripts/generate_summary.ts
- mindpal: ts-node scripts/mindpal_integration.ts
- mindpal:setup: ts-node scripts/mindpal_integration.ts setup
- mindpal:health: ts-node scripts/mindpal_integration.ts health
- mindpal:validate: ts-node scripts/mindpal_integration.ts validate
- deerflow: ts-node scripts/deerflow_integration.ts
- deerflow:setup: ts-node scripts/deerflow_integration.ts setup
- deerflow:health: ts-node scripts/deerflow_integration.ts health
- deerflow:workflow: ts-node scripts/deerflow_integration.ts workflow
- render: ts-node scripts/render_integration.ts
- render:deploy: ts-node scripts/render_integration.ts deploy
- render:health: ts-node scripts/render_integration.ts health
- render:services: ts-node scripts/render_integration.ts services
- make: ts-node scripts/make_integration.ts
- make:setup: ts-node scripts/make_integration.ts setup
- make:health: ts-node scripts/make_integration.ts health
- make:scenario: ts-node scripts/make_integration.ts scenario
- make:webhook: ts-node scripts/make_integration.ts webhook

## Lint-staged

- *.ts: eslint --fix, prettier --write, jest --bail --findRelatedTests
- *.{js,json,md}: prettier --write

## Husky/Pre-commit

#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged 

## Scripts Directory

bigquery_ingest.ts
deerflow_integration.ts
deploy_render.sh
firebase_push.ts
generate_summary.ts
make_integration.ts
mindpal_integration.ts
neon_sync.ts
render_integration.ts

## Data Doctrine

# Data Doctrine & Schema Enforcement

## Overview

This document defines the **Data Doctrine** for the Cursor Blueprint Enforcer system. All data operations must conform to these schemas and rules to ensure consistency across Neon (PostgreSQL), Firebase (Firestore), BigQuery databases, and MindPal AI agents.

## 🎯 Core Principles

1. **Schema-First Development**: All data structures are defined in Zod schemas before implementation
2. **Cross-Database Consistency**: Data must be valid for all three databases simultaneously
3. **AI-Enhanced Validation**: MindPal agents provide additional validation and suggestions
4. **Validation at Every Step**: Data is validated before any database operation
5. **Type Safety**: Full TypeScript support with runtime validation
6. **Automated Enforcement**: Pre-commit hooks and CI/CD ensure compliance

## 📊 Database Schema Requirements

### Base Blueprint Schema (Common Fields)

All blueprints must include these core fields:

```typ
... (truncated)

---
Generated automatically by scripts/generate_summary.ts