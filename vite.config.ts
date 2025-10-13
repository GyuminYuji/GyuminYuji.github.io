// import { defineConfig } from "vite"
// import react from "@vitejs/plugin-react"
// import svgr from "vite-plugin-svgr"
// import fs from "fs"

// import pkg from "./package.json"
// import { createHtmlPlugin } from "vite-plugin-html"
// import {
//   GROOM_FULLNAME,
//   BRIDE_FULLNAME,
//   WEDDING_DATE,
//   LOCATION,
// } from "./src/const"

// const distFolder = "build"

// let base = "/"

// try {
//   const url = new URL(pkg.homepage)
//   base = url.pathname
// } catch (e) {
//   base = pkg.homepage || "/"
// }

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [
//     react(),
//     svgr(),
//     createHtmlPlugin({
//       inject: {
//         data: {
//           GROOM_FULLNAME,
//           BRIDE_FULLNAME,
//           DESCRIPTION: `${WEDDING_DATE.format("M월 D일 A h시 mm분")} ${LOCATION}`,
//         },
//       },
//     }),
//     {
//       name: "manifest-inject",
//       writeBundle() {
//         const content = fs.readFileSync("public/manifest.json", "utf-8")
//         const processed = content
//           .replace(/<%= GROOM_FULLNAME %>/g, GROOM_FULLNAME)
//           .replace(/<%= BRIDE_FULLNAME %>/g, BRIDE_FULLNAME)
//         fs.writeFileSync(`${distFolder}/manifest.json`, processed)
//       },
//     },
//   ],
//   server: { port: 3000 },
//   build: { outDir: distFolder },
//   base,
// })


import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import svgr from "vite-plugin-svgr"
import fs from "fs"
import pkg from "./package.json"
import { createHtmlPlugin } from "vite-plugin-html"
import {
  GROOM_FULLNAME,
  BRIDE_FULLNAME,
  WEDDING_DATE,
  LOCATION,
} from "./src/const"

const distFolder = "build"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  console.log(`[Vite config] Current mode: ${mode}`);
  // 개발 모드일 때는 base를 '/', 프로덕션 모드일 때는 package.json의 homepage 경로를 사용합니다.
  const base = mode === "production" ? new URL(pkg.homepage).pathname : "/"

  console.log(`[Vite config] Calculated base: ${base}`);

  return {
    base, // 계산된 base 경로를 적용합니다.
    plugins: [
      react(),
      svgr(),
      createHtmlPlugin({
        inject: {
          data: {
            GROOM_FULLNAME,
            BRIDE_FULLNAME,
            DESCRIPTION: `${WEDDING_DATE.format(
              "M월 D일 A h시 mm분",
            )} ${LOCATION}`,
          },
        },
      }),
      {
        name: "manifest-inject",
        // build 시에만 동작하도록 apply 속성 추가
        apply: "build",
        writeBundle() {
          const manifestPath = `${distFolder}/manifest.json`
          if (fs.existsSync(manifestPath)) {
            const content = fs.readFileSync(manifestPath, "utf-8")
            const processed = content
              .replace(/<%= GROOM_FULLNAME %>/g, GROOM_FULLNAME)
              .replace(/<%= BRIDE_FULLNAME %>/g, BRIDE_FULLNAME)
            fs.writeFileSync(manifestPath, processed)
          }
        },
      },
    ],
    server: { port: 3000 },
    build: { outDir: distFolder },
  }
})