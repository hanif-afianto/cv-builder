/**
 * Interface for CV data loading.
 */
export class DataProvider {
  /**
   * Loads all CV data from the source.
   * @returns {Promise<Object>} The CV data.
   */
  async loadData() {
    throw new Error("Method not implemented");
  }
}
