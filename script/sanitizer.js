// Sanitizer untuk membersihkan kode HTML sebelum ditampilkan
function sanitizeHTML(htmlString) {
    // Membuat elemen DOM sementara
    const temp = document.createElement('div');
    temp.innerHTML = htmlString;

    // Daftar tag dan atribut yang diizinkan
    const allowedTags = [
        'a', 'abbr', 'acronym', 'address', 'applet', 'area', 'article', 'aside', 'audio',
        'b', 'base', 'basefont', 'bdi', 'bdo', 'bgsound', 'big', 'blink', 'blockquote', 'body', 'br', 'button',
        'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'command', 'content',
        'data', 'datalist', 'dd', 'del', 'detals', 'dfn', 'dialog', 'dir', 'div', 'dl', 'dt',
        'element', 'em', 'embed',
        'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'frame', 'frameset',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html',
        'i', 'iframe', 'image', 'img', 'input', 'ins', 'isindex',
        'kbd', 'keygen',
        'label', 'legend', 'li', 'link', 'listing',
        'main', 'map', 'mark', 'marquee', 'menu', 'menuitem', 'meta', 'meter', 'multicol',
        'nav', 'nobr', 'noembed', 'noframes', 'noscript',
        'object', 'ol', 'optgroup', 'option', 'output',
        'p', 'param', 'picture', 'plaintext', 'pre', 'progress',
        'q',
        'rp', 'rt', 'ruby',
        's', 'samp', 'script', 'section', 'select', 'shadow', 'small', 'source', 'spacer', 'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup',
        'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'tt',
        'u', 'ul',
        'var', 'video',
        'wbr',
        // SVG elements
        'svg', 'animate', 'animateMotion', 'animateTransform', 'circle', 'clipPath', 'defs', 'desc', 'ellipse', 'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feDropShadow', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence', 'filter', 'foreignObject', 'g', 'image', 'line', 'linearGradient', 'marker', 'mask', 'metadata', 'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect', 'stop', 'switch', 'symbol', 'text', 'textPath', 'tspan', 'use', 'view'
    ];

    const allowedAttributes = [
        'accept', 'action', 'align', 'alt', 'autocomplete', 'background', 'bgcolor', 'border',
        'cellpadding', 'cellspacing', 'checked', 'cite', 'class', 'clear', 'color', 'cols',
        'colspan', 'coords', 'datetime', 'default', 'dir', 'disabled', 'download', 'enctype',
        'face', 'for', 'headers', 'height', 'hidden', 'high', 'href', 'hreflang', 'id',
        'ismap', 'label', 'lang', 'list', 'loop', 'low', 'max', 'maxlength', 'media', 'method',
        'min', 'multiple', 'name', 'noshade', 'novalidate', 'nowrap', 'open', 'optimum', 'pattern',
        'placeholder', 'poster', 'preload', 'pubdate', 'radiogroup', 'readonly', 'rel', 'required',
        'rev', 'reversed', 'rows', 'rowspan', 'spellcheck', 'scope', 'selected', 'shape', 'size',
        'sizes', 'span', 'srclang', 'start', 'src', 'srcset', 'step', 'style', 'summary', 'tabindex',
        'title', 'type', 'usemap', 'valign', 'value', 'width', 'xmlns',
        // SVG attributes
        'accent-height', 'accumulate', 'additive', 'alignment-baseline', 'ascent', 'attributename',
        'attributetype', 'azimuth', 'basefrequency', 'baseline-shift', 'begin', 'bias', 'by', 'calcmode',
        'cap-height', 'clip', 'clip-path', 'clip-rule', 'color', 'color-interpolation', 'color-interpolation-filters',
        'color-profile', 'color-rendering', 'cx', 'cy', 'd', 'dx', 'dy', 'diffuseconstant', 'direction',
        'display', 'divisor', 'dur', 'edgemode', 'elevation', 'end', 'fill', 'fill-opacity', 'fill-rule',
        'filter', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch',
        'font-style', 'font-variant', 'font-weight', 'fx', 'fy', 'g1', 'g2', 'glyph-name', 'glyphref',
        'gradientunits', 'gradienttransform', 'height', 'href', 'id', 'ideographic', 'image-rendering',
        'in', 'in2', 'intercept', 'k', 'k1', 'k2', 'k3', 'k4', 'kernelmatrix', 'kernelunitlength',
        'kerning', 'keypoints', 'keysplines', 'keytimes', 'lang', 'lengthadjust', 'letter-spacing',
        'lighting-color', 'local', 'marker-end', 'marker-mid', 'marker-start', 'markerheight', 'markerunits',
        'markerwidth', 'maskcontentunits', 'maskunits', 'mathematical', 'mode', 'numoctaves', 'offset',
        'opacity', 'operator', 'order', 'orient', 'orientation', 'origin', 'overflow', 'overline-position',
        'overline-thickness', 'paint-order', 'panose-1', 'path', 'pathlength', 'patterncontentunits',
        'patterntransform', 'patternunits', 'point', 'points', 'preservealpha', 'preserveaspectratio',
        'primitiveunits', 'r', 'radius', 'refx', 'refy', 'rendering-intent', 'repeatcount', 'repeatdur',
        'requiredextensions', 'requiredfeatures', 'restart', 'result', 'rotate', 'rx', 'ry', 'scale',
        'seed', 'shaperendering', 'slope', 'spacing', 'specularconstant', 'specularexponent', 'speed',
        'spreadmethod', 'startoffset', 'stddeviation', 'stemh', 'stemv', 'stitchtiles', 'stop-color',
        'stop-opacity', 'strikethrough-position', 'strikethrough-thickness', 'string', 'stroke',
        'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit',
        'stroke-opacity', 'stroke-width', 'surfaceScale', 'systemlanguage', 'tablevalues', 'targetx',
        'targety', 'text-anchor', 'text-decoration', 'text-rendering', 'textlength', 'to', 'transform',
        'type', 'u1', 'u2', 'underline-position', 'underline-thickness', 'unicode', 'unicode-bidi',
        'unicode-range', 'units-per-em', 'v-alphabetic', 'v-hanging', 'v-ideographic', 'v-mathematical',
        'values', 'vector-effect', 'version', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'viewbox',
        'viewtarget', 'visibility', 'width', 'widths', 'word-spacing', 'writing-mode', 'x', 'x-height',
        'x1', 'x2', 'xchannelselector', 'xmlns', 'y', 'y1', 'y2', 'ychannelselector', 'z', 'zoomandpan'
    ];

    // Fungsi rekursif untuk membersihkan elemen
    function cleanNode(node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const tagName = node.tagName.toLowerCase();
            
            // Jika tag tidak diizinkan, hapus node
            if (!allowedTags.includes(tagName)) {
                node.parentNode?.removeChild(node);
                return;
            }

            // Hapus atribut yang tidak diizinkan
            const attributes = Array.from(node.attributes);
            for (const attr of attributes) {
                if (!allowedAttributes.includes(attr.name.toLowerCase())) {
                    node.removeAttribute(attr.name);
                }
                // Blokir event handler
                else if (attr.name.toLowerCase().startsWith('on')) {
                    node.removeAttribute(attr.name);
                }
            }

            // Rekursif ke child nodes
            const children = Array.from(node.childNodes);
            for (const child of children) {
                cleanNode(child);
            }
        } else if (node.nodeType === Node.TEXT_NODE) {
            // Biarkan text node apa adanya
        }
    }

    // Membersihkan semua node dalam elemen sementara
    const nodes = Array.from(temp.childNodes);
    for (const node of nodes) {
        cleanNode(node);
    }

    // Kembalikan HTML yang telah dibersihkan
    return temp.innerHTML;
}

// Fungsi untuk menangani pratinjau dengan aman
function safePreview(content) {
    // Sanitasi konten sebelum ditampilkan
    const sanitizedContent = sanitizeHTML(content);

    // Buat dokumen HTML lengkap dengan script untuk menangani link
    const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Pratinjau Aman</title>
            <style>
                body {
                    margin: 0;
                    padding: 20px;
                    font-family: Arial, sans-serif;
                }
                a {
                    color: #007bff;
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            ${sanitizedContent}
            <script>
                // Tangani semua link untuk membukanya dalam modal
                document.addEventListener('DOMContentLoaded', function() {
                    const links = document.querySelectorAll('a[href]');
                    links.forEach(function(link) {
                        link.addEventListener('click', function(e) {
                            e.preventDefault();
                            const href = this.getAttribute('href');

                            // Kirim pesan ke parent window untuk membuka modal
                            if (window.parent && window.parent !== window) {
                                window.parent.postMessage({
                                    type: 'openLinkModal',
                                    url: href,
                                    source: 'preview'
                                }, '*');
                            }
                        });
                    });
                });
            </script>
        </body>
        </html>
    `;

    return fullHtml;
}