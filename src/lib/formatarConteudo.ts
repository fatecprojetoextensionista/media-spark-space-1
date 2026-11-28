const ESPACO_INICIAL = /^\s+/;

function temMidia(el: Element) {
  return Boolean(el.querySelector("img, iframe, video, svg, picture"));
}

function tirarEspacoInicial(p: Element) {
  const caminhante = p.ownerDocument.createTreeWalker(p, NodeFilter.SHOW_TEXT);
  let no = caminhante.nextNode();
  while (no) {
    const texto = no.textContent ?? "";
    const limpo = texto.replace(ESPACO_INICIAL, "");
    no.textContent = limpo;
    if (limpo.length > 0) return;
    no = caminhante.nextNode();
  }
}

export function formatarConteudo(html: string): string {
  if (!html || typeof DOMParser === "undefined") return html;
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const raiz = doc.body.firstElementChild;
  if (!raiz) return html;

  raiz.querySelectorAll("p").forEach((p) => {
    const texto = (p.textContent ?? "").replace(/\s+/g, "");
    if (!texto && !temMidia(p)) {
      p.remove();
      return;
    }
    if (temMidia(p) || p.closest("li, blockquote, td, th, figure")) return;
    tirarEspacoInicial(p);
    const alinhamento = (p.getAttribute("style") ?? "").replace(/\s/g, "").toLowerCase();
    if (alinhamento.includes("text-align:center") || alinhamento.includes("text-align:right")) return;
    p.classList.add("recuo");
  });

  return raiz.innerHTML;
}
