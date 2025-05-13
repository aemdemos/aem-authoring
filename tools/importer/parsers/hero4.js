/* global WebImporter */
export default function parse(element, { document }) {
  // Extract relevant content
  const backgroundImage = element.querySelector('picture img')?.src;
  const eyebrow = element.querySelector('.eyebrow')?.textContent;
  const title = element.querySelector('.title h5')?.textContent;
  const description = element.querySelector('.long-description p')?.textContent;

  // Create rows for the block table
  const rows = [
    ['Hero'], // Header row
    [
      (() => {
        const content = [];
        if (backgroundImage) {
          const img = document.createElement('img');
          img.src = backgroundImage;
          content.push(img);
        }
        if (eyebrow) content.push(document.createTextNode(eyebrow));
        if (title) {
          const heading = document.createElement('h1');
          heading.textContent = title;
          content.push(heading);
        }
        if (description) content.push(document.createTextNode(description));

        return content;
      })(),
    ],
  ];

  // Create the block table
  const block = WebImporter.DOMUtils.createTable(rows, document);

  // Replace the original element
  element.replaceWith(block);
}