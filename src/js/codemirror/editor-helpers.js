// CodeMirror 6 Helper Functions for EasyMDE
// Utility functions for working with CM6 API

var EditorView = require('@codemirror/view').EditorView;
var syntaxTree = require('@codemirror/language').syntaxTree;

// Document helpers
function getValue(view) {
    return view.state.doc.toString();
}

function setValue(view, value) {
    view.dispatch({
        changes: {
            from: 0,
            to: view.state.doc.length,
            insert: value,
        },
    });
}

// Selection helpers  
function getCursor(view, which) {
    var selection = view.state.selection.main;
    var pos = which === 'start' ? selection.from : selection.head;
    return offsetToPos(view.state.doc, pos);
}

function setCursor(view, line, ch) {
    var offset;
    if (typeof line === 'object') {
        offset = posToOffset(view.state.doc, line);
    } else {
        offset = posToOffset(view.state.doc, { line: line, ch: ch || 0 });
    }
    view.dispatch({
        selection: { anchor: offset, head: offset },
    });
}

function getSelection(view) {
    var selection = view.state.selection.main;
    return view.state.sliceDoc(selection.from, selection.to);
}

function replaceSelection(view, text) {
    view.dispatch(view.state.replaceSelection(text));
}

// Replace a range of text
function replaceRange(view, text, from, to) {
    var fromOffset = typeof from === 'object' ? posToOffset(view.state.doc, from) : from;
    var toOffset = to ? (typeof to === 'object' ? posToOffset(view.state.doc, to) : to) : fromOffset;
    
    view.dispatch({
        changes: { from: fromOffset, to: toOffset, insert: text },
    });
}

// Set selection range
function setSelection(view, anchor, head) {
    var anchorOffset = typeof anchor === 'object' ? posToOffset(view.state.doc, anchor) : anchor;
    var headOffset = head ? (typeof head === 'object' ? posToOffset(view.state.doc, head) : head) : anchorOffset;
    
    view.dispatch({
        selection: { anchor: anchorOffset, head: headOffset },
    });
}

// Focus the editor
function focus(view) {
    view.focus();
}

// Line helpers
function getLine(view, n) {
    var line = view.state.doc.line(n + 1); // CM6 lines are 1-indexed
    return line.text;
}

function lineCount(view) {
    return view.state.doc.lines;
}

function getRange(view, from, to) {
    var fromOffset = posToOffset(view.state.doc, from);
    var toOffset = posToOffset(view.state.doc, to);
    return view.state.sliceDoc(fromOffset, toOffset);
}

// Scroll helpers
function getScrollInfo(view) {
    var scroller = view.scrollDOM;
    return {
        top: scroller.scrollTop,
        left: scroller.scrollLeft,
        height: scroller.scrollHeight,
        width: scroller.scrollWidth,
        clientHeight: scroller.clientHeight,
        clientWidth: scroller.clientWidth,
    };
}

function scrollTo(view, x, y) {
    var scroller = view.scrollDOM;
    if (x != null) {
        scroller.scrollLeft = x;
    }
    if (y != null) {
        scroller.scrollTop = y;
    }
}

function scrollIntoView(view, pos) {
    var offset = typeof pos === 'object' ? posToOffset(view.state.doc, pos) : pos;
    view.dispatch({
        effects: EditorView.scrollIntoView(offset, { y: 'center' }),
    });
}

// Position conversion utilities
function posToOffset(doc, pos) {
    var line = doc.line(pos.line + 1); // CM6 lines are 1-indexed  
    return line.from + pos.ch;
}

function offsetToPos(doc, offset) {
    var line = doc.lineAt(offset);
    return {
        line: line.number - 1, // Convert to 0-indexed
        ch: offset - line.from,
    };
}

// Token/syntax detection for markdown
function getTokenAt(view, pos) {
    var offset = posToOffset(view.state.doc, pos);
    var line = view.state.doc.lineAt(offset);
    var lineText = line.text;
    var ch = offset - line.from;
    
    var token = {
        type: '',
        string: lineText[ch] || '',
        start: ch,
        end: ch + 1,
        state: { base: { base: {} } },
    };
    
    // Detect markdown syntax patterns
    if (/^#{1,6}\s/.test(lineText)) {
        token.type = 'header header-' + (lineText.match(/^(#{1,6})/)[1].length);
    } else if (/^\s*>/.test(lineText)) {
        token.type = 'quote';
    } else if (/^\s*[-*+]\s/.test(lineText)) {
        token.type = 'variable-2'; // unordered list
    } else if (/^\s*\d+\.\s/.test(lineText)) {
        token.type = 'variable-2'; // ordered list
    }
    
    // Check for inline styles at cursor position
    var beforeCursor = lineText.substring(0, ch);
    var afterCursor = lineText.substring(ch);
    
    // Bold
    if ((/\*\*[^*]*$/.test(beforeCursor) && /^[^*]*\*\*/.test(afterCursor)) ||
        (/__[^_]*$/.test(beforeCursor) && /^[^_]*__/.test(afterCursor))) {
        token.type = (token.type ? token.type + ' ' : '') + 'strong';
    }
    
    // Italic
    if ((/\*[^*]*$/.test(beforeCursor) && /^[^*]*\*/.test(afterCursor)) ||
        (/_[^_]*$/.test(beforeCursor) && /^[^_]*_/.test(afterCursor))) {
        token.type = (token.type ? token.type + ' ' : '') + 'em';
    }
    
    // Strikethrough
    if (/~~[^~]*$/.test(beforeCursor) && /^[^~]*~~/.test(afterCursor)) {
        token.type = (token.type ? token.type + ' ' : '') + 'strikethrough';
    }
    
    // Code
    if (/`[^`]*$/.test(beforeCursor) && /^[^`]*`/.test(afterCursor)) {
        token.type = (token.type ? token.type + ' ' : '') + 'comment';
    }
    
    // Link/Image
    if (/\[/.test(beforeCursor) && /\]/.test(afterCursor)) {
        if (/!\[/.test(beforeCursor)) {
            token.type = (token.type ? token.type + ' ' : '') + 'image';
        } else {
            token.type = (token.type ? token.type + ' ' : '') + 'link';
        }
    }
    
    return token;
}

// Get markdown state at cursor position using syntax tree
function getState(view, pos) {
    if (pos === undefined) {
        pos = view.state.selection.main.head;
    } else if (typeof pos === 'object') {
        pos = posToOffset(view.state.doc, pos);
    }
    
    var line = view.state.doc.lineAt(pos);
    var lineText = line.text;
    
    var state = {};
    
    // Use syntax tree for accurate state detection
    var tree = syntaxTree(view.state);
    var node = tree.resolveInner(pos, 1);
    
    // Walk up the tree to find all active syntax nodes
    var current = node;
    while (current) {
        var name = current.name;
        
        if (name === 'StrongEmphasis') {
            state.bold = true;
        } else if (name === 'Emphasis') {
            state.italic = true;
        } else if (name === 'Strikethrough') {
            state.strikethrough = true;
        } else if (name === 'InlineCode' || name === 'CodeText' || name === 'FencedCode' || name === 'CodeBlock') {
            state.code = true;
        } else if (name === 'Link') {
            state.link = true;
        } else if (name === 'Image') {
            state.image = true;
        } else if (name === 'Blockquote' || name === 'QuoteMark') {
            state.quote = true;
        } else if (name === 'ATXHeading1') {
            state.heading = true;
            state['heading-1'] = true;
        } else if (name === 'ATXHeading2') {
            state.heading = true;
            state['heading-2'] = true;
        } else if (name === 'ATXHeading3') {
            state.heading = true;
            state['heading-3'] = true;
        } else if (name === 'ATXHeading4') {
            state.heading = true;
            state['heading-4'] = true;
        } else if (name === 'ATXHeading5') {
            state.heading = true;
            state['heading-5'] = true;
        } else if (name === 'ATXHeading6') {
            state.heading = true;
            state['heading-6'] = true;
        } else if (name === 'OrderedList' || name === 'ListItem') {
            // Check if it's an ordered list
            if (/^\s*\d+\./.test(lineText)) {
                state['ordered-list'] = true;
            } else {
                state['unordered-list'] = true;
            }
        } else if (name === 'BulletList') {
            state['unordered-list'] = true;
        }
        
        current = current.parent;
    }
    
    // Fallback to regex for line-level patterns if tree didn't catch them
    if (!state.heading && /^#{1,6}\s/.test(lineText)) {
        var level = lineText.match(/^(#{1,6})/)[1].length;
        state.heading = true;
        state['heading-' + level] = true;
    }
    
    if (!state.quote && /^\s*>/.test(lineText)) {
        state.quote = true;
    }
    
    if (!state['unordered-list'] && !state['ordered-list']) {
        if (/^\s*[-*+]\s/.test(lineText)) {
            state['unordered-list'] = true;
        } else if (/^\s*\d+\.\s/.test(lineText)) {
            state['ordered-list'] = true;
        }
    }
    
    return state;
}

// DOM accessors
function getWrapperElement(view) {
    return view.dom;
}

function getScrollerElement(view) {
    return view.scrollDOM;
}

function getInputField(view) {
    return view.contentDOM;
}

// Export all helpers
module.exports = {
    getValue: getValue,
    setValue: setValue,
    getCursor: getCursor,
    setCursor: setCursor,
    getSelection: getSelection,
    replaceSelection: replaceSelection,
    replaceRange: replaceRange,
    setSelection: setSelection,
    focus: focus,
    getLine: getLine,
    lineCount: lineCount,
    getRange: getRange,
    getScrollInfo: getScrollInfo,
    scrollTo: scrollTo,
    scrollIntoView: scrollIntoView,
    getTokenAt: getTokenAt,
    getState: getState,
    getWrapperElement: getWrapperElement,
    getScrollerElement: getScrollerElement,
    getInputField: getInputField,
    posToOffset: posToOffset,
    offsetToPos: offsetToPos,
};
