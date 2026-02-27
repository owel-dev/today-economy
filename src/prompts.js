import fs from 'fs';
import path from 'path';

const promptDir = path.join(import.meta.dirname, '..', 'prompts');

const loadPrompt = (name) => {
  return fs.readFileSync(path.join(promptDir, `${name}`), 'utf-8');
};

export const PROMPTS = {
  removeUnnecessary: loadPrompt('remove-unnecessary.md'),
  mergeDuplicate: loadPrompt('merge-duplicate.md'),
  summary: loadPrompt('summary.md'),
  addTermsGlossary: loadPrompt('add-terms-glossary.md'),
};