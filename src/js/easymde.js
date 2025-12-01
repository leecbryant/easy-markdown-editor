'use strict';

// CodeMirror 6 imports - use destructuring like the extension files
var viewModule = require('@codemirror/view');
var EditorView = viewModule.EditorView;
var keymap = viewModule.keymap;
var lineNumbers = viewModule.lineNumbers;
var highlightActiveLine = viewModule.highlightActiveLine;
var highlightSpecialChars = viewModule.highlightSpecialChars;
var drawSelection = viewModule.drawSelection;
var highlightActiveLineGutter = viewModule.highlightActiveLineGutter;
var stateModule = require('@codemirror/state');
var EditorState = stateModule.EditorState;
var StateEffect = stateModule.StateEffect;
var defaultKeymap = require('@codemirror/commands').defaultKeymap;
var history = require('@codemirror/commands').history;
var historyKeymap = require('@codemirror/commands').historyKeymap;
var undoCommand = require('@codemirror/commands').undo;
var redoCommand = require('@codemirror/commands').redo;
var indentWithTab = require('@codemirror/commands').indentWithTab;
var markdown = require('@codemirror/lang-markdown').markdown;
var syntaxHighlighting = require('@codemirror/language').syntaxHighlighting;
var defaultHighlightStyle = require('@codemirror/language').defaultHighlightStyle;
var search = require('@codemirror/search').search;
var searchKeymap = require('@codemirror/search').searchKeymap;

// Custom CM extensions
var placeholder = require('./codemirror/placeholder').placeholder;
var fullscreen = require('./codemirror/fullscreen').fullscreen;
var toggleFullscreenEffect = require('./codemirror/fullscreen').toggleFullscreenEffect;
var imageUploadPlugin = require('./codemirror/image-upload').imageUploadPlugin;
var shortcodeHighlight = require('./codemirror/shortcode-highlight').shortcodeHighlight;

// CM helper functions
var cm = require('./codemirror/editor-helpers');

var marked = require('marked').marked;


// Some variables
var isMac = /Mac/.test(navigator.platform);
var anchorToExternalRegex = new RegExp(/(<a.*?https?:\/\/.*?[^a]>)+?/g);

// Mapping of actions that can be bound to keyboard shortcuts or toolbar buttons
var bindings = {
    'toggleBold': toggleBold,
    'toggleItalic': toggleItalic,
    'drawLink': drawLink,
    'toggleHeadingSmaller': toggleHeadingSmaller,
    'toggleHeadingBigger': toggleHeadingBigger,
    'drawImage': drawImage,
    'toggleBlockquote': toggleBlockquote,
    'toggleOrderedList': toggleOrderedList,
    'toggleUnorderedList': toggleUnorderedList,
    'toggleCodeBlock': toggleCodeBlock,
    'togglePreview': togglePreview,
    'toggleStrikethrough': toggleStrikethrough,
    'toggleHeading1': toggleHeading1,
    'toggleHeading2': toggleHeading2,
    'toggleHeading3': toggleHeading3,
    'toggleHeading4': toggleHeading4,
    'toggleHeading5': toggleHeading5,
    'toggleHeading6': toggleHeading6,
    'cleanBlock': cleanBlock,
    'drawTable': drawTable,
    'drawHorizontalRule': drawHorizontalRule,
    'undo': undo,
    'redo': redo,
    'toggleSideBySide': toggleSideBySide,
    'toggleFullScreen': toggleFullScreen,
};

var shortcuts = {
    'toggleBold': 'Cmd-B',
    'toggleItalic': 'Cmd-I',
    'drawLink': 'Cmd-K',
    'toggleHeadingSmaller': 'Cmd-H',
    'toggleHeadingBigger': 'Shift-Cmd-H',
    'toggleHeading1': 'Ctrl+Alt+1',
    'toggleHeading2': 'Ctrl+Alt+2',
    'toggleHeading3': 'Ctrl+Alt+3',
    'toggleHeading4': 'Ctrl+Alt+4',
    'toggleHeading5': 'Ctrl+Alt+5',
    'toggleHeading6': 'Ctrl+Alt+6',
    'cleanBlock': 'Cmd-E',
    'drawImage': 'Cmd-Alt-I',
    'toggleBlockquote': 'Cmd-\'',
    'toggleOrderedList': 'Cmd-Alt-L',
    'toggleUnorderedList': 'Cmd-L',
    'toggleCodeBlock': 'Cmd-Alt-C',
    'togglePreview': 'Cmd-P',
    'toggleSideBySide': 'F9',
    'toggleFullScreen': 'F11',
};

var getBindingName = function (f) {
    for (var key in bindings) {
        if (bindings[key] === f) {
            return key;
        }
    }
    return null;
};

var isMobile = function () {
    var check = false;
    (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(a.substr(0, 4))) check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};

/**
 * Modify HTML to add 'target="_blank"' to links so they open in new tabs by default.
 * @param {string} htmlText - HTML to be modified.
 * @return {string} The modified HTML text.
 */
function addAnchorTargetBlank(htmlText) {
    var match;
    while ((match = anchorToExternalRegex.exec(htmlText)) !== null) {
        // With only one capture group in the RegExp, we can safely take the first index from the match.
        var linkString = match[0];

        if (linkString.indexOf('target=') === -1) {
            var fixedLinkString = linkString.replace(/>$/, ' target="_blank">');
            htmlText = htmlText.replace(linkString, fixedLinkString);
        }
    }
    return htmlText;
}

/**
 * Modify HTML to remove the list-style when rendering checkboxes.
 * @param {string} htmlText - HTML to be modified.
 * @return {string} The modified HTML text.
 */
function removeListStyleWhenCheckbox(htmlText) {

    var parser = new DOMParser();
    var htmlDoc = parser.parseFromString(htmlText, 'text/html');
    var listItems = htmlDoc.getElementsByTagName('li');

    for (var i = 0; i < listItems.length; i++) {
        var listItem = listItems[i];

        for (var j = 0; j < listItem.children.length; j++) {
            var listItemChild = listItem.children[j];

            if (listItemChild instanceof HTMLInputElement && listItemChild.type === 'checkbox') {
                // From Github: margin: 0 .2em .25em -1.6em;
                listItem.style.marginLeft = '-1.5em';
                listItem.style.listStyleType = 'none';
            }
        }
    }

    return htmlDoc.documentElement.innerHTML;
}

/**
 * Fix shortcut. Mac use Command, others use Ctrl.
 */
function fixShortcut(name) {
    if (isMac) {
        name = name.replace('Ctrl', 'Cmd');
    } else {
        name = name.replace('Cmd', 'Ctrl');
    }
    return name;
}

/**
 * Create dropdown block
 */
function createToolbarDropdown(options, enableTooltips, shortcuts, parent) {
    var el = createToolbarButton(options, false, enableTooltips, shortcuts, 'button', parent);
    el.classList.add('easymde-dropdown');

    el.onclick = function () {
        el.focus();
    };

    var content = document.createElement('div');
    content.className = 'easymde-dropdown-content';
    for (var childrenIndex = 0; childrenIndex < options.children.length; childrenIndex++) {

        var child = options.children[childrenIndex];
        var childElement;

        if (typeof child === 'string' && child in toolbarBuiltInButtons) {
            childElement = createToolbarButton(toolbarBuiltInButtons[child], true, enableTooltips, shortcuts, 'button', parent);
        } else {
            childElement = createToolbarButton(child, true, enableTooltips, shortcuts, 'button', parent);
        }

        childElement.addEventListener('click', function (e) { e.stopPropagation(); }, false);
        content.appendChild(childElement);
    }
    el.appendChild(content);
    return el;
}

/**
 * Create button element for toolbar.
 */
function createToolbarButton(options, enableActions, enableTooltips, shortcuts, markup, parent) {
    options = options || {};
    var el = document.createElement(markup);

    // Add 'custom' attributes as early as possible, so that 'official' attributes will never be overwritten.
    if (options.attributes) {
        for (var attribute in options.attributes) {
            if (Object.prototype.hasOwnProperty.call(options.attributes, attribute)) {
                el.setAttribute(attribute, options.attributes[attribute]);
            }
        }
    }

    var classNamePrefix = parent.options.toolbarButtonClassPrefix ? parent.options.toolbarButtonClassPrefix + '-' : '';
    el.className = classNamePrefix + options.name;
    el.setAttribute('type', markup);
    enableTooltips = (enableTooltips == undefined) ? true : enableTooltips;

    if (options.text) {
        el.innerText = options.text;
    }

    // Properly handle custom shortcuts
    if (options.name && options.name in shortcuts) {
        bindings[options.name] = options.action;
    }

    if (options.title && enableTooltips) {
        el.title = createTooltip(options.title, options.action, shortcuts);

        if (isMac) {
            el.title = el.title.replace('Ctrl', '⌘');
            el.title = el.title.replace('Alt', '⌥');
        }
    }

    if (options.title) {
        el.setAttribute('aria-label', options.title);
    }

    if (options.noDisable) {
        el.classList.add('no-disable');
    }

    if (options.noMobile) {
        el.classList.add('no-mobile');
    }

    // Prevent errors if there is no class name in custom options
    var classNameParts = [];
    if (typeof options.className !== 'undefined') {
        classNameParts = options.className.split(' ');
    }

    // Provide backwards compatibility with simple-markdown-editor by adding custom classes to the button.
    var iconClasses = [];
    for (var classNameIndex = 0; classNameIndex < classNameParts.length; classNameIndex++) {
        var classNamePart = classNameParts[classNameIndex];
        // Split icon classes from the button.
        // Regex will detect "fa", "fas", "fa-something" and "fa-some-icon-1", but not "fanfare".
        if (classNamePart.match(/^fa([srlb]|(-[\w-]*)|$)/)) {
            iconClasses.push(classNamePart);
        } else {
            el.classList.add(classNamePart);
        }
    }

    el.tabIndex = -1;

    if (iconClasses.length > 0) {
        // Create icon element and append as a child to the button
        var icon = document.createElement('i');
        for (var iconClassIndex = 0; iconClassIndex < iconClasses.length; iconClassIndex++) {
            var iconClass = iconClasses[iconClassIndex];
            icon.classList.add(iconClass);
        }
        el.appendChild(icon);
    }

    // If there is a custom icon markup set, use that
    if (typeof options.icon !== 'undefined') {
        el.innerHTML = options.icon;
    }

    if (options.action && enableActions) {
        if (typeof options.action === 'function') {
            el.onclick = function (e) {
                e.preventDefault();
                options.action(parent);
            };
        } else if (typeof options.action === 'string') {
            el.onclick = function (e) {
                e.preventDefault();
                window.open(options.action, '_blank');
            };
        }
    }

    return el;
}

function createSep() {
    var el = document.createElement('i');
    el.className = 'separator';
    el.innerHTML = '|';
    return el;
}

function createTooltip(title, action, shortcuts) {
    var actionName;
    var tooltip = title;

    if (action) {
        actionName = getBindingName(action);
        if (shortcuts[actionName]) {
            tooltip += ' (' + fixShortcut(shortcuts[actionName]) + ')';
        }
    }

    return tooltip;
}

/**
 * The state of the editor at the given position.
 * @param {EditorView} view - The CM6 editor view
 * @param {number|object} pos - Position offset or {line, ch} object
 */
function getState(view, pos) {
    return cm.getState(view, pos);
}


// Saved overflow setting
var saved_overflow = '';

/**
 * Toggle full screen of the editor.
 * @param {EasyMDE} editor
 */
function toggleFullScreen(editor) {
    var view = editor.cm;
    
    // Toggle fullscreen state
    editor.isFullscreen = !editor.isFullscreen;
    view.dispatch({ effects: toggleFullscreenEffect.of(null) });

    // Prevent scrolling on body during fullscreen active
    if (editor.isFullscreen) {
        saved_overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = saved_overflow;
    }

    var wrapper = view.dom;
    var sidebyside = wrapper.nextElementSibling;

    if (sidebyside && sidebyside.classList && sidebyside.classList.contains('editor-preview-active-side')) {
        if (editor.options.sideBySideFullscreen === false) {
            // if side-by-side not-fullscreen ok, apply classes as needed
            var easyMDEContainer = wrapper.parentNode;
            if (editor.isFullscreen) {
                easyMDEContainer.classList.remove('sided--no-fullscreen');
            } else {
                easyMDEContainer.classList.add('sided--no-fullscreen');
            }
        } else {
            toggleSideBySide(editor);
        }
    }

    if (editor.options.onToggleFullScreen) {
        editor.options.onToggleFullScreen(editor.isFullscreen || false);
    }

    // Remove or set maxHeight
    if (typeof editor.options.maxHeight !== 'undefined') {
        if (editor.isFullscreen) {
            view.scrollDOM.style.removeProperty('height');
            if (sidebyside) sidebyside.style.removeProperty('height');
        } else {
            view.scrollDOM.style.height = editor.options.maxHeight;
            editor.setPreviewMaxHeight();
        }
    }

    // Update toolbar class
    if (editor.toolbar_div) {
        editor.toolbar_div.classList.toggle('fullscreen');
    }

    // Update toolbar button
    if (editor.toolbarElements && editor.toolbarElements.fullscreen) {
        var toolbarButton = editor.toolbarElements.fullscreen;
        toolbarButton.classList.toggle('active');
    }
}


/**
 * Action for toggling bold.
 * @param {EasyMDE} editor
 */
function toggleBold(editor) {
    _toggleBlock(editor, 'bold', editor.options.blockStyles.bold);
}


/**
 * Action for toggling italic.
 * @param {EasyMDE} editor
 */
function toggleItalic(editor) {
    _toggleBlock(editor, 'italic', editor.options.blockStyles.italic);
}


/**
 * Action for toggling strikethrough.
 * @param {EasyMDE} editor
 */
function toggleStrikethrough(editor) {
    _toggleBlock(editor, 'strikethrough', '~~');
}

/**
 * Action for toggling code block.
 * @param {EasyMDE} editor
 */
function toggleCodeBlock(editor) {
    var view = editor.cm;
    var fenceChars = editor.options.blockStyles.code;
    
    var startPoint = cm.getCursor(view, 'start');
    var endPoint = cm.getCursor(view, 'end');
    
    // Check if we have a selection
    var hasSelection = startPoint.line !== endPoint.line || startPoint.ch !== endPoint.ch;
    
    if (!hasSelection) {
        // No selection - toggle inline code on current word or insert code fences
        var text = cm.getLine(view, startPoint.line);
        
        // Check if we're inside inline code
        var beforeCursor = text.substring(0, startPoint.ch);
        var afterCursor = text.substring(startPoint.ch);
        
        if (/`[^`]*$/.test(beforeCursor) && /^[^`]*`/.test(afterCursor)) {
            // Inside inline code - remove it
            var start = beforeCursor.lastIndexOf('`');
            var end = afterCursor.indexOf('`') + startPoint.ch;
            
            cm.replaceRange(view, 
                text.substring(0, start) + text.substring(start + 1, end) + text.substring(end + 1),
                { line: startPoint.line, ch: 0 },
                { line: startPoint.line, ch: text.length },
            );
            cm.setCursor(view, startPoint.line, start);
        } else {
            // Not in code - insert fenced code block
            var blockIndent = text.match(/^\s*/)[0];
            var newText = '\n' + blockIndent + fenceChars + '\n' + blockIndent + '\n' + blockIndent + fenceChars + '\n';
            
            cm.replaceRange(view, newText,
                { line: startPoint.line, ch: text.length },
                { line: startPoint.line, ch: text.length },
            );
            cm.setCursor(view, startPoint.line + 2, blockIndent.length);
        }
    } else {
        // Has selection
        var firstLine = cm.getLine(view, startPoint.line);
        
        // Check if selection is already fenced
        var isFenced = false;
        if (startPoint.line > 0 && endPoint.line < cm.lineCount(view) - 1) {
            var lineBefore = cm.getLine(view, startPoint.line - 1);
            var lineAfter = cm.getLine(view, endPoint.line + 1);
            isFenced = /^```/.test(lineBefore.trim()) && /^```/.test(lineAfter.trim());
        }
        
        if (isFenced) {
            // Remove fences
            var removeChanges = [
                {
                    from: cm.posToOffset(view.state.doc, { line: endPoint.line + 1, ch: 0 }),
                    to: cm.posToOffset(view.state.doc, { line: endPoint.line + 2, ch: 0 }),
                    insert: '',
                },
                {
                    from: cm.posToOffset(view.state.doc, { line: startPoint.line - 1, ch: 0 }),
                    to: cm.posToOffset(view.state.doc, { line: startPoint.line, ch: 0 }),
                    insert: '',
                },
            ];
            view.dispatch({ changes: removeChanges });
        } else {
            // Add fences
            var fenceIndent = firstLine.match(/^\s*/)[0];
            var addChanges = [
                {
                    from: cm.posToOffset(view.state.doc, { line: startPoint.line, ch: 0 }),
                    to: cm.posToOffset(view.state.doc, { line: startPoint.line, ch: 0 }),
                    insert: fenceIndent + fenceChars + '\n',
                },
                {
                    from: cm.posToOffset(view.state.doc, { line: endPoint.line, ch: cm.getLine(view, endPoint.line).length }),
                    to: cm.posToOffset(view.state.doc, { line: endPoint.line, ch: cm.getLine(view, endPoint.line).length }),
                    insert: '\n' + fenceIndent + fenceChars,
                },
            ];
            view.dispatch({ changes: addChanges });
        }
    }
    
    cm.focus(view);
}

/**
 * Action for toggling blockquote.
 */
function toggleBlockquote(editor) {
    _toggleLine(editor.cm, 'quote');
}

/**
 * Action for toggling heading size: normal -> h1 -> h2 -> h3 -> h4 -> h5 -> h6 -> normal
 */
function toggleHeadingSmaller(editor) {
    _toggleHeading(editor.cm, 'smaller');
}

/**
 * Action for toggling heading size: normal -> h6 -> h5 -> h4 -> h3 -> h2 -> h1 -> normal
 */
function toggleHeadingBigger(editor) {
    _toggleHeading(editor.cm, 'bigger');
}

/**
 * Action for toggling heading size 1
 */
function toggleHeading1(editor) {
    _toggleHeading(editor.cm, undefined, 1);
}

/**
 * Action for toggling heading size 2
 */
function toggleHeading2(editor) {
    _toggleHeading(editor.cm, undefined, 2);
}

/**
 * Action for toggling heading size 3
 */
function toggleHeading3(editor) {
    _toggleHeading(editor.cm, undefined, 3);
}

/**
 * Action for toggling heading size 4
 */
function toggleHeading4(editor) {
    _toggleHeading(editor.cm, undefined, 4);
}

/**
 * Action for toggling heading size 5
 */
function toggleHeading5(editor) {
    _toggleHeading(editor.cm, undefined, 5);
}

/**
 * Action for toggling heading size 6
 */
function toggleHeading6(editor) {
    _toggleHeading(editor.cm, undefined, 6);
}


/**
 * Action for toggling ul.
 */
function toggleUnorderedList(editor) {
    var listStyle = '*'; // Default
    if (['-', '+', '*'].includes(editor.options.unorderedListStyle)) {
        listStyle = editor.options.unorderedListStyle;
    }

    _toggleLine(editor.cm, 'unordered-list', listStyle);
}


/**
 * Action for toggling ol.
 */
function toggleOrderedList(editor) {
    _toggleLine(editor.cm, 'ordered-list');
}

/**
 * Action for clean block (remove headline, list, blockquote code, markers)
 */
function cleanBlock(editor) {
    _cleanBlock(editor.cm);
}

/**
 * Action for drawing a link.
 * @param {EasyMDE} editor
 */
function drawLink(editor) {
    var options = editor.options;
    var url = 'https://';
    if (options.promptURLs) {
        var result = prompt(options.promptTexts.link, url);
        if (!result) {
            return false;
        }
        url = escapePromptURL(result);
    }
    _toggleLink(editor, 'link', options.insertTexts.link, url);
}

/**
 * Action for drawing an img.
 * @param {EasyMDE} editor
 */
function drawImage(editor) {
    var options = editor.options;
    var url = 'https://';
    if (options.promptURLs) {
        var result = prompt(options.promptTexts.image, url);
        if (!result) {
            return false;
        }
        url = escapePromptURL(result);
    }
    _toggleLink(editor, 'image', options.insertTexts.image, url);
}

/**
 * Encode and escape URLs to prevent breaking up rendered Markdown links.
 * @param {string} url The url of the link or image
 */
function escapePromptURL(url) {
    return encodeURI(url).replace(/([\\()])/g, '\\$1');
}

/**
 * Action for opening the browse-file window to upload an image to a server.
 * @param {EasyMDE} editor The EasyMDE object
 */
function drawUploadedImage(editor) {
    // TODO: Draw the image template with a fake url? ie: '![](importing foo.png...)'
    editor.openBrowseFileWindow();
}

/**
 * Action executed after an image have been successfully imported on the server.
 * @param {EasyMDE} editor The EasyMDE object
 * @param {string} url The url of the uploaded image
 */
function afterImageUploaded(editor, url) {
    var view = editor.cm;
    var stat = getState(view);
    var options = editor.options;
    var imageName = url.substr(url.lastIndexOf('/') + 1);
    var ext = imageName.substring(imageName.lastIndexOf('.') + 1).replace(/\?.*$/, '').toLowerCase();

    // Check if media is an image
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'apng', 'avif', 'webp'].includes(ext)) {
        _replaceSelection(view, stat.image, options.insertTexts.uploadedImage, url);
    } else {
        var text_link = options.insertTexts.link;
        text_link[0] = '[' + imageName;
        _replaceSelection(view, stat.link, text_link, url);
    }

    // show uploaded image filename for 1000ms
    editor.updateStatusBar('upload-image', editor.options.imageTexts.sbOnUploaded.replace('#image_name#', imageName));
    setTimeout(function () {
        editor.updateStatusBar('upload-image', editor.options.imageTexts.sbInit);
    }, 1000);
}

/**
 * Action for drawing a table.
 * @param {EasyMDE} editor
 */
function drawTable(editor) {
    var view = editor.cm;
    var stat = getState(view);
    var options = editor.options;
    _replaceSelection(view, stat.table, options.insertTexts.table);
}

/**
 * Action for drawing a horizontal rule.
 * @param {EasyMDE} editor
 */
function drawHorizontalRule(editor) {
    var view = editor.cm;
    var stat = getState(view);
    var options = editor.options;
    _replaceSelection(view, stat.image, options.insertTexts.horizontalRule);
}


/**
 * Undo action.
 * @param {EasyMDE} editor
 */
function undo(editor) {
    undoCommand(editor.cm);
    editor.cm.focus();
}


/**
 * Redo action.
 * @param {EasyMDE} editor
 */
function redo(editor) {
    redoCommand(editor.cm);
    editor.cm.focus();
}


/**
 * Toggle side by side preview
 * @param {EasyMDE} editor
 */
function toggleSideBySide(editor) {
    var view = editor.cm;
    var wrapper = view.dom;
    var preview = wrapper.nextSibling;
    
    // Create preview if it doesn't exist
    if (!preview || !preview.classList.contains('editor-preview-side')) {
        preview = editor.gui.sideBySide;
        if (!preview) {
            console.error('EasyMDE: Side-by-side preview not initialized');
            return;
        }
    }
    
    var toolbarButton = editor.toolbarElements && editor.toolbarElements['side-by-side'];
    var useSideBySideListener = false;

    var easyMDEContainer = wrapper.parentNode;

    if (preview.classList.contains('editor-preview-active-side')) {
        if (editor.options.sideBySideFullscreen === false) {
            // if side-by-side not-fullscreen ok, remove classes when hiding side
            easyMDEContainer.classList.remove('sided--no-fullscreen');
        }
        preview.classList.remove('editor-preview-active-side');
        if (toolbarButton) toolbarButton.classList.remove('active');
        wrapper.classList.remove('CodeMirror-sided');
    } else {
        // When the preview button is clicked for the first time,
        // give some time for the transition from editor.css to fire and the view to slide from right to left,
        // instead of just appearing.
        setTimeout(function () {
            if (!editor.isFullscreen) {
                if (editor.options.sideBySideFullscreen === false) {
                    // if side-by-side not-fullscreen ok, add classes when not fullscreen and showing side
                    easyMDEContainer.classList.add('sided--no-fullscreen');
                } else {
                    toggleFullScreen(editor);
                }
            }
            preview.classList.add('editor-preview-active-side');
        }, 1);
        if (toolbarButton) toolbarButton.classList.add('active');
        wrapper.classList.add('CodeMirror-sided');
        useSideBySideListener = true;
    }

    // Hide normal preview if active
    var previewNormal = wrapper.lastChild;
    if (previewNormal.classList.contains('editor-preview-active')) {
        previewNormal.classList.remove('editor-preview-active');
        var toolbar = editor.toolbarElements.preview;
        var toolbar_div = editor.toolbar_div;
        toolbar.classList.remove('active');
        toolbar_div.classList.remove('disabled-for-preview');
    }

    var sideBySideRenderingFunction = function () {
        var newValue = editor.options.previewRender(editor.value(), preview);
        if (newValue != null) {
            preview.innerHTML = newValue;
        }
    };

    if (!editor._sideBySideRenderingFunction) {
        editor._sideBySideRenderingFunction = sideBySideRenderingFunction;
    }

    if (useSideBySideListener) {
        var newValue = editor.options.previewRender(editor.value(), preview);
        if (newValue != null) {
            preview.innerHTML = newValue;
        }
        // Add CM6 update listener
        if (!editor._sideBySideUpdateEffect) {
            editor._sideBySideUpdateEffect = EditorView.updateListener.of(function(update) {
                if (update.docChanged && editor._sideBySideRenderingFunction) {
                    editor._sideBySideRenderingFunction();
                }
            });
            view.dispatch({ effects: StateEffect.appendConfig.of([editor._sideBySideUpdateEffect]) });
        }
    } else {
        // Note: CM6 extensions can't be easily removed, so we just clear the function
        // The update listener will check if the function exists before calling
        editor._sideBySideRenderingFunction = null;
    }
}


/**
 * Preview action.
 * @param {EasyMDE} editor
 */
function togglePreview(editor) {
    var view = editor.cm;
    var wrapper = view.dom;
    var container = wrapper.parentNode; // .EasyMDEContainer
    
    if (!container || !container.parentNode) {
        console.error('EasyMDE: Editor container not found in DOM');
        return;
    }
    
    var toolbar_div = editor.toolbar_div;
    var toolbar = editor.options.toolbar ? editor.toolbarElements.preview : false;
    
    // Look for preview inside the container, after the wrapper
    var preview = container.querySelector('.editor-preview-full');
    if (!preview || !preview.classList || !preview.classList.contains('editor-preview-full')) {
        preview = null;
    }

    // Turn off side by side if needed (side-by-side is inside container, after wrapper)
    // Use nextElementSibling to skip text nodes
    var sidebyside = wrapper.nextElementSibling;
    if (sidebyside && sidebyside.classList && sidebyside.classList.contains('editor-preview-active-side'))
        toggleSideBySide(editor);

    if (!preview) {

        preview = document.createElement('div');
        preview.className = 'editor-preview-full editor-preview';

        if (editor.options.previewClass) {

            if (Array.isArray(editor.options.previewClass)) {
                for (var i = 0; i < editor.options.previewClass.length; i++) {
                    preview.classList.add(editor.options.previewClass[i]);
                }

            } else if (typeof editor.options.previewClass === 'string') {
                preview.classList.add(editor.options.previewClass);
            }
        }

        // Insert preview inside container, after the wrapper
        container.appendChild(preview);
    }

    if (preview.classList.contains('editor-preview-active')) {
        preview.classList.remove('editor-preview-active');
        container.classList.remove('preview-active');
        wrapper.style.removeProperty('display'); // Show editor
        if (toolbar) {
            toolbar.classList.remove('active');
        }
        if (toolbar_div) {
            toolbar_div.classList.remove('disabled-for-preview');
        }
    } else {
        // When the preview button is clicked for the first time,
        // give some time for the transition from editor.css to fire and the view to slide from right to left,
        // instead of just appearing.
        setTimeout(function () {
            preview.classList.add('editor-preview-active');
            container.classList.add('preview-active');
            wrapper.style.setProperty('display', 'none', 'important'); // Hide editor with !important
        }, 1);
        if (toolbar) {
            toolbar.classList.add('active');
        }
        if (toolbar_div) {
            toolbar_div.classList.add('disabled-for-preview');
        }
    }

    var preview_result = editor.options.previewRender(editor.value(), preview);
    if (preview_result !== null) {
        preview.innerHTML = preview_result;
    }

}

function _replaceSelection(view, active, startEnd, url) {
    if (view.dom.lastChild && view.dom.lastChild.classList.contains('editor-preview-active'))
        return;

    var text;
    var start = startEnd[0];
    var end = startEnd[1];
    var startPoint = cm.getCursor(view, 'start');
    var endPoint = cm.getCursor(view, 'end');
    
    if (url) {
        start = start.replace('#url#', url);
        end = end.replace('#url#', url);
    }
    
    if (active) {
        text = cm.getLine(view, startPoint.line);
        start = text.slice(0, startPoint.ch);
        end = text.slice(startPoint.ch);
        cm.replaceRange(view, start + end, {
            line: startPoint.line,
            ch: 0,
        }, {
            line: startPoint.line,
            ch: 99999999999999,
        });
    } else {
        text = cm.getSelection(view);
        cm.replaceSelection(view, start + text + end);

        startPoint.ch += start.length;
        if (startPoint.line !== endPoint.line || startPoint.ch !== endPoint.ch) {
            endPoint.ch += start.length;
        }
    }
    cm.setSelection(view, startPoint, endPoint);
    cm.focus(view);
}


function _toggleHeading(view, direction, size) {
    if (view.dom.lastChild && view.dom.lastChild.classList.contains('editor-preview-active'))
        return;

    var startPoint = cm.getCursor(view, 'start');
    var endPoint = cm.getCursor(view, 'end');
    
    var changes = [];
    for (var i = startPoint.line; i <= endPoint.line; i++) {
        var text = cm.getLine(view, i);
        var currHeadingLevel = text.search(/[^#]/);

        var newText;
        if (direction !== undefined) {
            if (currHeadingLevel <= 0) {
                if (direction == 'bigger') {
                    newText = '###### ' + text;
                } else {
                    newText = '# ' + text;
                }
            } else if (currHeadingLevel == 6 && direction == 'smaller') {
                newText = text.substr(7);
            } else if (currHeadingLevel == 1 && direction == 'bigger') {
                newText = text.substr(2);
            } else {
                if (direction == 'bigger') {
                    newText = text.substr(1);
                } else {
                    newText = '#' + text;
                }
            }
        } else {
            if (currHeadingLevel <= 0) {
                newText = '#'.repeat(size) + ' ' + text;
            } else if (currHeadingLevel == size) {
                newText = text.substr(currHeadingLevel + 1);
            } else {
                newText = '#'.repeat(size) + ' ' + text.substr(currHeadingLevel + 1);
            }
        }

        changes.push({
            from: cm.posToOffset(view.state.doc, { line: i, ch: 0 }),
            to: cm.posToOffset(view.state.doc, { line: i, ch: text.length }),
            insert: newText,
        });
    }
    
    if (changes.length > 0) {
        view.dispatch({ changes: changes });
    }
    cm.focus(view);
}

function _toggleLine(view, name) {
    if (view.dom.lastChild && view.dom.lastChild.classList.contains('editor-preview-active'))
        return;

    var stat = cm.getState(view);
    var startPoint = cm.getCursor(view, 'start');
    var endPoint = cm.getCursor(view, 'end');
    var repl = {
        'quote': /^(\s*)>\s+/,
        'unordered-list': /^(\s*)(\*|-|\+)\s+/,
        'ordered-list': /^(\s*)\d+\.\s+/,
    };
    var map = {
        'quote': '> ',
        'unordered-list': '* ',
        'ordered-list': '1. ',
    };
    
    var changes = [];
    for (var i = startPoint.line; i <= endPoint.line; i++) {
        var text = cm.getLine(view, i);
        var newText;
        
        if (stat[name]) {
            newText = text.replace(repl[name], '$1');
        } else {
            newText = map[name] + text;
        }
        
        changes.push({
            from: cm.posToOffset(view.state.doc, { line: i, ch: 0 }),
            to: cm.posToOffset(view.state.doc, { line: i, ch: text.length }),
            insert: newText,
        });
    }
    
    if (changes.length > 0) {
        view.dispatch({ changes: changes });
    }
    cm.focus(view);
}

function _toggleBlock(editor, type, blockStartEnd) {
    if (editor.cm.dom.lastChild && editor.cm.dom.lastChild.classList.contains('editor-preview-active'))
        return;

    blockStartEnd = (typeof blockStartEnd === 'undefined') ? editor.options.blockStyles[type] : blockStartEnd;
    var view = editor.cm;
    var stat = cm.getState(view);
    var text;
    var start = blockStartEnd[0];
    var end = blockStartEnd[1];

    var startPoint = cm.getCursor(view, 'start');
    var endPoint = cm.getCursor(view, 'end');

    if (stat[type]) {
        text = cm.getLine(view, startPoint.line);
        start = text.slice(0, startPoint.ch);
        end = text.slice(startPoint.ch);
        
        if (type == 'bold') {
            start = start.replace(/(\*\*|__)(?![\s\S]*(\*\*|__))/, '');
            end = end.replace(/(\*\*|__)/, '');
        } else if (type == 'italic') {
            start = start.replace(/(\*|_)(?![\s\S]*(\*|_))/, '');
            end = end.replace(/(\*|_)/, '');
        } else if (type == 'strikethrough') {
            start = start.replace(/(~~)(?![\s\S]*(~~))/, '');
            end = end.replace(/(~~)/, '');
        }
        
        cm.replaceRange(view, start + end, {
            line: startPoint.line,
            ch: 0,
        }, {
            line: startPoint.line,
            ch: 99999999999999,
        });
        
        if (type == 'bold' || type == 'strikethrough') {
            startPoint.ch -= 2;
            if (startPoint.line !== endPoint.line || startPoint.ch !== endPoint.ch) {
                endPoint.ch -= 2;
            }
        } else if (type == 'italic') {
            startPoint.ch -= 1;
            if (startPoint.line !== endPoint.line || startPoint.ch !== endPoint.ch) {
                endPoint.ch -= 1;
            }
        }
    } else {
        text = cm.getSelection(view);
        if (type == 'bold') {
            text = text.split('**').join('');
            text = text.split('__').join('');
        } else if (type == 'italic') {
            text = text.split('*').join('');
            text = text.split('_').join('');
        } else if (type == 'strikethrough') {
            text = text.split('~~').join('');
        }
        cm.replaceSelection(view, start + text + end);

        startPoint.ch += start.length;
        endPoint.ch = startPoint.ch + text.length;
    }

    cm.setSelection(view, startPoint, endPoint);
    cm.focus(view);
}

function _toggleLink(editor, type, startEnd, url) {
    if (!editor.cm || editor.isPreviewActive()) {
        return;
    }

    var view = editor.cm;
    var stat = cm.getState(view);
    var active = stat[type];
    
    if (!active) {
        _replaceSelection(view, active, startEnd, url);
        return;
    }

    var startPoint = cm.getCursor(view, 'start');
    var endPoint = cm.getCursor(view, 'end');
    var text = cm.getLine(view, startPoint.line);
    var start = text.slice(0, startPoint.ch);
    var end = text.slice(startPoint.ch);

    if (type == 'link') {
        start = start.replace(/(.*)[^!]\[/, '$1');
    } else if (type == 'image') {
        start = start.replace(/(.*)!\[$/, '$1');
    }
    end = end.replace(/]\(.*?\)/, '');

    cm.replaceRange(view, start + end, {
        line: startPoint.line,
        ch: 0,
    }, {
        line: startPoint.line,
        ch: 99999999999999,
    });

    startPoint.ch -= startEnd[0].length;
    if (startPoint.line !== endPoint.line || startPoint.ch !== endPoint.ch) {
        endPoint.ch -= startEnd[0].length;
    }
    cm.setSelection(view, startPoint, endPoint);
    cm.focus(view);
}

function _cleanBlock(view) {
    if (view.dom.lastChild && view.dom.lastChild.classList.contains('editor-preview-active'))
        return;

    var startPoint = cm.getCursor(view, 'start');
    var endPoint = cm.getCursor(view, 'end');
    var text;

    var changes = [];
    for (var line = startPoint.line; line <= endPoint.line; line++) {
        text = cm.getLine(view, line);
        var newText = text.replace(/^[ ]*([# ]+|\*|-|[> ]+|[0-9]+(.|\)))[ ]*/, '');

        changes.push({
            from: cm.posToOffset(view.state.doc, { line: line, ch: 0 }),
            to: cm.posToOffset(view.state.doc, { line: line, ch: text.length }),
            insert: newText,
        });
    }
    
    if (changes.length > 0) {
        view.dispatch({ changes: changes });
    }
}

/**
 * Convert a number of bytes to a human-readable file size. If you desire
 * to add a space between the value and the unit, you need to add this space
 * to the given units.
 * @param bytes {number} A number of bytes, as integer. Ex: 421137
 * @param units {number[]} An array of human-readable units, ie. [' B', ' K', ' MB']
 * @returns string A human-readable file size. Ex: '412 KB'
 */
function humanFileSize(bytes, units) {
    if (Math.abs(bytes) < 1024) {
        return '' + bytes + units[0];
    }
    var u = 0;
    do {
        bytes /= 1024;
        ++u;
    } while (Math.abs(bytes) >= 1024 && u < units.length);
    return '' + bytes.toFixed(1) + units[u];
}

// Merge the properties of one object into another.
function _mergeProperties(target, source) {
    for (var property in source) {
        if (Object.prototype.hasOwnProperty.call(source, property)) {
            if (source[property] instanceof Array) {
                target[property] = source[property].concat(target[property] instanceof Array ? target[property] : []);
            } else if (
                source[property] !== null &&
                typeof source[property] === 'object' &&
                source[property].constructor === Object
            ) {
                target[property] = _mergeProperties(target[property] || {}, source[property]);
            } else {
                target[property] = source[property];
            }
        }
    }

    return target;
}

// Merge an arbitrary number of objects into one.
function extend(target) {
    for (var i = 1; i < arguments.length; i++) {
        target = _mergeProperties(target, arguments[i]);
    }

    return target;
}

/* The right word count in respect for CJK. */
function wordCount(data) {
    var pattern = /[a-zA-Z0-9_\u00A0-\u02AF\u0392-\u03c9\u0410-\u04F9]+|[\u4E00-\u9FFF\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\uac00-\ud7af]+/g;
    var m = data.match(pattern);
    var count = 0;
    if (m === null) return count;
    for (var i = 0; i < m.length; i++) {
        if (m[i].charCodeAt(0) >= 0x4E00) {
            count += m[i].length;
        } else {
            count += 1;
        }
    }
    return count;
}

var iconClassMap = {
    'bold': 'fa fa-bold',
    'italic': 'fa fa-italic',
    'strikethrough': 'fa fa-strikethrough',
    'heading': 'fa fa-header fa-heading',
    'heading-smaller': 'fa fa-header fa-heading header-smaller',
    'heading-bigger': 'fa fa-header fa-heading header-bigger',
    'heading-1': 'fa fa-header fa-heading header-1',
    'heading-2': 'fa fa-header fa-heading header-2',
    'heading-3': 'fa fa-header fa-heading header-3',
    'code': 'fa fa-code',
    'quote': 'fa fa-quote-left',
    'ordered-list': 'fa fa-list-ol',
    'unordered-list': 'fa fa-list-ul',
    'clean-block': 'fa fa-eraser',
    'link': 'fa fa-link',
    'image': 'fa fa-image',
    'upload-image': 'fa fa-image',
    'table': 'fa fa-table',
    'horizontal-rule': 'fa fa-minus',
    'preview': 'fa fa-eye',
    'side-by-side': 'fa fa-columns',
    'fullscreen': 'fa fa-arrows-alt',
    'guide': 'fa fa-question-circle',
    'undo': 'fa fa-undo',
    'redo': 'fa fa-repeat fa-redo',
};

var toolbarBuiltInButtons = {
    'bold': {
        name: 'bold',
        action: toggleBold,
        className: iconClassMap['bold'],
        title: 'Bold',
        default: true,
    },
    'italic': {
        name: 'italic',
        action: toggleItalic,
        className: iconClassMap['italic'],
        title: 'Italic',
        default: true,
    },
    'strikethrough': {
        name: 'strikethrough',
        action: toggleStrikethrough,
        className: iconClassMap['strikethrough'],
        title: 'Strikethrough',
    },
    'heading': {
        name: 'heading',
        action: toggleHeadingSmaller,
        className: iconClassMap['heading'],
        title: 'Heading',
        default: true,
    },
    'heading-smaller': {
        name: 'heading-smaller',
        action: toggleHeadingSmaller,
        className: iconClassMap['heading-smaller'],
        title: 'Smaller Heading',
    },
    'heading-bigger': {
        name: 'heading-bigger',
        action: toggleHeadingBigger,
        className: iconClassMap['heading-bigger'],
        title: 'Bigger Heading',
    },
    'heading-1': {
        name: 'heading-1',
        action: toggleHeading1,
        className: iconClassMap['heading-1'],
        title: 'Big Heading',
    },
    'heading-2': {
        name: 'heading-2',
        action: toggleHeading2,
        className: iconClassMap['heading-2'],
        title: 'Medium Heading',
    },
    'heading-3': {
        name: 'heading-3',
        action: toggleHeading3,
        className: iconClassMap['heading-3'],
        title: 'Small Heading',
    },
    'separator-1': {
        name: 'separator-1',
    },
    'code': {
        name: 'code',
        action: toggleCodeBlock,
        className: iconClassMap['code'],
        title: 'Code',
    },
    'quote': {
        name: 'quote',
        action: toggleBlockquote,
        className: iconClassMap['quote'],
        title: 'Quote',
        default: true,
    },
    'unordered-list': {
        name: 'unordered-list',
        action: toggleUnorderedList,
        className: iconClassMap['unordered-list'],
        title: 'Generic List',
        default: true,
    },
    'ordered-list': {
        name: 'ordered-list',
        action: toggleOrderedList,
        className: iconClassMap['ordered-list'],
        title: 'Numbered List',
        default: true,
    },
    'clean-block': {
        name: 'clean-block',
        action: cleanBlock,
        className: iconClassMap['clean-block'],
        title: 'Clean block',
    },
    'separator-2': {
        name: 'separator-2',
    },
    'link': {
        name: 'link',
        action: drawLink,
        className: iconClassMap['link'],
        title: 'Create Link',
        default: true,
    },
    'image': {
        name: 'image',
        action: drawImage,
        className: iconClassMap['image'],
        title: 'Insert Image',
        default: true,
    },
    'upload-image': {
        name: 'upload-image',
        action: drawUploadedImage,
        className: iconClassMap['upload-image'],
        title: 'Import an image',
    },
    'table': {
        name: 'table',
        action: drawTable,
        className: iconClassMap['table'],
        title: 'Insert Table',
    },
    'horizontal-rule': {
        name: 'horizontal-rule',
        action: drawHorizontalRule,
        className: iconClassMap['horizontal-rule'],
        title: 'Insert Horizontal Line',
    },
    'separator-3': {
        name: 'separator-3',
    },
    'preview': {
        name: 'preview',
        action: togglePreview,
        className: iconClassMap['preview'],
        noDisable: true,
        title: 'Toggle Preview',
        default: true,
    },
    'side-by-side': {
        name: 'side-by-side',
        action: toggleSideBySide,
        className: iconClassMap['side-by-side'],
        noDisable: true,
        noMobile: true,
        title: 'Toggle Side by Side',
        default: true,
    },
    'fullscreen': {
        name: 'fullscreen',
        action: toggleFullScreen,
        className: iconClassMap['fullscreen'],
        noDisable: true,
        noMobile: true,
        title: 'Toggle Fullscreen',
        default: true,
    },
    'separator-4': {
        name: 'separator-4',
    },
    'guide': {
        name: 'guide',
        action: 'https://www.markdownguide.org/basic-syntax/',
        className: iconClassMap['guide'],
        noDisable: true,
        title: 'Markdown Guide',
        default: true,
    },
    'separator-5': {
        name: 'separator-5',
    },
    'undo': {
        name: 'undo',
        action: undo,
        className: iconClassMap['undo'],
        noDisable: true,
        title: 'Undo',
    },
    'redo': {
        name: 'redo',
        action: redo,
        className: iconClassMap['redo'],
        noDisable: true,
        title: 'Redo',
    },
};

var insertTexts = {
    link: ['[', '](#url#)'],
    image: ['![', '](#url#)'],
    uploadedImage: ['![](#url#)', ''],
    // uploadedImage: ['![](#url#)\n', ''], // TODO: New line insertion doesn't work here.
    table: ['', '\n\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text     | Text     |\n\n'],
    horizontalRule: ['', '\n\n-----\n\n'],
};

var promptTexts = {
    link: 'URL for the link:',
    image: 'URL of the image:',
};

var timeFormat = {
    locale: 'en-US',
    format: {
        hour: '2-digit',
        minute: '2-digit',
    },
};

var blockStyles = {
    'bold': '**',
    'code': '```',
    'italic': '*',
};

/**
 * Texts displayed to the user (mainly on the status bar) for the import image
 * feature. Can be used for customization or internationalization.
 */
var imageTexts = {
    sbInit: 'Attach files by drag and dropping or pasting from clipboard.',
    sbOnDragEnter: 'Drop image to upload it.',
    sbOnDrop: 'Uploading image #images_names#...',
    sbProgress: 'Uploading #file_name#: #progress#%',
    sbOnUploaded: 'Uploaded #image_name#',
    sizeUnits: ' B, KB, MB',
};

/**
 * Errors displayed to the user, using the `errorCallback` option. Can be used for
 * customization or internationalization.
 */
var errorMessages = {
    noFileGiven: 'You must select a file.',
    typeNotAllowed: 'This image type is not allowed.',
    fileTooLarge: 'Image #image_name# is too big (#image_size#).\n' +
        'Maximum file size is #image_max_size#.',
    importError: 'Something went wrong when uploading the image #image_name#.',
};

/**
 * Interface of EasyMDE.
 */
function EasyMDE(options) {
    // Handle options parameter
    options = options || {};

    // Used later to refer to it"s parent
    options.parent = this;

    // Check if Font Awesome needs to be auto downloaded
    var autoDownloadFA = true;

    if (options.autoDownloadFontAwesome === false) {
        autoDownloadFA = false;
    }

    if (options.autoDownloadFontAwesome !== true) {
        var styleSheets = document.styleSheets;
        for (var i = 0; i < styleSheets.length; i++) {
            if (!styleSheets[i].href)
                continue;

            if (styleSheets[i].href.indexOf('//maxcdn.bootstrapcdn.com/font-awesome/') > -1) {
                autoDownloadFA = false;
            }
        }
    }

    if (autoDownloadFA) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://maxcdn.bootstrapcdn.com/font-awesome/latest/css/font-awesome.min.css';
        document.getElementsByTagName('head')[0].appendChild(link);
    }


    // Find the textarea to use
    if (options.element) {
        this.element = options.element;
    } else if (options.element === null) {
        // This means that the element option was specified, but no element was found
        console.log('EasyMDE: Error. No element was found.');
        return;
    }


    // Handle toolbar
    if (options.toolbar === undefined) {
        // Initialize
        options.toolbar = [];


        // Loop over the built in buttons, to get the preferred order
        for (var key in toolbarBuiltInButtons) {
            if (Object.prototype.hasOwnProperty.call(toolbarBuiltInButtons, key)) {
                if (key.indexOf('separator-') != -1) {
                    options.toolbar.push('|');
                }

                if (toolbarBuiltInButtons[key].default === true || (options.showIcons && options.showIcons.constructor === Array && options.showIcons.indexOf(key) != -1)) {
                    options.toolbar.push(key);
                }
            }
        }
    }

    // Editor preview styling class.
    if (!Object.prototype.hasOwnProperty.call(options, 'previewClass')) {
        options.previewClass = 'editor-preview';
    }

    // Handle status bar
    if (!Object.prototype.hasOwnProperty.call(options, 'status')) {
        options.status = ['autosave', 'lines', 'words', 'cursor'];

        if (options.uploadImage) {
            options.status.unshift('upload-image');
        }
    }


    // Add default preview rendering function
    if (!options.previewRender) {
        options.previewRender = function (plainText) {
            // Note: "this" refers to the options object
            return this.parent.markdown(plainText);
        };
    }


    // Set default options for parsing config
    options.parsingConfig = extend({
        highlightFormatting: true, // needed for toggleCodeBlock to detect types of code
    }, options.parsingConfig || {});


    // Merging the insertTexts, with the given options
    options.insertTexts = extend({}, insertTexts, options.insertTexts || {});


    // Merging the promptTexts, with the given options
    options.promptTexts = extend({}, promptTexts, options.promptTexts || {});


    // Merging the blockStyles, with the given options
    options.blockStyles = extend({}, blockStyles, options.blockStyles || {});


    if (options.autosave != undefined) {
        // Merging the Autosave timeFormat, with the given options
        options.autosave.timeFormat = extend({}, timeFormat, options.autosave.timeFormat || {});
    }

    options.iconClassMap = extend({}, iconClassMap, options.iconClassMap || {});

    // Merging the shortcuts, with the given options
    options.shortcuts = extend({}, shortcuts, options.shortcuts || {});

    options.maxHeight = options.maxHeight || undefined;

    options.direction = options.direction || 'ltr';

    if (typeof options.maxHeight !== 'undefined') {
        // Min and max height are equal if maxHeight is set
        options.minHeight = options.maxHeight;
    } else {
        options.minHeight = options.minHeight || '300px';
    }

    options.errorCallback = options.errorCallback || function (errorMessage) {
        alert(errorMessage);
    };

    // Import-image default configuration
    options.uploadImage = options.uploadImage || false;
    options.imageMaxSize = options.imageMaxSize || 2097152; // 1024 * 1024 * 2
    options.imageAccept = options.imageAccept || 'image/png, image/jpeg, image/gif, image/avif';
    options.imageTexts = extend({}, imageTexts, options.imageTexts || {});
    options.errorMessages = extend({}, errorMessages, options.errorMessages || {});
    options.imagePathAbsolute = options.imagePathAbsolute || false;
    options.imageCSRFName = options.imageCSRFName || 'csrfmiddlewaretoken';
    options.imageCSRFHeader = options.imageCSRFHeader || false;
    options.imageInputName = options.imageInputName || 'image';


    // Change unique_id to uniqueId for backwards compatibility
    if (options.autosave != undefined && options.autosave.unique_id != undefined && options.autosave.unique_id != '')
        options.autosave.uniqueId = options.autosave.unique_id;

    // If overlay mode is specified and combine is not provided, default it to true
    if (options.overlayMode && options.overlayMode.combine === undefined) {
        options.overlayMode.combine = true;
    }

    // Update this options
    this.options = options;


    // Auto render
    this.render();


    // The codemirror component is only available after rendering
    // so, the setter for the initialValue can only run after
    // the element has been rendered
    if (options.initialValue && (!this.options.autosave || this.options.autosave.foundSavedValue !== true)) {
        this.value(options.initialValue);
    }
}

/**
 * Upload asynchronously a list of images to a server.
 * @param {FileList} files The files to upload the the server.
 * @param [onSuccess] {function} see EasyMDE.prototype.uploadImage
 * @param [onError] {function} see EasyMDE.prototype.uploadImage
 */
EasyMDE.prototype.uploadImages = function (files, onSuccess, onError) {
    if (files.length === 0) {
        return;
    }
    var names = [];
    for (var i = 0; i < files.length; i++) {
        names.push(files[i].name);
        this.uploadImage(files[i], onSuccess, onError);
    }
    this.updateStatusBar('upload-image', this.options.imageTexts.sbOnDrop.replace('#images_names#', names.join(', ')));
};

/**
 * Upload asynchronously a list of images to a server.
 *
 * Can be triggered by:
 * - drag&drop;
 * - copy-paste;
 * - the browse-file window (opened when the user clicks on the *upload-image* icon).
 * @param imageUploadFunction {Function} The custom function to upload the image passed in options.
 * @param {FileList} files The files to upload the the server.
 */
EasyMDE.prototype.uploadImagesUsingCustomFunction = function (imageUploadFunction, files) {
    if (files.length === 0) {
        return;
    }
    var names = [];
    for (var i = 0; i < files.length; i++) {
        names.push(files[i].name);
        this.uploadImageUsingCustomFunction(imageUploadFunction, files[i]);
    }
    this.updateStatusBar('upload-image', this.options.imageTexts.sbOnDrop.replace('#images_names#', names.join(', ')));
};

/**
 * Update an item in the status bar.
 * @param itemName {string} The name of the item to update (ie. 'upload-image', 'autosave', etc.).
 * @param content {string} the new content of the item to write in the status bar.
 */
EasyMDE.prototype.updateStatusBar = function (itemName, content) {
    if (!this.gui.statusbar) {
        return;
    }

    var matchingClasses = this.gui.statusbar.getElementsByClassName(itemName);
    if (matchingClasses.length === 1) {
        this.gui.statusbar.getElementsByClassName(itemName)[0].textContent = content;
    } else if (matchingClasses.length === 0) {
        console.log('EasyMDE: status bar item ' + itemName + ' was not found.');
    } else {
        console.log('EasyMDE: Several status bar items named ' + itemName + ' was found.');
    }
};

/**
 * Default markdown render.
 */
EasyMDE.prototype.markdown = function (text) {
    if (marked) {
        // Initialize
        var markedOptions;
        if (this.options && this.options.renderingConfig && this.options.renderingConfig.markedOptions) {
            markedOptions = this.options.renderingConfig.markedOptions;
        } else {
            markedOptions = {};
        }

        // Update options
        if (this.options && this.options.renderingConfig && this.options.renderingConfig.singleLineBreaks === false) {
            markedOptions.breaks = false;
        } else {
            markedOptions.breaks = true;
        }

        if (this.options && this.options.renderingConfig && this.options.renderingConfig.codeSyntaxHighlighting === true) {

            /* Get HLJS from config or window */
            var hljs = this.options.renderingConfig.hljs || window.hljs;

            /* Check if HLJS loaded */
            if (hljs) {
                markedOptions.highlight = function (code, language) {
                    if (language && hljs.getLanguage(language)) {
                        return hljs.highlight(language, code).value;
                    } else {
                        return hljs.highlightAuto(code).value;
                    }
                };
            }
        }

        // Set options
        marked.use(markedOptions);

        // Convert the markdown to HTML
        var htmlText = marked.parse(text);

        // Sanitize HTML
        if (this.options.renderingConfig && typeof this.options.renderingConfig.sanitizerFunction === 'function') {
            htmlText = this.options.renderingConfig.sanitizerFunction.call(this, htmlText);
        }

        // Edit the HTML anchors to add 'target="_blank"' by default.
        htmlText = addAnchorTargetBlank(htmlText);

        // Remove list-style when rendering checkboxes
        htmlText = removeListStyleWhenCheckbox(htmlText);

        return htmlText;
    }
};

/**
 * Render editor to the given element.
 */
EasyMDE.prototype.render = function (el) {
    if (!el) {
        el = this.element || document.getElementsByTagName('textarea')[0];
    }

    if (this._rendered && this._rendered === el) {
        // Already rendered.
        return;
    }

    this.element = el;
    var options = this.options;

    var self = this;
    var keyMaps = {};

    for (var key in options.shortcuts) {
        // null stands for "do not bind this command"
        if (options.shortcuts[key] !== null && bindings[key] !== null) {
            (function (key) {
                keyMaps[fixShortcut(options.shortcuts[key])] = function () {
                    var action = bindings[key];
                    if (typeof action === 'function') {
                        action(self);
                    } else if (typeof action === 'string') {
                        window.open(action, '_blank');
                    }
                };
            })(key);
        }
    }

    keyMaps['Esc'] = function () {
        if (self.isFullscreen) toggleFullScreen(self);
    };

    this.documentOnKeyDown = function (e) {
        e = e || window.event;

        if (e.keyCode == 27) {
            if (self.isFullscreen) toggleFullScreen(self);
        }
    };
    document.addEventListener('keydown', this.documentOnKeyDown, false);

    // Build CM6 extensions array
    var extensions = [
        markdown(),
        history(),
        drawSelection(),
        highlightSpecialChars(),
        EditorView.lineWrapping,
        search(),
        fullscreen(),
        syntaxHighlighting(defaultHighlightStyle),
    ];
    
    // Add shortcode and object reference highlighting
    // Pass shortcodeMap from options if provided (e.g., {':smile:': '<img src="...">'})
    extensions.push(shortcodeHighlight(options.shortcodeMap));

    // Add line numbers if enabled
    if (options.lineNumbers === true) {
        extensions.push(lineNumbers());
        extensions.push(highlightActiveLineGutter());
    }

    // Add placeholder if specified
    var placeholderText = options.placeholder || el.getAttribute('placeholder') || '';
    if (placeholderText) {
        extensions.push(placeholder(placeholderText));
    }

    // Add highlight active line
    extensions.push(highlightActiveLine());

    // Build custom keymap for EasyMDE
    var customKeys = [];
    for (var keyName in keyMaps) {
        if (Object.prototype.hasOwnProperty.call(keyMaps, keyName)) {
            var binding = keyMaps[keyName];
            if (typeof binding === 'function') {
                customKeys.push({
                    key: keyName,
                    run: function(view) {
                        binding(view);
                        return true;
                    },
                });
            }
        }
    }

    // Add keymaps
    extensions.push(
        keymap.of([
            ...customKeys,
            ...defaultKeymap,
            ...historyKeymap,
            ...searchKeymap,
            indentWithTab,
        ]),
    );

    // Tab size configuration
    var tabSize = (options.tabSize != undefined) ? options.tabSize : 2;
    extensions.push(EditorState.tabSize.of(tabSize));

    // Direction (LTR/RTL)
    if (options.direction === 'rtl') {
        extensions.push(EditorView.editorAttributes.of({dir: 'rtl'}));
    }

    // Theme
    var theme = (options.theme != undefined) ? options.theme : 'easymde';
    extensions.push(EditorView.theme({}, {dark: theme === 'easymde-dark'}));

    // Spell check
    if (options.nativeSpellcheck !== false) {
        extensions.push(EditorView.contentAttributes.of({spellcheck: 'true'}));
    }

    // Image upload handlers
    if (options.uploadImage) {
        extensions.push(imageUploadPlugin({
            onDragEnter: function() {
                self.updateStatusBar('upload-image', self.options.imageTexts.sbOnDragEnter);
            },
            onDragEnd: function() {
                self.updateStatusBar('upload-image', self.options.imageTexts.sbInit);
            },
            onDragLeave: function() {
                self.updateStatusBar('upload-image', self.options.imageTexts.sbInit);
            },
            onDragOver: function() {
                self.updateStatusBar('upload-image', self.options.imageTexts.sbOnDragEnter);
            },
            onDrop: function(files) {
                if (options.imageUploadFunction) {
                    self.uploadImagesUsingCustomFunction(options.imageUploadFunction, files);
                } else {
                    self.uploadImages(files);
                }
            },
            onPaste: function(files) {
                if (options.imageUploadFunction) {
                    self.uploadImagesUsingCustomFunction(options.imageUploadFunction, files);
                } else {
                    self.uploadImages(files);
                }
            },
        }));
    }

    // Create update listener for change events and forceSync
    extensions.push(EditorView.updateListener.of(function(update) {
        if (update.docChanged && self.cm) {
            if (options.forceSync === true && self.element) {
                self.element.value = cm.getValue(self.cm);
            }
            // Trigger autosave if configured
            if (self.autosaveTimeoutId) {
                clearTimeout(self.autosaveTimeoutId);
            }
            if (self.options && self.options.autosave && self.options.autosave.enabled) {
                self.autosaveTimeoutId = setTimeout(function() {
                    self.autosave();
                }, self.options.autosave.delay || 10000);
            }
        }
    }));

    // Create the EditorView
    var view = new EditorView({
        doc: el.value || '',
        extensions: extensions,
    });

    // Store the CM6 view and options
    this.cm = view;
    this.options = options;
    this.element = el;
    this.isFullscreen = false;
    
    // Store fullscreen toggle for keymap
    this.toggleFullscreen = function() {
        view.dispatch({ effects: toggleFullscreenEffect.of(null) });
    };

    // Insert the editor after the textarea
    el.style.display = 'none';
    el.parentNode.insertBefore(view.dom, el.nextSibling);

    // Apply min/max height
    view.scrollDOM.style.minHeight = options.minHeight;

    if (typeof options.maxHeight !== 'undefined') {
        view.scrollDOM.style.height = options.maxHeight;
    }

    this.gui = {};

    // Wrap Codemirror with container before create toolbar, etc,
    // to use with sideBySideFullscreen option.
    var easyMDEContainer = document.createElement('div');
    easyMDEContainer.classList.add('EasyMDEContainer');
    easyMDEContainer.setAttribute('role', 'application');
    var cmWrapper = view.dom;
    cmWrapper.parentNode.insertBefore(easyMDEContainer, cmWrapper);
    easyMDEContainer.appendChild(cmWrapper);

    if (options.toolbar !== false) {
        this.gui.toolbar = this.createToolbar();
    }
    if (options.status !== false) {
        this.gui.statusbar = this.createStatusbar();
    }
    if (options.autosave != undefined && options.autosave.enabled === true) {
        this.autosave(); // use to load localstorage content
    }

    function calcHeight(naturalWidth, naturalHeight) {
        var height;
        var contentEl = document.querySelector('.cm-content') || document.querySelector('.cm-scroller');
        var viewportWidth = contentEl ? window.getComputedStyle(contentEl).width.replace('px', '') : 800;
        if (naturalWidth < viewportWidth) {
            height = naturalHeight + 'px';
        } else {
            height = (naturalHeight / naturalWidth * 100) + '%';
        }
        return height;
    }

    function assignImageBlockAttributes(parentEl, img) {
        var url = (new URL(img.url, document.baseURI)).href;
        parentEl.setAttribute('data-img-src', url);
        parentEl.setAttribute('style', '--bg-image:url(' + url + ');--width:' + img.naturalWidth + 'px;--height:' + calcHeight(img.naturalWidth, img.naturalHeight));
        // CM6 handles editor resizing automatically
    }

    function handleImages() {
        if (!options.previewImagesInEditor) {
            return;
        }

        easyMDEContainer.querySelectorAll('.cm-image-marker').forEach(function (e) {
            var parentEl = e.parentElement;
            if (!parentEl.innerText.match(/^!\[.*?\]\(.*\)/g)) {
                // if img pasted on the same line with other text, don't preview, preview only images on separate line
                return;
            }
            if (!parentEl.hasAttribute('data-img-src')) {
                var srcAttr = parentEl.innerText.match(/!\[.*?\]\((.*?)\)/); // might require better parsing according to markdown spec
                if (!window.EMDEimagesCache) {
                    window.EMDEimagesCache = {};
                }

                if (srcAttr && srcAttr.length >= 2) {
                    var keySrc = srcAttr[1];

                    if (options.imagesPreviewHandler) {
                        var newSrc = options.imagesPreviewHandler(srcAttr[1]);
                        // defensive check making sure the handler provided by the user returns a string
                        if (typeof newSrc === 'string') {
                            keySrc = newSrc;
                        }
                    }

                    if (!window.EMDEimagesCache[keySrc]) {
                        window.EMDEimagesCache[keySrc] = {};
                        var img = document.createElement('img');
                        img.onload = function () {
                            window.EMDEimagesCache[keySrc] = {
                                naturalWidth: img.naturalWidth,
                                naturalHeight: img.naturalHeight,
                                url: keySrc,
                            };
                            assignImageBlockAttributes(parentEl, window.EMDEimagesCache[keySrc]);
                        };
                        img.src = keySrc;
                    } else {
                        assignImageBlockAttributes(parentEl, window.EMDEimagesCache[keySrc]);
                    }
                }
            }
        });
    }

    // Add CM6 update listener for image handling
    var imageUpdateEffect = EditorView.updateListener.of(function(update) {
        if (update.docChanged || update.viewportChanged) {
            handleImages();
        }
    });
    view.dispatch({ effects: StateEffect.appendConfig.of([imageUpdateEffect]) });

    this.gui.sideBySide = this.createSideBySide();
    this._rendered = this.element;

    if (options.autofocus === true || el.autofocus) {
        view.focus();
    }

    // No need for CM6 refresh (removed CM5 workaround)
};

EasyMDE.prototype.cleanup = function () {
    document.removeEventListener('keydown', this.documentOnKeyDown);
};

// Safari, in Private Browsing Mode, looks like it supports localStorage but all calls to setItem throw QuotaExceededError. We're going to detect this and set a variable accordingly.
function isLocalStorageAvailable() {
    if (typeof localStorage === 'object') {
        try {
            localStorage.setItem('smde_localStorage', 1);
            localStorage.removeItem('smde_localStorage');
        } catch (e) {
            return false;
        }
    } else {
        return false;
    }

    return true;
}

EasyMDE.prototype.autosave = function () {
    if (isLocalStorageAvailable()) {
        var easyMDE = this;

        if (this.options.autosave.uniqueId == undefined || this.options.autosave.uniqueId == '') {
            console.log('EasyMDE: You must set a uniqueId to use the autosave feature');
            return;
        }

        if (this.options.autosave.binded !== true) {
            if (easyMDE.element.form != null && easyMDE.element.form != undefined) {
                easyMDE.element.form.addEventListener('submit', function () {
                    clearTimeout(easyMDE.autosaveTimeoutId);
                    easyMDE.autosaveTimeoutId = undefined;

                    localStorage.removeItem('smde_' + easyMDE.options.autosave.uniqueId);
                });
            }

            this.options.autosave.binded = true;
        }

        if (this.options.autosave.loaded !== true) {
            if (typeof localStorage.getItem('smde_' + this.options.autosave.uniqueId) == 'string' && localStorage.getItem('smde_' + this.options.autosave.uniqueId) != '') {
                cm.setValue(this.cm, localStorage.getItem('smde_' + this.options.autosave.uniqueId));
                this.options.autosave.foundSavedValue = true;
            }

            this.options.autosave.loaded = true;
        }

        var value = easyMDE.value();
        if (value !== '') {
            localStorage.setItem('smde_' + this.options.autosave.uniqueId, value);
        } else {
            localStorage.removeItem('smde_' + this.options.autosave.uniqueId);
        }

        var el = document.getElementById('autosaved');
        if (el != null && el != undefined && el != '') {
            var d = new Date();
            var dd = new Intl.DateTimeFormat([this.options.autosave.timeFormat.locale, 'en-US'], this.options.autosave.timeFormat.format).format(d);
            var save = this.options.autosave.text == undefined ? 'Autosaved: ' : this.options.autosave.text;

            el.innerHTML = save + dd;
        }
    } else {
        console.log('EasyMDE: localStorage not available, cannot autosave');
    }
};

EasyMDE.prototype.clearAutosavedValue = function () {
    if (isLocalStorageAvailable()) {
        if (this.options.autosave == undefined || this.options.autosave.uniqueId == undefined || this.options.autosave.uniqueId == '') {
            console.log('EasyMDE: You must set a uniqueId to clear the autosave value');
            return;
        }

        localStorage.removeItem('smde_' + this.options.autosave.uniqueId);
    } else {
        console.log('EasyMDE: localStorage not available, cannot autosave');
    }
};

/**
 * Open the browse-file window to upload an image to a server.
 * @param [onSuccess] {function} see EasyMDE.prototype.uploadImage
 * @param [onError] {function} see EasyMDE.prototype.uploadImage
 */
EasyMDE.prototype.openBrowseFileWindow = function (onSuccess, onError) {
    var self = this;
    var imageInput = this.gui.toolbar.getElementsByClassName('imageInput')[0];
    imageInput.click(); //dispatchEvent(new MouseEvent('click'));  // replaced with click() for IE11 compatibility.
    function onChange(event) {
        if (self.options.imageUploadFunction) {
            self.uploadImagesUsingCustomFunction(self.options.imageUploadFunction, event.target.files);
        } else {
            self.uploadImages(event.target.files, onSuccess, onError);
        }
        imageInput.removeEventListener('change', onChange);
    }

    imageInput.addEventListener('change', onChange);
};

/**
 * Upload an image to the server.
 *
 * @param file {File} The image to upload, as a HTML5 File object (https://developer.mozilla.org/en-US/docs/Web/API/File)
 * @param [onSuccess] {function} A callback function to execute after the image has been successfully uploaded, with one parameter:
 * - url (string): The URL of the uploaded image.
 * @param [onError] {function} A callback function to execute when the image upload fails, with one parameter:
 * - error (string): the detailed error to display to the user (based on messages from options.errorMessages).
 */
EasyMDE.prototype.uploadImage = function (file, onSuccess, onError) {
    var self = this;
    onSuccess = onSuccess || function onSuccess(imageUrl) {
        afterImageUploaded(self, imageUrl);
    };

    function onErrorSup(errorMessage) {
        // show error on status bar and reset after 10000ms
        self.updateStatusBar('upload-image', errorMessage);

        setTimeout(function () {
            self.updateStatusBar('upload-image', self.options.imageTexts.sbInit);
        }, 10000);

        // run custom error handler
        if (onError && typeof onError === 'function') {
            onError(errorMessage);
        }
        // run error handler from options, this alerts the message.
        self.options.errorCallback(errorMessage);
    }

    function fillErrorMessage(errorMessage) {
        var units = self.options.imageTexts.sizeUnits.split(',');
        return errorMessage
            .replace('#image_name#', file.name)
            .replace('#image_size#', humanFileSize(file.size, units))
            .replace('#image_max_size#', humanFileSize(self.options.imageMaxSize, units));
    }

    if (file.size > this.options.imageMaxSize) {
        onErrorSup(fillErrorMessage(this.options.errorMessages.fileTooLarge));
        return;
    }

    var formData = new FormData();
    formData.append('image', file);

    // insert CSRF body token if provided in config.
    if (self.options.imageCSRFToken && !self.options.imageCSRFHeader) {
        formData.append(self.options.imageCSRFName, self.options.imageCSRFToken);
    }

    var request = new XMLHttpRequest();
    request.upload.onprogress = function (event) {
        if (event.lengthComputable) {
            var progress = '' + Math.round((event.loaded * 100) / event.total);
            self.updateStatusBar('upload-image', self.options.imageTexts.sbProgress.replace('#file_name#', file.name).replace('#progress#', progress));
        }
    };
    request.open('POST', this.options.imageUploadEndpoint);

    // insert CSRF header token if provided in config.
    if (self.options.imageCSRFToken && self.options.imageCSRFHeader) {
        request.setRequestHeader(self.options.imageCSRFName, self.options.imageCSRFToken);
    }

    request.onload = function () {
        try {
            var response = JSON.parse(this.responseText);
        } catch (error) {
            console.error('EasyMDE: The server did not return a valid json.');
            onErrorSup(fillErrorMessage(self.options.errorMessages.importError));
            return;
        }
        if (this.status === 200 && response && !response.error && response.data && response.data.filePath) {
            onSuccess((self.options.imagePathAbsolute ? '' : (window.location.origin + '/')) + response.data.filePath);
        } else {
            if (response.error && response.error in self.options.errorMessages) {  // preformatted error message
                onErrorSup(fillErrorMessage(self.options.errorMessages[response.error]));
            } else if (response.error) {  // server side generated error message
                onErrorSup(fillErrorMessage(response.error));
            } else {  //unknown error
                console.error('EasyMDE: Received an unexpected response after uploading the image.'
                    + this.status + ' (' + this.statusText + ')');
                onErrorSup(fillErrorMessage(self.options.errorMessages.importError));
            }
        }
    };

    request.onerror = function (event) {
        console.error('EasyMDE: An unexpected error occurred when trying to upload the image.'
            + event.target.status + ' (' + event.target.statusText + ')');
        onErrorSup(self.options.errorMessages.importError);
    };

    request.send(formData);

};

/**
 * Upload an image to the server using a custom upload function.
 *
 * @param imageUploadFunction {Function} The custom function to upload the image passed in options
 * @param file {File} The image to upload, as a HTML5 File object (https://developer.mozilla.org/en-US/docs/Web/API/File).
 */
EasyMDE.prototype.uploadImageUsingCustomFunction = function (imageUploadFunction, file) {
    var self = this;

    function onSuccess(imageUrl) {
        afterImageUploaded(self, imageUrl);
    }

    function onError(errorMessage) {
        var filledErrorMessage = fillErrorMessage(errorMessage);
        // show error on status bar and reset after 10000ms
        self.updateStatusBar('upload-image', filledErrorMessage);

        setTimeout(function () {
            self.updateStatusBar('upload-image', self.options.imageTexts.sbInit);
        }, 10000);

        // run error handler from options, this alerts the message.
        self.options.errorCallback(filledErrorMessage);
    }

    function fillErrorMessage(errorMessage) {
        var units = self.options.imageTexts.sizeUnits.split(',');
        return errorMessage
            .replace('#image_name#', file.name)
            .replace('#image_size#', humanFileSize(file.size, units))
            .replace('#image_max_size#', humanFileSize(self.options.imageMaxSize, units));
    }

    imageUploadFunction.apply(this, [file, onSuccess, onError]);
};

EasyMDE.prototype.setPreviewMaxHeight = function () {
    var wrapper = this.cm.dom;
    var preview = wrapper.nextSibling;

    // Calc preview max height
    var paddingTop = parseInt(window.getComputedStyle(wrapper).paddingTop);
    var borderTopWidth = parseInt(window.getComputedStyle(wrapper).borderTopWidth);
    var optionsMaxHeight = parseInt(this.options.maxHeight);
    var wrapperMaxHeight = optionsMaxHeight + paddingTop * 2 + borderTopWidth * 2;
    var previewMaxHeight = wrapperMaxHeight.toString() + 'px';

    preview.style.height = previewMaxHeight;
};

EasyMDE.prototype.createSideBySide = function () {
    var view = this.cm;
    var wrapper = view.dom;
    var preview = wrapper.nextSibling;

    if (!preview || !preview.classList.contains('editor-preview-side')) {
        preview = document.createElement('div');
        preview.className = 'editor-preview-side editor-preview';

        if (this.options.previewClass) {

            if (Array.isArray(this.options.previewClass)) {
                for (var i = 0; i < this.options.previewClass.length; i++) {
                    preview.classList.add(this.options.previewClass[i]);
                }

            } else if (typeof this.options.previewClass === 'string') {
                preview.classList.add(this.options.previewClass);
            }
        }

        wrapper.parentNode.insertBefore(preview, wrapper.nextSibling);
    }

    if (typeof this.options.maxHeight !== 'undefined') {
        this.setPreviewMaxHeight();
    }

    if (this.options.syncSideBySidePreviewScroll === false) return preview;
    
    // Syncs scroll  editor -> preview
    var cScroll = false;
    var pScroll = false;
    var scrollDOM = view.scrollDOM;
    scrollDOM.addEventListener('scroll', function () {
        if (cScroll) {
            cScroll = false;
            return;
        }
        pScroll = true;
        var height = scrollDOM.scrollHeight - scrollDOM.clientHeight;
        var ratio = parseFloat(scrollDOM.scrollTop) / height;
        var move = (preview.scrollHeight - preview.clientHeight) * ratio;
        preview.scrollTop = move;
    });

    // Syncs scroll  preview -> editor
    preview.onscroll = function () {
        if (pScroll) {
            pScroll = false;
            return;
        }
        cScroll = true;
        var height = preview.scrollHeight - preview.clientHeight;
        var ratio = parseFloat(preview.scrollTop) / height;
        var move = (scrollDOM.scrollHeight - scrollDOM.clientHeight) * ratio;
        scrollDOM.scrollTop = move;
    };
    return preview;
};

EasyMDE.prototype.createToolbar = function (items) {
    items = items || this.options.toolbar;

    if (!items || items.length === 0) {
        return;
    }
    var i;
    for (i = 0; i < items.length; i++) {
        if (toolbarBuiltInButtons[items[i]] != undefined) {
            items[i] = toolbarBuiltInButtons[items[i]];
        }
    }

    var bar = document.createElement('div');
    bar.className = 'editor-toolbar';
    bar.setAttribute('role', 'toolbar');

    var self = this;

    var toolbarData = {};
    self.toolbar = items;

    for (i = 0; i < items.length; i++) {
        if (items[i].name == 'guide' && self.options.toolbarGuideIcon === false)
            continue;

        if (self.options.hideIcons && self.options.hideIcons.indexOf(items[i].name) != -1)
            continue;

        // Fullscreen does not work well on mobile devices (even tablets)
        // In the future, hopefully this can be resolved
        if ((items[i].name == 'fullscreen' || items[i].name == 'side-by-side') && isMobile())
            continue;


        // Don't include trailing separators
        if (items[i] === '|') {
            var nonSeparatorIconsFollow = false;

            for (var x = (i + 1); x < items.length; x++) {
                if (items[x] !== '|' && (!self.options.hideIcons || self.options.hideIcons.indexOf(items[x].name) == -1)) {
                    nonSeparatorIconsFollow = true;
                }
            }

            if (!nonSeparatorIconsFollow)
                continue;
        }


        // Create the icon and append to the toolbar
        (function (item) {
            var el;
            if (item === '|') {
                el = createSep();
            } else if (item.children) {
                el = createToolbarDropdown(item, self.options.toolbarTips, self.options.shortcuts, self);
            } else {
                el = createToolbarButton(item, true, self.options.toolbarTips, self.options.shortcuts, 'button', self);
            }


            toolbarData[item.name || item] = el;
            bar.appendChild(el);

            // Create the input element (ie. <input type='file'>), used among
            // with the 'import-image' icon to open the browse-file window.
            if (item.name === 'upload-image') {
                var imageInput = document.createElement('input');
                imageInput.className = 'imageInput';
                imageInput.type = 'file';
                imageInput.multiple = true;
                imageInput.name = self.options.imageInputName;
                imageInput.accept = self.options.imageAccept;
                imageInput.style.display = 'none';
                imageInput.style.opacity = 0;
                bar.appendChild(imageInput);
            }
        })(items[i]);
    }

    self.toolbar_div = bar;
    self.toolbarElements = toolbarData;

    var view = this.cm;
    if (!view) {
        console.error('EasyMDE: Editor view not initialized when creating toolbar');
        return bar;
    }
    
    // Debug: Check what's available
    if (typeof EditorView.updateListener === 'undefined') {
        console.error('EasyMDE: EditorView.updateListener is undefined');
        console.log('EditorView keys:', Object.keys(EditorView));
        console.log('viewModule keys:', Object.keys(viewModule));
    }
    
    // Add CM6 update listener for cursor activity
    var updateListenerFacet = EditorView.updateListener;
    if (!updateListenerFacet) {
        console.error('EasyMDE: Cannot find updateListener facet');
        return bar;
    }
    
    var cursorUpdateEffect = updateListenerFacet.of(function(update) {
        if (update.selectionSet) {
            var stat = getState(view);
            for (var key in toolbarData) {
                (function (key) {
                    var el = toolbarData[key];
                    if (stat[key]) {
                        el.classList.add('active');
                    } else if (key != 'fullscreen' && key != 'side-by-side') {
                        el.classList.remove('active');
                    }
                })(key);
            }
        }
    });
    
    view.dispatch({ effects: StateEffect.appendConfig.of([cursorUpdateEffect]) });

    var cmWrapper = view.dom;
    cmWrapper.parentNode.insertBefore(bar, cmWrapper);
    return bar;
};

EasyMDE.prototype.createStatusbar = function (status) {
    // Initialize
    status = status || this.options.status;
    var options = this.options;
    var view = this.cm;

    // Make sure the status variable is valid
    if (!status || status.length === 0) {
        return;
    }

    // Set up the built-in items
    var items = [];
    var i, onUpdate, onActivity, defaultValue;

    for (i = 0; i < status.length; i++) {
        // Reset some values
        onUpdate = undefined;
        onActivity = undefined;
        defaultValue = undefined;


        // Handle if custom or not
        if (typeof status[i] === 'object') {
            items.push({
                className: status[i].className,
                defaultValue: status[i].defaultValue,
                onUpdate: status[i].onUpdate,
                onActivity: status[i].onActivity,
            });
        } else {
            var name = status[i];

            if (name === 'words') {
                defaultValue = function (el) {
                    el.innerHTML = wordCount(cm.getValue(view));
                };
                onUpdate = function (el) {
                    el.innerHTML = wordCount(cm.getValue(view));
                };
            } else if (name === 'lines') {
                defaultValue = function (el) {
                    el.innerHTML = cm.lineCount(view);
                };
                onUpdate = function (el) {
                    el.innerHTML = cm.lineCount(view);
                };
            } else if (name === 'cursor') {
                defaultValue = function (el) {
                    el.innerHTML = '1:1';
                };
                onActivity = function (el) {
                    var pos = cm.getCursor(view);
                    var posLine = pos.line + 1;
                    var posColumn = pos.ch + 1;
                    el.innerHTML = posLine + ':' + posColumn;
                };
            } else if (name === 'autosave') {
                defaultValue = function (el) {
                    if (options.autosave != undefined && options.autosave.enabled === true) {
                        el.setAttribute('id', 'autosaved');
                    }
                };
            } else if (name === 'upload-image') {
                defaultValue = function (el) {
                    el.innerHTML = options.imageTexts.sbInit;
                };
            }

            items.push({
                className: name,
                defaultValue: defaultValue,
                onUpdate: onUpdate,
                onActivity: onActivity,
            });
        }
    }


    // Create element for the status bar
    var bar = document.createElement('div');
    bar.className = 'editor-statusbar';


    // Create a new span for each item
    for (i = 0; i < items.length; i++) {
        // Store in temporary variable
        var item = items[i];


        // Create span element
        var el = document.createElement('span');
        el.className = item.className;


        // Ensure the defaultValue is a function
        if (typeof item.defaultValue === 'function') {
            item.defaultValue(el);
        }


        // Ensure the onUpdate is a function
        if (typeof item.onUpdate === 'function') {
            // Create a closure around the span of the current action, then execute the onUpdate handler
            // Use CM6 update listener
            var updateEffect = EditorView.updateListener.of((function (el, item) {
                return function (update) {
                    if (update.docChanged) {
                        item.onUpdate(el);
                    }
                };
            }(el, item)));
            view.dispatch({ effects: StateEffect.appendConfig.of([updateEffect]) });
        }
        if (typeof item.onActivity === 'function') {
            // Create a closure around the span of the current action, then execute the onActivity handler
            // Use CM6 selection update listener
            var activityEffect = EditorView.updateListener.of((function (el, item) {
                return function (update) {
                    if (update.selectionSet) {
                        item.onActivity(el);
                    }
                };
            }(el, item)));
            view.dispatch({ effects: StateEffect.appendConfig.of([activityEffect]) });
        }


        // Append the item to the status bar
        bar.appendChild(el);
    }


    // Insert the status bar into the DOM
    var cmWrapper = this.cm.dom;
    cmWrapper.parentNode.insertBefore(bar, cmWrapper.nextSibling);
    return bar;
};

/**
 * Get or set the text content.
 */
EasyMDE.prototype.value = function (val) {
    var view = this.cm;
    if (val === undefined) {
        return cm.getValue(view);
    } else {
        cm.setValue(view, val);
        if (this.isPreviewActive()) {
            var wrapper = view.dom;
            var preview = wrapper.lastChild;
            var preview_result = this.options.previewRender(val, preview);
            if (preview_result !== null) {
                preview.innerHTML = preview_result;
            }

        }
        return this;
    }
};


/**
 * Bind static methods for exports.
 */
EasyMDE.toggleBold = toggleBold;
EasyMDE.toggleItalic = toggleItalic;
EasyMDE.toggleStrikethrough = toggleStrikethrough;
EasyMDE.toggleBlockquote = toggleBlockquote;
EasyMDE.toggleHeadingSmaller = toggleHeadingSmaller;
EasyMDE.toggleHeadingBigger = toggleHeadingBigger;
EasyMDE.toggleHeading1 = toggleHeading1;
EasyMDE.toggleHeading2 = toggleHeading2;
EasyMDE.toggleHeading3 = toggleHeading3;
EasyMDE.toggleHeading4 = toggleHeading4;
EasyMDE.toggleHeading5 = toggleHeading5;
EasyMDE.toggleHeading6 = toggleHeading6;
EasyMDE.toggleCodeBlock = toggleCodeBlock;
EasyMDE.toggleUnorderedList = toggleUnorderedList;
EasyMDE.toggleOrderedList = toggleOrderedList;
EasyMDE.cleanBlock = cleanBlock;
EasyMDE.drawLink = drawLink;
EasyMDE.drawImage = drawImage;
EasyMDE.drawUploadedImage = drawUploadedImage;
EasyMDE.drawTable = drawTable;
EasyMDE.drawHorizontalRule = drawHorizontalRule;
EasyMDE.undo = undo;
EasyMDE.redo = redo;
EasyMDE.togglePreview = togglePreview;
EasyMDE.toggleSideBySide = toggleSideBySide;
EasyMDE.toggleFullScreen = toggleFullScreen;

/**
 * Bind instance methods for exports.
 */
EasyMDE.prototype.toggleBold = function () {
    toggleBold(this);
};
EasyMDE.prototype.toggleItalic = function () {
    toggleItalic(this);
};
EasyMDE.prototype.toggleStrikethrough = function () {
    toggleStrikethrough(this);
};
EasyMDE.prototype.toggleBlockquote = function () {
    toggleBlockquote(this);
};
EasyMDE.prototype.toggleHeadingSmaller = function () {
    toggleHeadingSmaller(this);
};
EasyMDE.prototype.toggleHeadingBigger = function () {
    toggleHeadingBigger(this);
};
EasyMDE.prototype.toggleHeading1 = function () {
    toggleHeading1(this);
};
EasyMDE.prototype.toggleHeading2 = function () {
    toggleHeading2(this);
};
EasyMDE.prototype.toggleHeading3 = function () {
    toggleHeading3(this);
};
EasyMDE.prototype.toggleHeading4 = function () {
    toggleHeading4(this);
};
EasyMDE.prototype.toggleHeading5 = function () {
    toggleHeading5(this);
};
EasyMDE.prototype.toggleHeading6 = function () {
    toggleHeading6(this);
};
EasyMDE.prototype.toggleCodeBlock = function () {
    toggleCodeBlock(this);
};
EasyMDE.prototype.toggleUnorderedList = function () {
    toggleUnorderedList(this);
};
EasyMDE.prototype.toggleOrderedList = function () {
    toggleOrderedList(this);
};
EasyMDE.prototype.cleanBlock = function () {
    cleanBlock(this);
};
EasyMDE.prototype.drawLink = function () {
    drawLink(this);
};
EasyMDE.prototype.drawImage = function () {
    drawImage(this);
};
EasyMDE.prototype.drawUploadedImage = function () {
    drawUploadedImage(this);
};
EasyMDE.prototype.drawTable = function () {
    drawTable(this);
};
EasyMDE.prototype.drawHorizontalRule = function () {
    drawHorizontalRule(this);
};
EasyMDE.prototype.undo = function () {
    undo(this);
};
EasyMDE.prototype.redo = function () {
    redo(this);
};
EasyMDE.prototype.togglePreview = function () {
    togglePreview(this);
};
EasyMDE.prototype.toggleSideBySide = function () {
    toggleSideBySide(this);
};
EasyMDE.prototype.toggleFullScreen = function () {
    toggleFullScreen(this);
};

EasyMDE.prototype.isPreviewActive = function () {
    var wrapper = this.cm.dom;
    var preview = wrapper.lastChild;

    return preview.classList.contains('editor-preview-active');
};

EasyMDE.prototype.isSideBySideActive = function () {
    var wrapper = this.cm.dom;
    var preview = wrapper.nextSibling;

    return preview.classList.contains('editor-preview-active-side');
};

EasyMDE.prototype.isFullscreenActive = function () {
    return this.isFullscreen || false;
};

EasyMDE.prototype.getState = function () {
    return getState(this.cm);
};

EasyMDE.prototype.toTextArea = function () {
    var view = this.cm;
    var wrapper = view.dom;
    var easyMDEContainer = wrapper.parentNode;

    if (easyMDEContainer) {
        if (this.gui.toolbar) {
            easyMDEContainer.removeChild(this.gui.toolbar);
        }
        if (this.gui.statusbar) {
            easyMDEContainer.removeChild(this.gui.statusbar);
        }
        if (this.gui.sideBySide) {
            easyMDEContainer.removeChild(this.gui.sideBySide);
        }
    }

    // Unwrap easyMDEcontainer before removing editor
    easyMDEContainer.parentNode.insertBefore(wrapper, easyMDEContainer);
    easyMDEContainer.remove();

    // Destroy CM6 view and show textarea
    view.destroy();
    this.element.style.display = '';

    if (this.autosaveTimeoutId) {
        clearTimeout(this.autosaveTimeoutId);
        this.autosaveTimeoutId = undefined;
        this.clearAutosavedValue();
    }
};

module.exports = EasyMDE;
