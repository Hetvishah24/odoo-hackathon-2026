const PAGE_MARGIN = 36;

export interface ExportPdfOptions {
  /** File name, including the .pdf extension. */
  filename: string;
  /** Rendered as a native PDF heading above the captured content. */
  title?: string;
}

/**
 * Renders a DOM node to an image (preserving whatever theme/colors are currently on
 * screen) and lays it into an A4 PDF, paginating if the content is taller than one page.
 * Elements marked `data-pdf-ignore` (e.g. the export button itself, row action menus)
 * are excluded from the capture.
 */
export async function exportNodeToPdf(node: HTMLElement, options: ExportPdfOptions): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const backgroundColor = getComputedStyle(document.body).backgroundColor || "#ffffff";

  const canvas = await html2canvas(node, {
    scale: 2,
    useCORS: true,
    backgroundColor,
    ignoreElements: (element) => (element as HTMLElement).dataset?.pdfIgnore === "true",
  });

  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  let cursorY = PAGE_MARGIN;

  if (options.title) {
    pdf.setFontSize(15);
    pdf.setTextColor(15, 15, 15);
    pdf.text(options.title, PAGE_MARGIN, cursorY);
    cursorY += 18;
  }

  pdf.setFontSize(9);
  pdf.setTextColor(130, 130, 130);
  pdf.text(`Generated ${new Date().toLocaleString()}`, PAGE_MARGIN, cursorY);
  cursorY += 18;

  const contentWidth = pageWidth - PAGE_MARGIN * 2;
  const imgHeight = (canvas.height * contentWidth) / canvas.width;
  const imageData = canvas.toDataURL("image/jpeg", 0.92);

  let position = cursorY;
  pdf.addImage(imageData, "JPEG", PAGE_MARGIN, position, contentWidth, imgHeight);

  let shown = pageHeight - cursorY;
  while (shown < imgHeight) {
    pdf.addPage();
    position = PAGE_MARGIN - shown;
    pdf.addImage(imageData, "JPEG", PAGE_MARGIN, position, contentWidth, imgHeight);
    shown += pageHeight - PAGE_MARGIN;
  }

  pdf.save(options.filename);
}
