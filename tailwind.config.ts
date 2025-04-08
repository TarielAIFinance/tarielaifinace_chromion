import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class', // Keep dark mode enabled
  theme: {
    extend: {
      // Use colors closer to Google AI Studio's palette
      colors: {
        'google-dark-bg': '#131314',    // Very dark background for sidebars
        'google-content-bg': '#1E1F20', // Slightly lighter bg for main content
        'google-content-highlight': '#2A2B2C', // Slightly lighter than content-bg for gradient start
        'google-input-bg': '#2D2E2F',   // Background for inputs, buttons, AI messages
        'google-border': '#3C3D3E',     // Subtle borders/hovers
        'google-text-light': '#E8EAED', // Primary light text
        'google-text-secondary': '#9AA0A6', // Secondary gray text
        'google-blue': '#8AB4F8',       // Accent blue for links, buttons, highlights
        'google-blue-darker': '#1A73E8', // Darker blue for primary button background
        // Tariel brand colors for user messages
        'brand-purple': '#A061FF',
        'brand-purple-dark-border': '#7045B8', // Example darker purple
        // Define 'primary' for the Loader component
        'primary': '#E8EAED', // Use google-text-light for visibility
      },
      backgroundImage: {
        'elegant-gradient': 'radial-gradient(ellipse at 50% 0%, theme(colors.google-content-highlight), theme(colors.google-content-bg) 70%)',
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config; 