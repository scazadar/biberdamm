import qrcode from 'qrcode-generator';
import { db } from '#lib/server/db';
import { picturesOf } from '#lib/server/auth';
import { listStudents } from '#lib/server/school';
import { requireClass } from '#lib/server/guard';
import type { PageServerLoad } from './$types';

function qrSvg(text: string) {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  return qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
}

export const load: PageServerLoad = ({ locals, params, url }) => {
  const { klass } = requireClass(locals, params.id);
  return {
    cards: listStudents(db(), klass.id).map((s) => ({
      id: s.id,
      name: s.display_name,
      pictures: picturesOf(s.picture_password),
      qr: qrSvg(`${url.origin}/kind/${klass.code}/${s.id}`)
    }))
  };
};
