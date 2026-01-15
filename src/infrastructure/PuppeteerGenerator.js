import puppeteer from "puppeteer";
import QRCode from "qrcode";
import { DocumentGenerator } from "../core/interfaces/DocumentGenerator.js";

export class PuppeteerGenerator extends DocumentGenerator {
  constructor() {
    super();
    this.qrConfig = {
      errorCorrectionLevel: "H",
      margin: 0,
      scale: 8,
      color: {
        dark: "#cccccc",
        light: "#ffffff"
      },
      displaySize: "6mm"
    };
    this.margins = {
      top: "20mm",
      bottom: "20mm",
      left: "15mm",
      right: "15mm"
    };
  }

  /**
   * Generates a unique QR ID.
   * @returns {string} Unique ID with format PRYYYYMMDDThhmmss-SALT
   */
  _generateQRID() {
    const now = new Date();
    const datePart = now.getFullYear() + 
                     String(now.getMonth() + 1).padStart(2, "0") + 
                     String(now.getDate()).padStart(2, "0");
    const timePart = String(now.getHours()).padStart(2, "0") + 
                     String(now.getMinutes()).padStart(2, "0") + 
                     String(now.getSeconds()).padStart(2, "0");
    const salt = Math.floor(Math.random() * 0x1000).toString(16).toUpperCase().padStart(3, "0");
    return `CLI${datePart}T${timePart}-${salt}`;
  }

  /**
   * Generates a base64 QR code data URL.
   * @param {string} qrID
   * @returns {Promise<string>}
   */
  async _generateQRCode(qrID) {
    return await QRCode.toDataURL(qrID, {
      errorCorrectionLevel: this.qrConfig.errorCorrectionLevel,
      margin: this.qrConfig.margin,
      scale: this.qrConfig.scale,
      color: this.qrConfig.color
    });
  }

  /**
   * Returns the HTML template for the PDF header.
   * @param {string} qrCodeDataURL
   * @returns {string}
   */
  _getHeaderTemplate(qrCodeDataURL) {
    const size = this.qrConfig.displaySize;
    return `
      <div style="width: 100%; padding: 5mm 0 0 0; display: flex; justify-content: space-between; print-color-adjust: exact;">
        <div style="margin-left: 15mm; width: ${size}; height: ${size};"><img src="${qrCodeDataURL}" style="width: ${size}; height: ${size}; display: block;"/></div>
        <div style="margin-right: 15mm; width: ${size}; height: ${size};"><img src="${qrCodeDataURL}" style="width: ${size}; height: ${size}; display: block;"/></div>
      </div>
    `;
  }

  /**
   * Returns the HTML template for the PDF footer.
   * @param {string} qrCodeDataURL
   * @returns {string}
   */
  _getFooterTemplate(qrCodeDataURL) {
    const size = this.qrConfig.displaySize;
    return `
      <div style="width: 100%; font-size: 9px; padding: 0 0 5mm 0; display: flex; justify-content: space-between; align-items: flex-end; font-family: 'Inter', sans-serif; color: #cccccc; print-color-adjust: exact;">
        <div style="margin-left: 15mm; width: ${size}; height: ${size};"><img src="${qrCodeDataURL}" style="width: ${size}; height: ${size}; display: block;"/></div>
        <div style="margin-right: 15mm; text-transform: uppercase;">
          <span class="title"></span><span style="margin: 0 40px;">|</span><span class="pageNumber"></span>&nbsp;<span style="text-transform: lowercase;">of</span>&nbsp;<span class="totalPages"></span>
        </div>
      </div>
    `;
  }

  async generate(html, outputPath) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "networkidle0" });

    const qrID = this._generateQRID();
    const qrCodeDataURL = await this._generateQRCode(qrID);

    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: this._getHeaderTemplate(qrCodeDataURL),
      footerTemplate: this._getFooterTemplate(qrCodeDataURL),
      margin: this.margins
    });

    await browser.close();
  }
}
