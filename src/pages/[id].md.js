import { ORDER } from '../data.js';
import { SLUG_EN } from '../data.en.js';
import { topicMd } from '../lib/outputs.js';
export const getStaticPaths = () => ORDER.map((id) => ({ params: { id: SLUG_EN[id] || id }, props: { id } }));
export const GET = ({ props, site }) => topicMd('en', props.id, site);
