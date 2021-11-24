import { Clock } from 'three';

class Raf {
  functions: Map<string, () => void>;
  clock: Clock;
  elapsedTime: number = 0;

  constructor() {
    this.functions = new Map();
    this.clock = new Clock();
    this.init();
  }

  subscribe(id: string, fn: () => void) {
    this.functions.set(id, fn);
  }

  unsubscribe(id: string) {
    if (this.functions.has(id)) this.functions.delete(id);
  }

  init() {
    this.update = this.update.bind(this);
    this.update();
  }

  update() {
    requestAnimationFrame(this.update);

    this.elapsedTime = this.clock.getElapsedTime();
    this.functions.forEach((fn) => {
      fn();
    });
  }
}

const raf = new Raf();
export default raf;
