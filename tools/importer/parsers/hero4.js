/* global WebImporter */
export default function parse(element, { document }) {
  const headerRow = ['Hero'];

  const contentCell = [];

  // Extracting background image
  const backgroundImg = element.querySelector('.background picture img');
  if (backgroundImg) {
    contentCell.push(backgroundImg);
  }

  // Extracting title (mandatory)
  const titleElement = element.querySelector('.title h5');
  if (titleElement) {
    const title = document.createElement('h1'); // Styling as a heading
    title.textContent = titleElement.textContent;
    contentCell.push(title);
  }

  // Extracting subheading (optional)
  const subheadingElement = element.querySelector('.eyebrow');
  if (subheadingElement) {
    const subheading = document.createElement('p');
    subheading.textContent = subheadingElement.textContent;
    contentCell.push(subheading);
  }

  // Extracting description (optional)
  const descriptionElement = element.querySelector('.long-description p');
  if (descriptionElement) {
    contentCell.push(descriptionElement);
  }

  // Create table
  const cells = [headerRow, [contentCell]];
  const blockTable = WebImporter.DOMUtils.createTable(cells, document);

  // Replace original element
  element.replaceWith(blockTable);
}