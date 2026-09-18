import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parentA: "#2563eb",
        parentB: "#db2777",
      },
    },
  },
  plugins: [],
};
export default config;
