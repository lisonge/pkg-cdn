import { build } from 'vite';
import fs from 'node:fs/promises';

export const existFile = async (path: string) => {
  try {
    return (await fs.stat(path)).isFile();
  } catch {
    return false;
  }
};

const processObj = {
  env: {
    NODE_ENV: 'production', // development/production
  },
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
    // return;
  }

  await build({
    plugins: [
      {
        name: 'fix_process',
        transform(code, id) {
          if (
            id.endsWith('/node_modules/java-parser/src/utils.js') &&
            code.includes('process')
          ) {
            return {
              code: [code, ';globalThis.process = globalThis.process;'].join(
                '\n'
              ),
              map: null,
            };
          }
          return;
        },
      },
    ],
    define: {
      'process.env.NODE_ENV': JSON.stringify(processObj.env.NODE_ENV),
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
