export function dangerousHtml(html) {
    return {
        __html: html || ''
    };
}