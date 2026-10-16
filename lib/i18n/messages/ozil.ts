import ko from './ozil-ko.json';
import ja from './ozil-ja.json';
import fr from './ozil-fr.json';
import es from './ozil-es.json';
import zhTW from './ozil-zh-TW.json';
import type { TranslatedLocale } from '../routing';
import type { Messages } from '../translator';

export const ozilMessages: Record<TranslatedLocale, Messages> = { ko, ja, fr, es, 'zh-TW': zhTW };
