// Image upload event handling for CodeMirror 6

var EditorView = require('@codemirror/view').EditorView;

function imageUploadPlugin(callbacks) {
    return EditorView.domEventHandlers({
        dragenter: function(event, view) {
            if (callbacks.onDragEnter) {
                callbacks.onDragEnter(event, view);
            }
            event.stopPropagation();
            event.preventDefault();
        },
        
        dragend: function(event, view) {
            if (callbacks.onDragEnd) {
                callbacks.onDragEnd(event, view);
            }
            event.stopPropagation();
            event.preventDefault();
        },
        
        dragleave: function(event, view) {
            if (callbacks.onDragLeave) {
                callbacks.onDragLeave(event, view);
            }
            event.stopPropagation();
            event.preventDefault();
        },
        
        dragover: function(event, view) {
            if (callbacks.onDragOver) {
                callbacks.onDragOver(event, view);
            }
            event.stopPropagation();
            event.preventDefault();
        },
        
        drop: function(event, view) {
            event.stopPropagation();
            event.preventDefault();
            if (callbacks.onDrop && event.dataTransfer && event.dataTransfer.files) {
                callbacks.onDrop(event.dataTransfer.files, view);
            }
        },
        
        paste: function(event, view) {
            if (callbacks.onPaste && event.clipboardData && event.clipboardData.files && event.clipboardData.files.length > 0) {
                callbacks.onPaste(event.clipboardData.files, view);
            }
        },
    });
}

module.exports = { imageUploadPlugin: imageUploadPlugin };
