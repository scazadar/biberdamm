import { fail, redirect } from '@sveltejs/kit';
import { db } from '#lib/server/db';
import { audit } from '#lib/server/auth';
import { GAMES } from '#lib/games/catalog';
import { deleteClass, setArchived, updateClassSettings } from '#lib/server/school';
import { requireClass, requireWritableClass, text } from '#lib/server/guard';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, params }) => {
  const { klass } = requireClass(locals, params.id);
  return {
    games: GAMES.filter((g) => g.world).map((g) => ({ id: g.id, title: g.title, icon: g.icon })),
    settings: { calm: !!klass.calm_mode, speech: !!klass.speech, disabled: JSON.parse(klass.disabled_games) as string[] }
  };
};

export const actions: Actions = {
  save: async ({ request, locals, params }) => {
    const { klass } = requireWritableClass(locals, params.id);
    const f = await request.formData();
    const name = text(f, 'name', 60);
    if (!name) return fail(400, { error: 'Der Klassenname darf nicht leer sein.' });
    const enabled = new Set(f.getAll('game').map(String));
    updateClassSettings(db(), klass.id, {
      name,
      calm: f.has('calm'),
      speech: f.has('speech'),
      disabledGames: GAMES.filter((g) => g.world && !enabled.has(g.id)).map((g) => g.id)
    });
    return { message: 'Gespeichert.' };
  },
  archive: async ({ locals, params }) => {
    const { klass, principal } = requireClass(locals, params.id);
    setArchived(db(), klass.id, klass.archived_at == null);
    audit(db(), principal.username, klass.archived_at == null ? 'klasse.archiviert' : 'klasse.reaktiviert', klass.name);
  },
  remove: async ({ locals, params }) => {
    const { klass, principal } = requireClass(locals, params.id);
    deleteClass(db(), klass.id);
    audit(db(), principal.username, 'klasse.geloescht', klass.name);
    redirect(303, '/lehrkraft');
  }
};
