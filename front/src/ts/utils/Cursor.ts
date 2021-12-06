import raf from './Raf';

export class Cursor {
  delay = 10;
  cursorEl: HTMLElement;
  hoverArray: NodeListOf<Element>;
  _x = 0;
  _y = 0;
  endX = window.innerWidth / 2;
  endY = window.innerHeight / 2;
  constructor(cursorEl: HTMLElement, hoverArray: NodeListOf<Element>) {
    this.cursorEl = cursorEl;
    this.hoverArray = hoverArray;
    window.addEventListener('mousemove', this.mouseMove.bind(this));
    document.addEventListener('mouseleave', this.toggleHideCursor.bind(this));
    document.addEventListener('mouseenter', this.toggleHideCursor.bind(this));
    raf.subscribe('cursor', this.update.bind(this));
    this.hoverArray.forEach((hoveredEl) => {
      hoveredEl.addEventListener('mouseenter', this.mouseHoverToggle.bind(this), false);
      hoveredEl.addEventListener('mouseleave', this.mouseHoverToggle.bind(this), false);
    });
  }

  mouseMove(e: MouseEvent) {
    this.endX = e.pageX;
    this.endY = e.pageY;
  }

  toggleHideCursor() {
    this.cursorEl.classList.toggle('hide-cursor');
  }

  mouseHoverToggle(e: Event) {
    const target = e.target as HTMLElement;
    console.log(target);
    this.toggleHideCursor();
  }

  update() {
    this._x += (this.endX - this._x) / this.delay;
    this._y += (this.endY - this._y) / this.delay;
    this.cursorEl.style.transform = `translate(${
      this._x - this.cursorEl.clientWidth * 0.5
    }px, ${this._y - this.cursorEl.clientHeight * 0.5}px)`;
  }
}
