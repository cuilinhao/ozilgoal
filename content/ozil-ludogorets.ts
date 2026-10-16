import { SITE_URL } from "./public-pages";

export const ludogoretsArticle = {
  path: "/mesut-ozil-ludogorets-goal",
  title: "Mesut Özil's Ludogorets Goal: Why It Became Iconic",
  description: "The story of Özil's solo winner in Arsenal's 3–2 comeback at Ludogorets on 1 November 2016: the chip, the composure and the finish.",
  // First successful production deployment: c8b9f2ff-e2be-402e-918e-d0e238e1187a.
  datePublished: "2026-10-16T02:35:17.959Z",
  author: "Ozil Goal Generator editorial team",
  image: "/ozil-goal/ludogorets-match-card.png",
  imageAlt: "Original match graphic: Ludogorets 2–3 Arsenal, 1 November 2016, with Arsenal recovering from 0–2 down",
  sources: {
    match: {
      label: "UEFA match report: Özil completes Arsenal comeback at Ludogorets (1 November 2016)",
      url: "https://www.uefa.com/uefachampionsleague/news/0233-0e9591456f5d-b1a200c579f0-1000/",
    },
    sequence: {
      label: "The Irish Times: on-the-night report and description of the winning goal",
      url: "https://www.irishtimes.com/sport/soccer/champions-league/sublime-mesut-ozil-goal-helps-arsenal-qualify-in-style-1.2851272",
    },
    technical: {
      label: "UEFA technical observers: top ten goals of the 2016/17 Champions League season",
      url: "https://www.uefa.com/uefachampionsleague/news/0250-0c51182d04c4-a88e837790e7-1000--observers-choice-goals-of-the-ucl-season/",
    },
  },
} as const;

export const ludogoretsArticleUrl = `${SITE_URL}${ludogoretsArticle.path}`;
