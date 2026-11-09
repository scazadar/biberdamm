import { speechUrl } from '#lib/server/speech';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ serverSpeech: !!speechUrl() });
