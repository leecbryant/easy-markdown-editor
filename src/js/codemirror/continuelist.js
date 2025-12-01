// Markdown list continuation for CodeMirror 6

// Get the list marker from the current line
function getListMarker(state, line) {
    var text = state.doc.lineAt(line).text;
    var unorderedMatch = text.match(/^(\s*)([-*+])\s+/);
    if (unorderedMatch) {
        return { indent: unorderedMatch[1], marker: unorderedMatch[2], type: 'unordered' };
    }
    
    var orderedMatch = text.match(/^(\s*)(\d+)\.\s+/);
    if (orderedMatch) {
        return { indent: orderedMatch[1], marker: orderedMatch[2], type: 'ordered' };
    }
    
    return null;
}

// Continue list on Enter
function continueList(state, dispatch) {
    var selection = state.selection.main;
    if (!selection.empty) {
        return false;
    }
    
    var line = state.doc.lineAt(selection.head);
    var listInfo = getListMarker(state, selection.head);
    
    if (!listInfo) {
        return false;
    }
    
    // If the line only has the marker and whitespace, remove it
    var textAfterMarker = line.text.slice(listInfo.indent.length + listInfo.marker.length + (listInfo.type === 'ordered' ? 2 : 1)).trim();
    
    if (textAfterMarker === '') {
        // Empty list item - remove it and exit the list
        dispatch(state.update({
            changes: {
                from: line.from,
                to: line.to,
                insert: '',
            },
            selection: { anchor: line.from },
        }));
        return true;
    }
    
    // Continue the list
    var newMarker;
    if (listInfo.type === 'ordered') {
        newMarker = listInfo.indent + String(parseInt(listInfo.marker) + 1) + '. ';
    } else {
        newMarker = listInfo.indent + listInfo.marker + ' ';
    }
    
    dispatch(state.update({
        changes: {
            from: selection.head,
            to: selection.head,
            insert: '\n' + newMarker,
        },
        selection: { anchor: selection.head + newMarker.length + 1 },
    }));
    
    return true;
}

// Keymap for list continuation
var continueListKeymap = [
    {
        key: 'Enter',
        run: function(view) {
            return continueList(view.state, view.dispatch);
        },
    },
];

module.exports = { continueList: continueList, continueListKeymap: continueListKeymap };
