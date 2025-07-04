/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast-util-math').ToOptions} Options
 *
 * @typedef {import('mdast-util-math')} DoNotTouchAsThisImportIncludesMathInTree
 */
import { mathFromMarkdown, mathToMarkdown } from 'mdast-util-math';
import { math } from 'micromark-extension-math-2';

/**
 * Plugin to support math.
 *
 * @this {import('unified').Processor}
 * @type {import('unified').Plugin<[Options?] | void[], Root, Root>}
 */
export default function remarkMath(options = {}) {
  const data = this.data();

  add('micromarkExtensions', math(options));
  add('fromMarkdownExtensions', mathFromMarkdown());
  add('toMarkdownExtensions', mathToMarkdown(options));

  /**
   * @param {string} field
   * @param {unknown} value
   */
  function add(field, value) {
    const list = /** @type {Array<unknown>} */ (
      // Other extensions
      /* c8 ignore next 2 */
      data[field] ? data[field] : (data[field] = [])
    );

    list.push(value);
  }
}
