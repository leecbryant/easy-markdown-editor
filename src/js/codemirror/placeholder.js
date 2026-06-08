// Placeholder extension for CodeMirror 6
// Simplified implementation using just DOM manipulation
var { EditorView, ViewPlugin } = require('@codemirror/view');

function placeholder(text) {
    return [
        // Render the placeholder once when the editor is created so it is
        // visible on initial mount (not only after the first docChanged/focus).
        ViewPlugin.define(function(view) {
            updatePlaceholder(view, text);
            return {
                update: function(update) {
                    if (update.docChanged) {
                        updatePlaceholder(update.view, text);
                    }
                },
            };
        }),
        EditorView.domEventHandlers({
            focus: function(event, view) {
                updatePlaceholder(view, text);
            },
            blur: function(event, view) {
                updatePlaceholder(view, text);
            },
        }),
    ];
}

function updatePlaceholder(view, text) {
    var hasContent = view.state.doc.length > 0;
    var placeholder = view.dom.querySelector('.cm-placeholder-text');
    
    if (!hasContent && !placeholder) {
        var placeholderEl = document.createElement('div');
        placeholderEl.className = 'cm-placeholder-text';
        placeholderEl.textContent = text;
        view.dom.appendChild(placeholderEl);
    } else if (hasContent && placeholder) {
        placeholder.remove();
    }
}

module.exports = { placeholder };
