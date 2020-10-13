import { Model } from '@sjmeverett/clync-define';
import { generateModelInterface } from './generateModelInterface';

export function generateModelInterfaces(
  models: Model[],
  site: 'client' | 'server',
  imports: Set<string>,
): string {
  let interfaces = '';

  for (const model of models) {
    const [_interface] = generateModelInterface(model, site, imports);
    interfaces += _interface;
  }

  return interfaces;
}

export function generateImports(imports: Set<string>) {
  return Array.from(imports.values()).join('\n') + '\n';
}
