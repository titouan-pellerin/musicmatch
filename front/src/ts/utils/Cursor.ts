import raf from './Raf';

class Cursor {
  delay = 10;
  cursorEl: HTMLElement;
  _x = 0;
  _y = 0;
  endX = window.innerWidth / 2;
  endY = window.innerHeight / 2;
  timer = 0;
  canvas: HTMLCanvasElement | null = null;
  hoverables: NodeListOf<Element> | null = null;
  isHovering = false;
  isVisible = false;
  boundEventListeners: ((e: MouseEvent) => void)[] = [];
  constructor() {
    this.cursorEl = document.querySelector('.cursor') as HTMLElement;
    this.canvas = document.querySelector('canvas');
  }

  init() {
    this.boundEventListeners.push(
      this.mouseMove.bind(this),
      this.mouseDown.bind(this),
      this.hideCursor.bind(this),
    );
    window.addEventListener('mousemove', this.boundEventListeners[0]);
    document.addEventListener('mousedown', this.boundEventListeners[1]);
    document.addEventListener('mouseleave', this.boundEventListeners[2]);
    // document.addEventListener('mouseup', this.showCursor.bind(this));
    raf.subscribe('cursor', this.update.bind(this));
    // if (this.canvas) this.canvas.classList.add('hide-default-cursor');
    // this.cursorEl.classList.remove('hide-cursor');
  }

  stop() {
    window.removeEventListener('mousemove', this.boundEventListeners[0]);
    document.removeEventListener('mousedown', this.boundEventListeners[1]);
    document.removeEventListener('mouseleave', this.boundEventListeners[2]);
    // document.removeEventListener('mouseenter', this.showCursor.bind(this));
    // document.removeEventListener('mouseup', this.showCursor.bind(this));
    raf.unsubscribe('cursor');
    clearTimeout(this.timer);
    if (this.canvas) this.canvas.classList.remove('hide-default-cursor');
    this.cursorEl.classList.add('hide-cursor');
  }

  mouseMove(e: MouseEvent) {
    this.endX = e.clientX;
    this.endY = e.clientY;

    clearTimeout(this.timer);
    this.timer = setTimeout(this.showCursor.bind(this), 1000);
  }

  mouseDown() {
    if (this.isVisible) this.hideCursor();
  }

  mouseEnterHoverable() {
    this.isHovering = true;
    this.hideCursor();
  }
  mouseLeaveHoverable() {
    this.isHovering = false;
  }

  showCursor() {
    if (!this.isHovering) {
      this.isVisible = true;
      if (this.canvas) this.canvas.classList.add('hide-default-cursor');
      this.cursorEl.classList.remove('hide-cursor');
    }
  }
  hideCursor() {
    setTimeout(() => {
      this.isVisible = false;
      if (this.canvas) this.canvas.classList.remove('hide-default-cursor');
      this.cursorEl.classList.add('hide-cursor');
    }, 200);
  }

  update() {
    this._x += (this.endX - this._x) / this.delay;
    this._y += (this.endY - this._y) / this.delay;
    this.cursorEl.style.transform = `translate(${
      this._x - this.cursorEl.clientWidth * 0.5
    }px, ${this._y - this.cursorEl.clientHeight * 0.5}px)`;
  }

  updateArray() {
    this.hoverables = document.querySelectorAll('.hoverable');
    this.hoverables.forEach((hoverable) => {
      hoverable.addEventListener('mouseenter', this.mouseEnterHoverable.bind(this));
      hoverable.addEventListener('mouseleave', this.mouseLeaveHoverable.bind(this));
    });
  }
}

const cursor = new Cursor();
export default cursor;
