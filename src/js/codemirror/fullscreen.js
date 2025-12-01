// Fullscreen extension for CodeMirror 6
var { EditorView } = require('@codemirror/view');
var { StateEffect, StateField } = require('@codemirror/state');

// State effect to toggle fullscreen
var toggleFullscreenEffect = StateEffect.define();

// State field to track fullscreen status
var fullscreenField = StateField.define({
    create: function() {
        return false;
    },
    update: function(value, tr) {
        for (var i = 0; i < tr.effects.length; i++) {
            if (tr.effects[i].is(toggleFullscreenEffect)) {
                return !value;
            }
        }
        return value;
    },
});

// Theme to apply when in fullscreen
var fullscreenTheme = EditorView.baseTheme({
    '&.cm-editor-fullscreen': {
        position: 'fixed !important',
        top: '50px',
        left: '0',
        right: '0',
        bottom: '0',
        height: 'auto',
        zIndex: '8',
    },
    '&.cm-editor-fullscreen .cm-scroller': {
        minHeight: '100% !important',
    },
});

// Extension to manage fullscreen
function fullscreen() {
    return [
        fullscreenField,
        fullscreenTheme,
        EditorView.updateListener.of(function(update) {
            for (var i = 0; i < update.transactions.length; i++) {
                var tr = update.transactions[i];
                for (var j = 0; j < tr.effects.length; j++) {
                    var effect = tr.effects[j];
                    if (effect.is(toggleFullscreenEffect)) {
                        var isFullscreen = update.state.field(fullscreenField);
                        if (isFullscreen) {
                            update.view.dom.classList.add('cm-editor-fullscreen');
                            document.documentElement.classList.add('EasyMDE-fullscreen');
                        } else {
                            update.view.dom.classList.remove('cm-editor-fullscreen');
                            document.documentElement.classList.remove('EasyMDE-fullscreen');
                        }
                    }
                }
            }
        }),
    ];
}

// Helper function to toggle fullscreen
function toggleFullscreen(view) {
    view.dispatch({
        effects: toggleFullscreenEffect.of(null),
    });
}

// Helper to check if editor is in fullscreen
function isFullscreen(view) {
    return view.state.field(fullscreenField);
}

module.exports = { fullscreen: fullscreen, toggleFullscreen: toggleFullscreen, isFullscreen: isFullscreen, toggleFullscreenEffect: toggleFullscreenEffect, fullscreenField: fullscreenField };
