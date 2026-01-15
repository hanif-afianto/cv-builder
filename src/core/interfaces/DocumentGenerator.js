/**
 * Interface for generating final documents from HTML.
 */
export class DocumentGenerator {
  /**
   * Generates a PDF from the provided HTML.
   * @param {string} html The HTML content to convert.
   * @param {string} outputPath The path to save the generated PDF.
   * @returns {Promise<void>}
   */
  async generate(html, outputPath) {
    throw new Error("Method not implemented");
  }
}
