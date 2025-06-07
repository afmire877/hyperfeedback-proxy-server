type ImportMetaEnv = {
  readonly VITE_HF_APP_URL: string;
};

type ImportMeta = {
  readonly env: ImportMetaEnv;
};

export {}; // Ensure this is treated as a module
