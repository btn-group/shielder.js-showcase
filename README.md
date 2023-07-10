# ShielderJS SHOWCASE APP

## How to run

1. Create .env file and set required variables

```sh
NEXT_PUBLIC_DEFAULT_CHAIN=development
```

2. Update src/constants/index.ts

```sh
# Get from zk-apps/shielder/deploy/addresses.json
export const SHIELDER_CONTRACT_ADDRESS = '';
export const TOKEN_CONTRACT_ADDRESS = '';
```

3. Set depositWASMJSON.leaf_idx in src/pages/new.tsx

4. Build & run

```sh
npm install && npm run dev
```
