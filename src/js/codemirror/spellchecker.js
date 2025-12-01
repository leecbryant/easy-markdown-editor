// Spell checker extension for CodeMirror 6
// Uses browser's native spell checking by default

var EditorView = require('@codemirror/view').EditorView;

// Simple spell checker that marks potentially misspelled words
function spellChecker(options) {
    options = options || {};
    
    // If using native spell checking, just enable it on contentDOM
    if (options.native !== false) {
        return EditorView.contentAttributes.of({
            spellcheck: 'true',
        });
    }
    
    // For custom spell checking, we'd need a dictionary
    // This is a placeholder for future implementation
    return [];
}

module.exports = { spellChecker: spellChecker };
