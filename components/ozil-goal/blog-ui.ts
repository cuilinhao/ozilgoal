import { OZIL_GOAL_COST } from "@/lib/ozil-goal";
import type { OzilBlogLanguage } from "@/content/ozil-blog/types";
import type { Locale } from "@/lib/i18n/routing";

export function ozilBlogText(source: string): string {
  return source.replaceAll("{ozilCredits}", String(OZIL_GOAL_COST));
}

type ArticleUi = { read: string; contents: string; faq: string; sources: string; more: string; all: string; byline: string; published: string; language: string; translation: string; cta: string; ctaText: string; button: string; blog: string; breadcrumb: string };
export const ozilBlogUi: Record<OzilBlogLanguage, ArticleUi> = {
  en: {
    read: "Read article", contents: "In this article", faq: "Frequently asked questions", sources: "Sources and product references",
    more: "More Ozil Goal guides", all: "All articles", byline: "By the Ozil Goal Generator editorial team", published: "Published", language: "Read a related guide in", translation: "Read this article in",
    cta: "Make your own Ozil Goal video", ctaText: "One photo. A built-in football template. See the current credit cost before generating.", button: "Open the Ozil Goal generator", blog: "Blog", breadcrumb: "Breadcrumb",
  },
  "pt-BR": {
    read: "Ler artigo", contents: "Neste artigo", faq: "Perguntas frequentes", sources: "Fontes e referências do produto",
    more: "Mais guias do gol do Özil", all: "Todos os artigos", byline: "Pela equipe editorial do Ozil Goal Generator", published: "Publicado em", language: "Leia um guia relacionado em", translation: "Leia este artigo em",
    cta: "Crie seu vídeo do gol do Özil", ctaText: "Uma foto e um modelo de futebol pronto. Confira o custo em créditos antes de gerar.", button: "Abrir o gerador do gol do Özil", blog: "Blog", breadcrumb: "Navegação estrutural",
  },
  es: {
    read: "Leer artículo", contents: "En este artículo", faq: "Preguntas frecuentes", sources: "Fuentes y referencias del producto",
    more: "Más guías del gol de Özil", all: "Todos los artículos", byline: "Por el equipo editorial de Ozil Goal Generator", published: "Publicado el", language: "Lee una guía relacionada en", translation: "Lee este artículo en",
    cta: "Crea tu video del gol de Özil", ctaText: "Una foto y una plantilla de fútbol lista para usar. Revisa el coste en créditos antes de generar.", button: "Abrir el generador del gol de Özil", blog: "Blog", breadcrumb: "Ruta de navegación",
  },
  ko: {
    read: "글 읽기", contents: "이 글의 내용", faq: "자주 묻는 질문", sources: "출처 및 제품 참고 자료",
    more: "Ozil Goal 가이드 더 보기", all: "전체 글", byline: "Ozil Goal Generator 편집팀", published: "게시일", language: "다른 언어의 관련 가이드", translation: "다른 언어로 읽기",
    cta: "나만의 Ozil Goal 영상 만들기", ctaText: "사진 한 장과 내장 축구 템플릿으로 시작하세요. 생성 전에 현재 필요한 크레딧을 확인할 수 있습니다.", button: "Ozil Goal 생성기 열기", blog: "블로그", breadcrumb: "탐색 경로",
  },
  ja: {
    read: "記事を読む", contents: "この記事の内容", faq: "よくある質問", sources: "出典と製品の参考情報",
    more: "Ozil Goalのガイドをもっと読む", all: "すべての記事", byline: "Ozil Goal Generator編集部", published: "公開日", language: "他の言語の関連ガイド", translation: "この記事を別の言語で読む",
    cta: "自分だけのOzil Goal動画を作ろう", ctaText: "写真1枚と内蔵のサッカーテンプレートで始められます。生成前に必要なクレジット数を確認できます。", button: "Ozil Goalジェネレーターを開く", blog: "ブログ", breadcrumb: "パンくずリスト",
  },
  fr: {
    read: "Lire l’article", contents: "Dans cet article", faq: "Questions fréquentes", sources: "Sources et références du produit",
    more: "Autres guides Ozil Goal", all: "Tous les articles", byline: "Par la rédaction d’Ozil Goal Generator", published: "Publié le", language: "Lire un guide similaire en", translation: "Lire cet article en",
    cta: "Créez votre propre vidéo Ozil Goal", ctaText: "Une photo et un modèle de football intégré. Consultez le coût actuel en crédits avant de lancer la génération.", button: "Ouvrir le générateur Ozil Goal", blog: "Blog", breadcrumb: "Fil d’Ariane",
  },
  "zh-TW": {
    read: "閱讀文章", contents: "文章目錄", faq: "常見問題", sources: "資料來源與產品參考",
    more: "更多 Ozil Goal 指南", all: "所有文章", byline: "Ozil Goal Generator 編輯團隊", published: "發布日期", language: "閱讀其他語言的相關指南", translation: "以其他語言閱讀本文",
    cta: "製作你的 Ozil Goal 進球影片", ctaText: "上傳一張照片，使用內建足球範本。生成前可以查看目前所需的點數。", button: "開啟 Ozil Goal 生成器", blog: "部落格", breadcrumb: "導覽路徑",
  },
};

type IndexUi = { metaTitle: string; description: string; eyebrow: string; title: string; intro: string; latest: string; latestIntro: string; languages: string; coverAlt: string; coverCaption: string };
export const ozilBlogIndexUi: Record<Locale, IndexUi> = {
  en: {
    metaTitle: "Ozil Goal Blog: Football Trends and AI Video Guides",
    description: "Explore Lamine Yamal, sepak bola, gol pakai and gol de Ozil, with practical guides to football trends, photos, AI videos and credits in six languages.",
    eyebrow: "OZIL GOAL · THE FIELD GUIDE", title: "From “what is this?” to your own goal video.", intro: "Explore football searches and the Ozil Goal trend. Read our latest guides in your language, or browse the original English, Portuguese and Spanish articles.",
    latest: "Latest guides in English", latestIntro: "Four football topics, with the context and practical steps to make your own AI goal video.", languages: "Article collections", coverAlt: "AI reference scene: a woman on a football pitch as a goalkeeper dives past", coverCaption: "AI reference sample · Ozil Goal",
  },
  ko: {
    metaTitle: "Ozil Goal 블로그: 축구 트렌드와 AI 영상 가이드", description: "라민 야말, sepak bola, gol pakai, gol de Ozil을 살펴보세요. 축구 트렌드부터 사진, AI 영상, 크레딧까지 6개 언어로 안내합니다.",
    eyebrow: "OZIL GOAL · 축구 영상 가이드", title: "궁금했던 축구 영상, 이제 직접 만들어 보세요.", intro: "축구 검색어와 Ozil Goal 트렌드를 알아보세요. 최신 가이드는 한국어로, 기존 글은 영어·포르투갈어·스페인어 원문으로 읽을 수 있습니다.",
    latest: "최신 한국어 가이드", latestIntro: "네 가지 축구 주제의 배경과 나만의 AI 골 영상을 만드는 실용적인 방법을 소개합니다.", languages: "글 모음", coverAlt: "골키퍼가 몸을 날리는 축구장에 여성이 서 있는 AI 참고 장면", coverCaption: "AI 참고 샘플 · Ozil Goal",
  },
  ja: {
    metaTitle: "Ozil Goalブログ：サッカーのトレンドとAI動画ガイド", description: "ラミン・ヤマル、sepak bola、gol pakai、gol de Ozilを解説。サッカーのトレンド、写真、AI動画、クレジットの使い方を6言語で紹介します。",
    eyebrow: "OZIL GOAL · サッカー動画ガイド", title: "気になるあの動画から、自分だけのゴール動画へ。", intro: "サッカーの検索キーワードとOzil Goalのトレンドを解説します。最新ガイドは日本語で、既存記事は英語・ポルトガル語・スペイン語の原文で読めます。",
    latest: "日本語の最新ガイド", latestIntro: "4つのサッカートピックの背景と、自分だけのAIゴール動画を作る手順を紹介します。", languages: "記事一覧", coverAlt: "ゴールキーパーが飛び込むサッカー場に女性が立つAI参考シーン", coverCaption: "AI参考サンプル · Ozil Goal",
  },
  fr: {
    metaTitle: "Blog Ozil Goal : tendances du football et guides vidéo IA", description: "Découvrez Lamine Yamal, sepak bola, gol pakai et gol de Ozil. Des guides pratiques sur le football, les photos, les vidéos IA et les crédits, en six langues.",
    eyebrow: "OZIL GOAL · LE GUIDE PRATIQUE", title: "Comprenez la tendance, puis créez votre propre but.", intro: "Explorez les recherches autour du football et la tendance Ozil Goal. Lisez les nouveaux guides en français ou parcourez les articles d’origine en anglais, portugais et espagnol.",
    latest: "Nouveaux guides en français", latestIntro: "Quatre sujets autour du football, avec leur contexte et les étapes pour créer votre vidéo de but avec l’IA.", languages: "Collections d’articles", coverAlt: "Exemple généré par IA : une femme sur un terrain de football tandis qu’un gardien plonge", coverCaption: "Exemple de référence IA · Ozil Goal",
  },
  es: {
    metaTitle: "Blog de Ozil Goal: tendencias de fútbol y guías de video con IA", description: "Descubre Lamine Yamal, sepak bola, gol pakai y gol de Ozil. Guías prácticas de fútbol, fotos, videos con IA y créditos en seis idiomas.",
    eyebrow: "OZIL GOAL · GUÍA PRÁCTICA", title: "Entiende la tendencia y crea tu propio video de gol.", intro: "Explora las búsquedas de fútbol y la tendencia de Ozil Goal. Lee las nuevas guías en español o consulta los artículos originales en inglés, portugués y español.",
    latest: "Nuevas guías en español", latestIntro: "Cuatro temas de fútbol, su contexto y los pasos para crear tu propio video de gol con IA.", languages: "Colecciones de artículos", coverAlt: "Escena de referencia con IA: una mujer en un campo de fútbol mientras un portero se lanza", coverCaption: "Ejemplo de referencia con IA · Ozil Goal",
  },
  "zh-TW": {
    metaTitle: "Ozil Goal 部落格：足球趨勢與 AI 影片指南", description: "認識 Lamine Yamal、sepak bola、gol pakai 與 gol de Ozil。以六種語言提供足球趨勢、照片、AI 影片及點數使用的實用指南。",
    eyebrow: "OZIL GOAL · 足球影片指南", title: "從看懂熱門話題，到製作自己的進球影片。", intro: "認識足球搜尋詞與 Ozil Goal 趨勢。最新指南提供繁體中文，也可以瀏覽既有的英文、葡萄牙文與西班牙文原創文章。",
    latest: "最新繁體中文指南", latestIntro: "四個足球主題，從背景知識到製作個人 AI 進球影片的實用步驟。", languages: "文章分類", coverAlt: "AI 參考場景：足球場上的女性與飛身撲救的守門員", coverCaption: "AI 參考範例 · Ozil Goal",
  },
};
