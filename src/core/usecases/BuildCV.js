/**
 * UseCase that orchestrates the CV generation process.
 */
export class BuildCV {
  /**
   * @param {Object} dependencies
   * @param {import('../interfaces/DataProvider').DataProvider} dependencies.dataProvider
   * @param {import('../interfaces/Renderer').Renderer} dependencies.renderer
   * @param {import('../interfaces/DocumentGenerator').DocumentGenerator} dependencies.documentGenerator
   */
  constructor({ dataProvider, renderer, documentGenerator }) {
    this.dataProvider = dataProvider;
    this.renderer = renderer;
    this.documentGenerator = documentGenerator;
  }

  /**
   * Executes the CV build process.
   * @param {Object} params
   * @param {string} params.type The template type.
   * @param {string} params.outputPath The path to save the PDF.
   */
  async execute({ type, outputPath }) {
    const data = await this.dataProvider.loadData();
    const html = await this.renderer.render(type, data);
    await this.documentGenerator.generate(html, outputPath);
  }
}
