export const LIMITE_IMAGEM_MB = 2;

export function erroDaImagem(arquivo: File): string | null {
  if (!arquivo.type.startsWith("image/")) {
    return "Escolha um arquivo de imagem (JPG, PNG, WebP ou GIF).";
  }
  if (arquivo.size > LIMITE_IMAGEM_MB * 1024 * 1024) {
    const tamanho = (arquivo.size / (1024 * 1024)).toFixed(1).replace(".", ",");
    return `A imagem tem ${tamanho} MB e o limite é ${LIMITE_IMAGEM_MB} MB. Reduza a imagem (por exemplo em squoosh.app ou tinypng.com) e tente de novo.`;
  }
  return null;
}
