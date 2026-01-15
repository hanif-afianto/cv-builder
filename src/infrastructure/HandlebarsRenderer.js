import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import { Renderer } from "../core/interfaces/Renderer.js";

export class HandlebarsRenderer extends Renderer {
  constructor(templatesDir = "./templates") {
    super();
    this.templatesDir = templatesDir;
  }

  /**
   * Resolves paths for a specific template type.
   * @param {string} type - Template name.
   * @returns {object} Object containing paths for base, hbs, css, and partials.
   */
  _getTemplatePaths(type) {
    const templateBase = path.join(this.templatesDir, type);
    return {
      base: templateBase,
      hbs: path.join(templateBase, `${type}.hbs`),
      css: path.join(templateBase, "styles", `${type}.css`),
      partials: path.join(templateBase, "partials")
    };
  }

  /**
   * Registers all .hbs files in the template's partials directory.
   * @param {string} partialsDir - Path to the partials directory.
   */
  _registerPartials(partialsDir) {
    if (fs.existsSync(partialsDir)) {
      const partialFiles = fs.readdirSync(partialsDir);
      for (const file of partialFiles) {
        if (file.endsWith(".hbs")) {
          const partialName = file.replace(".hbs", "");
          const partialPath = path.join(partialsDir, file);
          const partialSource = fs.readFileSync(partialPath, "utf8");
          Handlebars.registerPartial(partialName, partialSource);
        }
      }
    }
  }

  /**
   * Loads template source from file.
   * @param {string} filePath
   * @returns {string} Source content.
   * @throws {Error} If template file doesn't exist.
   */
  _loadTemplateSource(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Template not found at: ${filePath}`);
    }
    return fs.readFileSync(filePath, "utf8");
  }

  /**
   * Loads styles from file.
   * @param {string} filePath
   * @returns {string} CSS content or empty string if not found.
   */
  _loadStyles(filePath) {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, "utf8");
    }
    console.warn(`Styles not found at: ${filePath}. Proceeding with empty CSS.`);
    return "";
  }

  async render(type, data) {
    const paths = this._getTemplatePaths(type);

    this._registerPartials(paths.partials);

    Handlebars.registerHelper("phoneDigits", (value) =>
      String(value || "").replace(/\D/g, "")
    );

    const templateSource = this._loadTemplateSource(paths.hbs);
    const css = this._loadStyles(paths.css);

    const template = Handlebars.compile(templateSource);

    return template({
      ...data,
      css
    });
  }
}
