import { build } from 'vite';
import fs from 'node:fs/promises';

export const existFile = async (path: string) => {
  try {
    return (await fs.stat(path)).isFile();
  } catch {
    return false;
  }
};

(async () => {
  const prettierPluginJavaPkg: Record<string, string> = JSON.parse(
    (
      await fs.readFile('./node_modules/prettier-plugin-java/package.json')
    ).toString('utf-8')
  );

  if (
    await existFile(
      `./dist/${prettierPluginJavaPkg.name}/v${prettierPluginJavaPkg.version}.iife.js`
    )
  ) {
    return;
  }

  await build({
    define: {
      'process.env.NODE_ENV': 'production', // development/production
    },
    build: {
      emptyOutDir: false,
      sourcemap: true,
      rollupOptions: {
        external: ['prettier'],
        output: {
          globals: { prettier: 'prettier' },
        },
      },
      lib: {
        entry: './node_modules/prettier-plugin-java',
        formats: ['iife', 'umd'],
        fileName: (format) => {
          return `prettier-plugin-java/v${prettierPluginJavaPkg.version}.${format}.js`;
        },
        name: `PrettierPluginJava`,
      },
    },
  });
})();
