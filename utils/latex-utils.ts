/**
 * Utility functions for handling LaTeX formulas
 */

// Function to clean and normalize LaTeX formulas from various formats
export const cleanLatexFormula = (formula: string): string => {
    if (!formula) return formula
  
    // Handle string literal representations of line breaks and escaped characters
    let cleaned = formula
      // Replace literal \n with spaces
      .replace(/\\n/g, " ")
      // Handle array-like strings ['[...]'] or ["[...]"]
      .replace(/^\s*\[['"]?\s*\[/g, "$$")
      .replace(/\]\s*['"]?\]\s*$/g, "$$")
      // Remove extra backslashes from escaped sequences
      .replace(/\\\\([^\\])/g, "\\$1")
      // Remove any remaining line breaks
      .replace(/\n/g, " ")
      // Normalize spaces
      .replace(/\s+/g, " ")
      .trim()
  
    // Ensure proper delimiters
    if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
      cleaned = "$$" + cleaned.slice(1, -1) + "$$"
    } else if (cleaned.startsWith("\\[") && cleaned.endsWith("\\]")) {
      cleaned = "$$" + cleaned.slice(2, -2) + "$$"
    } else if (cleaned.startsWith("$$") && cleaned.endsWith("$$")) {
      cleaned = "$" + cleaned.slice(2, -2) + "$"
    } else if (!cleaned.startsWith("$")) {
      // If no delimiters, add them
      cleaned = "$" + cleaned + "$"
    }
  
    return cleaned
  }
  
  // Function to preprocess text containing LaTeX formulas
  export const preprocessLatexInText = (text: string): string => {
    if (!text) return text
  
    // First, look for array-like LaTeX representations
    // Example: ['[\nf(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x - a)^n\n]']
    const arrayLatexRegex = /\[['"]?\s*\[\\n.*?\\n\s*\]\s*['"]?\]/g
    let processedText = text.replace(arrayLatexRegex, (match) => {
      return cleanLatexFormula(match)
    })
  
    // Then look for other potential LaTeX expressions
    const potentialLatexRegex =
      /(\\\[[\s\S]*?\\\])|(\\$$[\s\S]*?\\$$)|(\$\$[\s\S]*?\$\$)|(\$[^\n$]*?(?:\n[^\n$]*?)*?\$)|(\[[\s\S]*?\])/g
  
    processedText = processedText.replace(potentialLatexRegex, (match) => {
      if (match.includes("\\n") || match.includes("\n")) {
        return cleanLatexFormula(match)
      }
      return match
    })
  
    return processedText
  }
  
  