'use strict';

var Decoration = require('@codemirror/view').Decoration;
var EditorView = require('@codemirror/view').EditorView;
var WidgetType = require('@codemirror/view').WidgetType;

/**
 * Plugin to highlight shortcodes and object references in markdown
 * Applies CSS classes:
 * - cm-shortcode-valid for valid shortcodes like :shortCode:
 * - cm-object-ref for object references like @Object<123>
 * 
 * If shortcodeMap is provided, replaces shortcodes with icons/widgets
 */

var shortcodeRegex = /:\w+:/g;
var objectRefRegex = /@(?:"[^"]+"|[^<]+)<\d+>/g;

// Widget for rendering shortcode icons
var ShortcodeWidget = function(shortcodeName, iconHtml) {
    WidgetType.call(this);
    this.shortcodeName = shortcodeName;
    this.iconHtml = iconHtml;
};
ShortcodeWidget.prototype = Object.create(WidgetType.prototype);
ShortcodeWidget.prototype.eq = function(other) {
    return other.shortcodeName === this.shortcodeName;
};
ShortcodeWidget.prototype.toDOM = function() {
    var span = document.createElement('span');
    span.className = 'cm-shortcode-icon';
    span.setAttribute('data-shortcode', this.shortcodeName);
    span.innerHTML = this.iconHtml;
    return span;
};
ShortcodeWidget.prototype.ignoreEvent = function() {
    return false;
};

function createShortcodePlugin(shortcodeMap) {
    var shortcodeDecorationField = EditorView.decorations.compute(['doc'], function(state) {
        var decorations = [];
        var doc = state.doc;
        
        for (var i = 1; i <= doc.lines; i++) {
            var line = doc.line(i);
            var text = line.text;
            
            // Find shortcodes
            var shortcodeMatch;
            shortcodeRegex.lastIndex = 0;
            while ((shortcodeMatch = shortcodeRegex.exec(text)) !== null) {
                var shortcodeFrom = line.from + shortcodeMatch.index;
                var shortcodeTo = shortcodeFrom + shortcodeMatch[0].length;
                var shortcodeName = shortcodeMatch[0]; // e.g., ":smile:"
                
                // Check if we should replace with widget
                if (shortcodeMap && shortcodeMap[shortcodeName]) {
                    decorations.push(
                        Decoration.replace({
                            widget: new ShortcodeWidget(shortcodeName, shortcodeMap[shortcodeName]),
                        }).range(shortcodeFrom, shortcodeTo),
                    );
                } else {
                    // Fallback: just apply CSS class
                    decorations.push(
                        Decoration.mark({
                            class: 'cm-shortcode-valid',
                        }).range(shortcodeFrom, shortcodeTo),
                    );
                }
            }
            
            // Find object references
            var objectRefMatch;
            objectRefRegex.lastIndex = 0;
            while ((objectRefMatch = objectRefRegex.exec(text)) !== null) {
                var objectRefFrom = line.from + objectRefMatch.index;
                var objectRefTo = objectRefFrom + objectRefMatch[0].length;
                decorations.push(
                    Decoration.mark({
                        class: 'cm-object-ref',
                    }).range(objectRefFrom, objectRefTo),
                );
            }
        }
        
        return Decoration.set(decorations);
    });
    
    return shortcodeDecorationField;
}

module.exports = {
    shortcodeHighlight: function(shortcodeMap) {
        return createShortcodePlugin(shortcodeMap);
    },
};
