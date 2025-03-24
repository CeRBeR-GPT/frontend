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
    } else if (cleaned.startsWith("(") && cleaned.endsWith(")") && cleaned.includes("\\")) {
      // Handle any LaTeX command in parentheses - convert to $formula$ format
      cleaned = "$" + cleaned.slice(1, -1).trim() + "$"
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
    const arrayLatexRegex = /\[['"]?\s*\[\\n.*?\\n\s*\]\s*['"]?\]/g
    let processedText = text.replace(arrayLatexRegex, (match) => {
      return cleanLatexFormula(match)
    })
  
    // Special handling for standalone block math formulas
    if (processedText.trim().startsWith("$$") && processedText.trim().endsWith("$$")) {
      return processedText.trim()
    }
  
    // Handle LaTeX expressions in parentheses with any LaTeX command
    // This will catch expressions like ( \forall ), ( \exists ), ( \therefore ), etc.
    // Note: We need to escape the parentheses in the regex
    const parenthesesLatexRegex = /$$\s*(\\[a-zA-Z]+(\{[^}]*\})?)\s*$$/g
    processedText = processedText.replace(parenthesesLatexRegex, (match) => {
      // Convert directly to $formula$ format
      const formula = match.slice(1, -1).trim()
      return `$${formula}$`
    })
  
    // Special handling for specific LaTeX commands in parentheses
    const specificCommands = [
      "\forall",
      "\exists",
      "\therefore",
      "\because",
      "\sim",
      "\approx",
      "\infty",
      "\mathbb",
    ]
  
    for (const cmd of specificCommands) {
      const specificRegex = new RegExp(`\$$\\s*${cmd.replace(/\\/g, "\\\\")}[^)]*\\s*\$$`, "g")
      processedText = processedText.replace(specificRegex, (match) => {
        // Convert directly to $formula$ format
        const formula = match.slice(1, -1).trim()
        return `$${formula}$`
      })
    }
  
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
  
  
  
  
  
  
  
  
  
  
  
  
  