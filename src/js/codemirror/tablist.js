// Tab list handling for CodeMirror 6 - port of tablist.js
var syntaxTree = require('@codemirror/language').syntaxTree;
var indentMore = require('@codemirror/commands').indentMore;
var indentLess = require('@codemirror/commands').indentLess;
var EditorState = require('@codemirror/state').EditorState;

function isInList(state, pos) {
    var tree = syntaxTree(state);
    var node = tree.resolveInner(pos, -1);
    
    while (node) {
        if (node.name === 'ListItem' || node.name === 'BulletList' || node.name === 'OrderedList') {
            return true;
        }
        node = node.parent;
    }
    return false;
}

function tabAndIndentMarkdownList(view) {
    var state = view.state;
    var selection = state.selection.main;
    
    if (isInList(state, selection.head)) {
        return indentMore(view);
    }
    
    // Insert tab or spaces based on configuration
    var tabSize = state.facet(EditorState.tabSize);
    var indentUnit = ' '.repeat(tabSize);
    
    view.dispatch(state.update(state.replaceSelection(indentUnit)));
    return true;
}

function shiftTabAndUnindentMarkdownList(view) {
    var state = view.state;
    var selection = state.selection.main;
    
    if (isInList(state, selection.head)) {
        return indentLess(view);
    }
    
    return false;
}

// Keymaps for tab list handling
var tabListKeymap = [
    {
        key: 'Tab',
        run: tabAndIndentMarkdownList,
    },
    {
        key: 'Shift-Tab',
        run: shiftTabAndUnindentMarkdownList,
    },
];

module.exports = { tabAndIndentMarkdownList: tabAndIndentMarkdownList, shiftTabAndUnindentMarkdownList: shiftTabAndUnindentMarkdownList, tabListKeymap: tabListKeymap };
