import { SessionVariant } from '../types';

export const VARIANT_TREE_MAPPING: Record<SessionVariant, { name: string; imagePath: string }> = {
  sprint: { name: 'Sprout', imagePath: '/images/tree_hero.png' },      // We only have tree_hero for now
  classic: { name: 'Bonsai', imagePath: '/images/tree_hero.png' },
  deep_work: { name: 'Pine', imagePath: '/images/tree_hero.png' },
  flow: { name: 'Oak', imagePath: '/images/tree_hero.png' },
  custom: { name: 'Custom Tree', imagePath: '/images/tree_hero.png' },
};

export function getTreeForVariant(variant: SessionVariant) {
  return VARIANT_TREE_MAPPING[variant] || VARIANT_TREE_MAPPING.classic;
}
