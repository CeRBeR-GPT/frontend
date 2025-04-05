import { visit } from "unist-util-visit";
import mermaid from "mermaid";
import type { Parent } from "mdast";
import type { Plugin } from "unified";

export interface RemarkMermaidOptions {
  theme?: string;
}

const remarkMermaid: Plugin<[RemarkMermaidOptions?], any> =
  function remarkMermaid({ theme = "default" } = {}) {
    return (ast) => {
      const instances: [string, number, Parent][] = [];

      visit(ast, { type: "code", lang: "mermaid" }, (node, index, parent) => {
        instances.push([node.value, index as number, parent as Parent]);
      });

      if (!instances.length) {
        return ast;
      }

      const results = instances.map((ins) => {
        const code = ins[0];
        const id = "mermaid" + Math.random().toString(36).slice(2);
        mermaid.initialize({ theme });

        try {
          const content = mermaid.render(id, code);

          return `<pre>${content}</pre>`;
        } catch (err) {
          if (err instanceof Error) {
            return `<pre style="color: red">${err.message}</pre>`;
          }

          return '<pre style="color: red">Unknown error</pre>';
        }
      });

      instances.forEach(([, index, parent], i) => {
        parent.children.splice(index, 1, {
          type: "html",
          value: results[i],
        });
      });
    };
  };

export default remarkMermaid;
