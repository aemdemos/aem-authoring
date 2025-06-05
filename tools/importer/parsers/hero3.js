/* global WebImporter */
export default function parse(element, { document }) {
  // Find the picture (background image) element
  const picture = element.querySelector('picture');

  // Find the title: it is the <p> after the <picture>
  let titleText = '';
  if (picture && picture.parentElement && picture.parentElement.parentElement) {
    const ps = Array.from(picture.parentElement.parentElement.querySelectorAll('p'));
    // Find the <p> containing the <picture>
    const picIdx = ps.findIndex(p => p.contains(picture));
    // The next <p> should be the title
    if (picIdx !== -1 && ps[picIdx + 1]) {
      titleText = ps[picIdx + 1].textContent.trim();
    }
  }
  // Create a heading element for the title
  let heading = null;
  if (titleText) {
    heading = document.createElement('h1');
    heading.textContent = titleText;
  }
  // Build the rows as required
  const rows = [
    ['Hero'],
    [picture],
    [heading]
  ];
  const table = WebImporter.DOMUtils.createTable(rows, document);
  element.replaceWith(table);
}
