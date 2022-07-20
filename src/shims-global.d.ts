interface DocumentFragment {
	adoptedStyleSheets?: CSSStyleSheet[];
}

interface CSSStyleSheet {
	replaceSync?(css: string): unknown;
}

