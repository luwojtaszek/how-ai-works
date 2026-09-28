import { ORDER } from '../../data.js';
import { topicMd } from '../../lib/outputs.js';
export const getStaticPaths = () => ORDER.map((id) => ({ params: { id } }));
export const GET = ({ params, site }) => topicMd('pl', params.id, site);
