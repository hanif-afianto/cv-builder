#!/usr/bin/env node
import { Command } from "commander";
import { BuildCV } from "./core/usecases/BuildCV.js";
import { YamlDataProvider } from "./infrastructure/YamlDataProvider.js";
import { HandlebarsRenderer } from "./infrastructure/HandlebarsRenderer.js";
import { PuppeteerGenerator } from "./infrastructure/PuppeteerGenerator.js";

/**
 * Format a string to be URL/filename friendly.
 * @param {string} str 
 * @returns {string}
 */
const slugify = (str) => {
  return (str || "")
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("-")
    .replace(/[^a-zA-Z0-9-]/g, "");
};

/**
 * Generates a consistent timestamp for filenames.
 * @returns {string} YYYYMMDDThhmmss
 */
const getTimestamp = () => {
  const now = new Date();
  return now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    "T" +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0");
};

/**
 * Generates a standardized CV filename.
 * @param {string} name - Profile name.
 * @param {string} template - Template name used.
 * @returns {string} Formatted filename.
 */
const formatFilename = (name, template) => {
  const namePart = slugify(name) || "CV";
  const templatePart = slugify(template);
  return `CV-${templatePart}_${namePart}_${getTimestamp()}.pdf`;
};

/**
 * Main build action handler.
 */
const handleBuildAction = async (options) => {
  // 1. Dependency Assembly
  const dataProvider = new YamlDataProvider();
  const renderer = new HandlebarsRenderer();
  const documentGenerator = new PuppeteerGenerator();

  const buildCV = new BuildCV({
    dataProvider,
    renderer,
    documentGenerator
  });

  try {
    // 2. Data Loading & Filename Preparation
    const data = await dataProvider.loadData();
    if (!data.profile || !data.profile.name) {
      throw new Error("Invalid data: 'profile.name' is required.");
    }

    const outputPath = formatFilename(data.profile.name, options.template);

    // 3. Execution
    await buildCV.execute({
      type: options.template,
      outputPath
    });

    console.log(`✅ CV generated: ${outputPath}`);
  } catch (error) {
    console.error(`❌ FAILED: ${error.message}`);
    process.exit(1);
  }
};

// 4. CLI Configuration
const program = new Command();

program
  .name("cv")
  .description("CLI tool to generate professional CVs from YAML data")
  .version("1.1.0")
  .option("-t, --template <type>", "template name (e.g., creative, ats)", "creative")
  .action(handleBuildAction);

try {
  program.parse();
} catch (error) {
  console.error(`❌ CLI Error: ${error.message}`);
  process.exit(1);
}
