/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import { TransformHook } from './transform.js';

export default function transform(
  hookName,
  element,
  { document, params: { originalURL }, inventory },
) {
  if (hookName === TransformHook.beforeTransform) {
    // adjust links
    [...document.querySelectorAll('a')].forEach((a) => {
      const href = a.getAttribute('href');
      if (href) {
        try {
          const sourceUrl = new URL(href, inventory.originUrl);
          const siteUrl = inventory.urls.find(({ url }) => url === sourceUrl.href);
          if (siteUrl) {
            // use https://main----.aem.page when inventory.publishUrl is localhost
            const publishUrl = inventory.publishUrl.includes('localhost')
              ? 'https://main----.aem.page'
              : inventory.publishUrl;
            // update href with targetPath and publishUrl
            a.href = new URL(siteUrl.targetPath, publishUrl).href;
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn(`Unable to adjust link ${href}`);
        }
      }
    });
  }
  if (hookName === TransformHook.afterTransform) {
    // adjust anchor links
    if (element.querySelector('a[href^="#"]')) {
      const u = new URL(originalURL);
      const links = element.querySelectorAll('a[href^="#"]');
      for (let i = 0; i < links.length; i += 1) {
        const a = links[i];
        a.href = `${u.pathname}${a.getAttribute('href')}`;
      }
    }
  }
}
