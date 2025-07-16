import path from "path";
import { fileURLToPath } from "url";
import {
  IdAttributePlugin,
  InputPathToUrlTransformPlugin,
  HtmlBasePlugin,
} from "@11ty/eleventy";
import pluginSyntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import markdownIt from "markdown-it"; // ✅ 1. Add markdown-it

import pluginFilters from "./src/_config/filters.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function (eleventyConfig) {
  // Drafts, see also _data/eleventyDataSchema.js
  eleventyConfig.addPreprocessor("drafts", "*", (data, content) => {
    if (data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
      return false;
    }
  });

  // Copy the contents of the `public` folder to the output folder
  eleventyConfig.addPassthroughCopy({
    "./public/": "/",
  });

  // Watch for changes
  eleventyConfig.addWatchTarget("./src/css/");
  eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpeg}");

  // Plugins
  eleventyConfig.addPlugin(pluginSyntaxHighlight, {
    preAttributes: { tabindex: 0 },
  });
  eleventyConfig.addPlugin(HtmlBasePlugin);
  eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    extensions: "html",
    formats: ["avif", "webp", "auto"],
    defaultAttributes: {
      loading: "lazy",
      decoding: "async",
    },
  });
  eleventyConfig.addPlugin(pluginFilters);
  eleventyConfig.addPlugin(IdAttributePlugin);

  // Global data for locating site config
  eleventyConfig.addGlobalData("siteConfigFilePath", () => {
    const jsonFileAbsolutePath = path.resolve("src/_data/metadata.json");
    const relativePath = path.relative(process.cwd(), jsonFileAbsolutePath);
    return relativePath;
  });

  // ✅ 2. Allow raw HTML inside markdown files (for <img>, etc.)
  eleventyConfig.setLibrary("md", markdownIt({
    html: true
  }));
}

export const config = {
  templateFormats: ["md", "njk", "html", "liquid", "11ty.js"],
  markdownTemplateEngine: "njk",
  htmlTemplateEngine: "njk",
  dir: {
    input: "./src/content",
    includes: "../_includes",
    data: "../_data",
    output: "_site",
  },
};
