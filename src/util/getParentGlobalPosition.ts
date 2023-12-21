import { Container, Point } from 'pixi.js';

export function getParentGlobalPosition(container: Container) {
  return container.parent.toGlobal(new Point(0, 0));
}
