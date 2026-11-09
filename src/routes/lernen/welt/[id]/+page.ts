import { error } from '@sveltejs/kit';
import { GAMES, WORLDS } from '#lib/games/catalog';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
  const world = WORLDS.find((w) => w.id === params.id);
  if (!world) error(404, 'Welt nicht gefunden');
  const { settings } = await parent();
  return { world, gameIds: GAMES.filter((g) => g.world === world.id && !settings.disabled.includes(g.id)).map((g) => g.id) };
};
