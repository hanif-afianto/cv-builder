import fs from "fs";
import yaml from "js-yaml";
import path from "path";
import { DataProvider } from "../core/interfaces/DataProvider.js";

export class YamlDataProvider extends DataProvider {
  constructor(options = "./data") {
    super();
    const opts = typeof options === "string" ? { baseDir: options } : options;

    this.baseDir = opts.baseDir || "./data";
    this.contentDir = opts.contentDir || path.join(this.baseDir, "content");
    this.assetsDir = opts.assetsDir || path.join(this.baseDir, "assets");
    this.files = opts.files !== undefined ? opts.files : null;
    this.photoFile = opts.photoFile !== undefined ? opts.photoFile : "profile.jpeg";
  }

  /**
   * Discovers YAML files in the specified directory.
   * @param {string} contentPath
   * @returns {string[]} List of filenames to load.
   */
  _getFilesToLoad(contentPath) {
    if (this.files) return this.files;
    
    if (fs.existsSync(contentPath)) {
      return fs.readdirSync(contentPath)
        .filter(file => (file.endsWith(".yaml") || file.endsWith(".yml")) && !file.includes(".example."));
    }
    
    return [];
  }

  /**
   * Loads and parses a single YAML file.
   * @param {string} filePath
   * @returns {object|null} Parsed YAML content or null if failed.
   */
  _loadYamlFile(filePath) {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf8");
      return yaml.load(content);
    }
    return null;
  }

  /**
   * Loads the profile photo and appends it to the result object as a base64 string.
   * @param {object} result - The data object to append the photo to.
   * @param {string} assetsPath - The path to look for the photo.
   */
  _appendPhotoData(result, assetsPath) {
    if (!this.photoFile) return;

    const photoPath = path.join(assetsPath, this.photoFile);
    if (fs.existsSync(photoPath)) {
      const photoBuffer = fs.readFileSync(photoPath);
      const photoBase64 = photoBuffer.toString("base64");
      const dataUrl = `data:image/jpeg;base64,${photoBase64}`;

      if (result.profile) {
        result.profile.photo = dataUrl;
      } else {
        result.photo = dataUrl;
      }
    }
  }

  async loadData() {
    const result = {};
    const contentPath = fs.existsSync(this.contentDir) ? this.contentDir : this.baseDir;
    const assetsPath = fs.existsSync(this.assetsDir) ? this.assetsDir : this.baseDir;

    const filesToLoad = this._getFilesToLoad(contentPath);

    for (const file of filesToLoad) {
      const filePath = path.join(contentPath, file);
      const data = this._loadYamlFile(filePath);
      if (data) {
        const key = path.basename(file, path.extname(file));
        result[key] = data;
      }
    }

    this._appendPhotoData(result, assetsPath);

    return result;
  }
}
