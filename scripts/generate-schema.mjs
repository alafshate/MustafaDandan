import ts from 'typescript';
import { writeFileSync } from 'node:fs';

// Generate the runtime validation/editor contract from the existing Angular models.
const file = 'src/app/models/portfolio.models.ts';
const program = ts.createProgram([file], { strictNullChecks: true });
const checker = program.getTypeChecker();
const source = program.getSourceFile(file);
const root = source.statements.find(n => n.name?.text === 'PortfolioData');
function schema(type) {
  if (type.isUnion()) {
    const types = type.types.filter(t => !(t.flags & ts.TypeFlags.Undefined));
    if (types.every(t => t.flags & ts.TypeFlags.BooleanLiteral)) return { type: 'boolean' };
    if (types.every(t => t.isLiteral())) return { type: typeof types[0].value, enum: types.map(t => t.value) };
    if (types.length === 1) return schema(types[0]);
    return { anyOf: types.map(schema) };
  }
  if (type.flags & ts.TypeFlags.Null) return { type: 'null' };
  if (type.flags & ts.TypeFlags.String) return { type: 'string', maxLength: 10000 };
  if (type.flags & ts.TypeFlags.BooleanLike) return { type: 'boolean' };
  if (type.isLiteral()) return { type: typeof type.value, enum: [type.value] };
  if (checker.isArrayType(type)) return { type: 'array', maxItems: 100, items: schema(checker.getTypeArguments(type)[0]) };
  const properties = {}, required = [];
  for (const prop of type.getProperties()) {
    properties[prop.name] = schema(checker.getTypeOfSymbolAtLocation(prop, root));
    if (!(prop.flags & ts.SymbolFlags.Optional)) required.push(prop.name);
  }
  return { type: 'object', properties, required, additionalProperties: false };
}
writeFileSync('server/portfolio.schema.json', JSON.stringify(schema(checker.getTypeAtLocation(root)), null, 2) + '\n');
