import type { Locale } from "@/lib/i18n/routing";

export type BlogPreviewTopic = "trend" | "photo" | "free";

export type BlogPreviewCopy = {
  kicker: string;
  title: string;
  intro: string;
  viewAll: string;
  read: string;
  articleLanguageNote: string;
  cards: Record<BlogPreviewTopic, {
    label: string;
    eyebrow: string;
    title: string;
    excerpt: string;
  }>;
};

export const blogPreviewCopy: Record<Locale, BlogPreviewCopy> = {
  en: {
    kicker: "OZIL GOAL BLOG",
    title: "The trend. Your photo. Your next video.",
    intro: "Understand the trend, prepare your photo and check the cost before making your own video.",
    viewAll: "Explore all {count} articles",
    read: "Read article",
    articleLanguageNote: "",
    cards: {
      trend: {
        label: "The trend",
        eyebrow: "OZIL GOAL · TREND EXPLAINED",
        title: "What Is the Ozil Goal Trend on TikTok?",
        excerpt: "The football reference, the exaggerated AI sequence and the difference between watching the trend and making your own version.",
      },
      photo: {
        label: "Your photo",
        eyebrow: "OZIL GOAL · PHOTO WALKTHROUGH",
        title: "How Do I Make an Ozil Goal AI Video with My Photo?",
        excerpt: "Choose a suitable photo, follow the real generator controls and know where to find the video when it finishes.",
      },
      free: {
        label: "Cost guide",
        eyebrow: "OZIL GOAL · COST GUIDE",
        title: "Can I Make an Ozil Goal Video for Free?",
        excerpt: "Free samples and prompt text do not mean free video generation. Check the actual render cost and export conditions before you start.",
      },
    },
  },
  ko: {
    kicker: "OZIL GOAL 블로그",
    title: "트렌드를 알아보고, 사진을 고르고, 나만의 영상을 만드세요.",
    intro: "Ozil Goal 트렌드를 이해하고 사진을 준비한 뒤, 영상을 만들기 전에 비용을 확인하세요.",
    viewAll: "전체 {count}개 글 보기",
    read: "글 읽기",
    articleLanguageNote: "아래 소개한 세 글의 전체 내용은 영어로 제공됩니다.",
    cards: {
      trend: {
        label: "트렌드",
        eyebrow: "OZIL GOAL · 트렌드 해설",
        title: "틱톡의 Ozil Goal 트렌드는 무엇인가요?",
        excerpt: "축구 장면의 원형과 과장된 AI 연출을 살펴보고, 트렌드를 보는 것과 직접 만드는 것의 차이를 알아보세요.",
      },
      photo: {
        label: "내 사진",
        eyebrow: "OZIL GOAL · 사진 활용 안내",
        title: "내 사진으로 Ozil Goal AI 영상을 어떻게 만드나요?",
        excerpt: "적합한 사진을 고르고 실제 생성기 사용 단계를 따라가며, 완성된 영상을 어디서 찾는지 알아보세요.",
      },
      free: {
        label: "비용 안내",
        eyebrow: "OZIL GOAL · 비용 안내",
        title: "Ozil Goal 영상을 무료로 만들 수 있나요?",
        excerpt: "무료 샘플과 프롬프트가 무료 영상 생성을 뜻하지는 않습니다. 시작하기 전에 실제 생성 비용과 내보내기 조건을 확인하세요.",
      },
    },
  },
  ja: {
    kicker: "OZIL GOAL ブログ",
    title: "トレンドを知る。写真を選ぶ。次はあなたの動画へ。",
    intro: "Ozil Goalのトレンドを理解し、写真を準備して、動画を作る前に費用を確認しましょう。",
    viewAll: "全{count}記事を見る",
    read: "記事を読む",
    articleLanguageNote: "下の3件の記事本文は英語です。",
    cards: {
      trend: {
        label: "トレンド",
        eyebrow: "OZIL GOAL · トレンド解説",
        title: "TikTokのOzil Goalトレンドとは？",
        excerpt: "元になったサッカーの場面や誇張されたAIの演出を解説し、見るだけの場合と自分で作る場合の違いを紹介します。",
      },
      photo: {
        label: "自分の写真",
        eyebrow: "OZIL GOAL · 写真の使い方",
        title: "自分の写真からOzil GoalのAI動画を作るには？",
        excerpt: "適した写真の選び方、実際の生成画面での操作、完成した動画の確認方法を紹介します。",
      },
      free: {
        label: "費用ガイド",
        eyebrow: "OZIL GOAL · 費用ガイド",
        title: "Ozil Goalの動画は無料で作れる？",
        excerpt: "無料のサンプルやプロンプトがあっても、動画の生成まで無料とは限りません。始める前に生成費用と書き出し条件を確認しましょう。",
      },
    },
  },
  fr: {
    kicker: "BLOG OZIL GOAL",
    title: "La tendance. Votre photo. Votre prochaine vidéo.",
    intro: "Comprenez la tendance Ozil Goal, préparez votre photo et vérifiez le coût avant de créer votre vidéo.",
    viewAll: "Voir les {count} articles",
    read: "Lire l’article",
    articleLanguageNote: "Les trois articles présentés ci-dessous sont en anglais.",
    cards: {
      trend: {
        label: "La tendance",
        eyebrow: "OZIL GOAL · TENDANCE EXPLIQUÉE",
        title: "Qu’est-ce que la tendance Ozil Goal sur TikTok ?",
        excerpt: "Découvrez la référence footballistique, la séquence d’IA exagérée et la différence entre regarder la tendance et créer votre propre version.",
      },
      photo: {
        label: "Votre photo",
        eyebrow: "OZIL GOAL · GUIDE PHOTO",
        title: "Comment créer une vidéo Ozil Goal avec ma photo ?",
        excerpt: "Choisissez une photo adaptée, suivez les commandes réelles du générateur et découvrez où retrouver la vidéo une fois terminée.",
      },
      free: {
        label: "Guide des coûts",
        eyebrow: "OZIL GOAL · GUIDE DES COÛTS",
        title: "Puis-je créer une vidéo Ozil Goal gratuitement ?",
        excerpt: "Des exemples et des prompts gratuits ne signifient pas que la génération vidéo l’est aussi. Vérifiez le coût réel et les conditions d’exportation avant de commencer.",
      },
    },
  },
  es: {
    kicker: "BLOG DE OZIL GOAL",
    title: "El trend. Tu foto. Tu próximo video.",
    intro: "Entiende el trend, prepara tu foto y comprueba el costo antes de crear tu propio video.",
    viewAll: "Explora los {count} artículos",
    read: "Leer artículo",
    articleLanguageNote: "",
    cards: {
      trend: {
        label: "El trend",
        eyebrow: "OZIL GOAL · EL TREND EXPLICADO",
        title: "¿Qué es el trend del gol de Özil en TikTok?",
        excerpt: "De un gol del Arsenal en 2016 a una recreación con tu propia foto: las claves para reconocer el formato y entender sus límites.",
      },
      photo: {
        label: "Tu foto",
        eyebrow: "OZIL GOAL · GUÍA DE FOTOS",
        title: "¿Cómo hacer el gol de Özil con mi propia foto?",
        excerpt: "Cómo elegir una imagen que muestre bien tu cara y tu ropa, preparar el archivo y revisar si el video mantiene tu apariencia.",
      },
      free: {
        label: "Costos",
        eyebrow: "OZIL GOAL · GRATIS Y PRECIOS",
        title: "¿Dónde puedo hacer el video del gol de Özil gratis?",
        excerpt: "Distingue entre una guía gratuita, una plantilla de edición y una generación desde tu foto para saber qué estás pagando.",
      },
    },
  },
  "zh-TW": {
    kicker: "OZIL GOAL 部落格",
    title: "認識趨勢。選好照片。製作你的下一支影片。",
    intro: "了解 Ozil Goal 趨勢、準備照片，並在製作自己的影片前確認費用。",
    viewAll: "查看全部 {count} 篇文章",
    read: "閱讀文章",
    articleLanguageNote: "下方三篇文章的完整內容以英文提供。",
    cards: {
      trend: {
        label: "趨勢介紹",
        eyebrow: "OZIL GOAL · 趨勢解析",
        title: "TikTok 上的 Ozil Goal 趨勢是什麼？",
        excerpt: "了解足球場景的由來、誇張的 AI 影片橋段，以及觀看趨勢與親自製作之間的差別。",
      },
      photo: {
        label: "你的照片",
        eyebrow: "OZIL GOAL · 照片操作指南",
        title: "如何用自己的照片製作 Ozil Goal AI 影片？",
        excerpt: "挑選合適的照片、依照產生器的實際步驟操作，並了解影片完成後到哪裡查看。",
      },
      free: {
        label: "費用指南",
        eyebrow: "OZIL GOAL · 費用指南",
        title: "Ozil Goal 影片可以免費製作嗎？",
        excerpt: "免費範例和提示詞不代表影片產生也免費。開始前請確認實際產生費用與匯出條件。",
      },
    },
  },
};
