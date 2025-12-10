import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  
  test: {
    // Configuración para CI/CD
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    
    // Resolver problemas de ES modules con jsdom
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    
    // Cobertura de código
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'dist/',
        'src/main.tsx',
        'src/vite-env.d.ts'
      ],
      // Thresholds para quality gate
      lines: 70,
      functions: 70,
      branches: 70,
      statements: 70
    },
    
    // Reportes para Jenkins
    reporters: ['default', 'junit', 'html'],
    outputFile: {
      junit: './test-results/junit.xml',
      html: './test-results/index.html'
    },
    
    // Timeouts
    testTimeout: 10000,
    hookTimeout: 10000
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
