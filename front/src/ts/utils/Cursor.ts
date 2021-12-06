import raf from './Raf';

class Cursor {
  delay = 10;
  cursorEl: HTMLElement;
  hoverArray: NodeListOf<Element> | null = null;
  _x = 0;
  _y = 0;
  endX = window.innerWidth / 2;
  endY = window.innerHeight / 2;
  constructor() {
    this.cursorEl = document.querySelector('.cursor') as HTMLElement;
    window.addEventListener('mousemove', this.mouseMove.bind(this));
    document.addEventListener('mouseleave', this.hideCursor.bind(this));
    document.addEventListener('mouseenter', this.showCursor.bind(this));
    raf.subscribe('cursor', this.update.bind(this));
  }

  mouseMove(e: MouseEvent) {
    this.endX = e.clientX;
    this.endY = e.clientY;
  }

  showCursor() {
    this.cursorEl.classList.remove('hide-cursor');
  }
  hideCursor() {
    this.cursorEl.classList.add('hide-cursor');
  }

  update() {
    this._x += (this.endX - this._x) / this.delay;
    this._y += (this.endY - this._y) / this.delay;
    this.cursorEl.style.transform = `translate(${
      this._x - this.cursorEl.clientWidth * 0.5
    }px, ${this._y - this.cursorEl.clientHeight * 0.5}px)`;
  }

  updateArray() {
    this.hoverArray = document.querySelectorAll('.hoverable');
    this.hoverArray.forEach((hoveredEl) => {
      hoveredEl.addEventListener('mouseleave', this.showCursor.bind(this), false);
      hoveredEl.addEventListener('mouseenter', this.hideCursor.bind(this), false);
    });
  }
}

const cursor = new Cursor();
export default cursor;
