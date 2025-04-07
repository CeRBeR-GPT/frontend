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
        let code = ins[0];
        
        // Обработка текста внутри квадратных скобок []
        code = code.replaceAll(/\[([^\]]*?)\[([^\]\[]+)\]([^\[]*?)\]/g, (match, prefix, content, suffix) => {
          // Удаляем все внутренние квадратные скобки в тексте
          const cleanedContent = content.replaceAll(/\[|\]/g, '');
          return `[${prefix}${cleanedContent}${suffix}]`;
        });
      
        // Обрабатываем особые случаи:
        // 1. {A[j] > A[j+1]} → {Aj > Aj+1}
        code = code.replaceAll(/{([^{}]*?)\[([^\]\[]+?)\]([^{}]*?)}/g, '{$1$2$3}');
        
        // 2. [j + 1]] → j + 1]
        code = code.replaceAll(/\[([^\]\[]+?)\]\]/g, '$1]');
        
        // 3. [text]} → text}
        code = code.replaceAll(/\[([^\]\[]+?)\]\}/g, '$1}');
        code = code.replace(/\[([a-zA-Zа-яА-Я])\] /g, '$1 ');
        code = code.replaceAll(" { ", " ").replaceAll(" } ", " ").replaceAll("()", " ")
        code = code.replaceAll("{ (", "{").replaceAll(") }", "}")
        
        const id = "mermaid" + Math.random().toString(36).slice(2);
        mermaid.initialize({ theme });

        try {
          const content = mermaid.render(id, code);
          return `<pre>${content}</pre>`;
        } catch (err) {
          let errorMessage = "Ошибка парсинга данных со схемы, результат будет представлен без обработки: ";
          let originalError = "Unknown error";
          let originalCode = code;

          if (err instanceof Error) {
            originalError = err.message;
          } else if (typeof err === "string") {
            originalError = err;
          }

          return `
            <div style="border: 1px solid #ff6b6b; border-radius: 4px; padding: 12px; margin: 8px 0; background-color: #fff5f5;">
              <div style="color: #ff6b6b; font-weight: bold; margin-bottom: 8px;">${errorMessage}</div>
              <div>
                <span style="font-weight: bold;">Исходный код:</span>
                <pre style="margin: 4px 0; padding: 8px; background: #f8f9fa; border-radius: 4px; overflow-x: auto;">${originalCode}</pre>
              </div>
            </div>
          `;
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