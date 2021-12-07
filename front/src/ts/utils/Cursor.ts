import raf from './Raf';
import gsap from 'gsap';

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
  hasLeft = false;
  boundEventListeners: ((e: MouseEvent) => void)[] = [];
  constructor() {
    this.cursorEl = document.querySelector('.cursor') as HTMLElement;
    this.canvas = document.querySelector('canvas');
  }

  init() {
    this.boundEventListeners.push(
      this.mouseMove.bind(this),
      this.mouseDown.bind(this),
      this.mouseLeaveDocument.bind(this),
      this.mouseEnterDocument.bind(this),
    );
    window.addEventListener('mousemove', this.boundEventListeners[0]);
    document.addEventListener('mousedown', this.boundEventListeners[1]);
    document.addEventListener('mouseleave', this.boundEventListeners[2]);
    document.addEventListener('mouseenter', this.boundEventListeners[3]);
    // document.addEventListener('mouseup', this.showCursor.bind(this));
    raf.subscribe('cursor', this.update.bind(this));
    // if (this.canvas) this.canvas.classList.add('hide-default-cursor');
    // this.cursorEl.classList.remove('hide-cursor');
  }

  stop() {
    window.removeEventListener('mousemove', this.boundEventListeners[0]);
    document.removeEventListener('mousedown', this.boundEventListeners[1]);
    document.removeEventListener('mouseleave', this.boundEventListeners[2]);
    document.removeEventListener('mouseenter', this.boundEventListeners[3]);
    // document.removeEventListener('mouseenter', this.showCursor.bind(this));
    // document.removeEventListener('mouseup', this.showCursor.bind(this));
    raf.unsubscribe('cursor');
    clearTimeout(this.timer);
    this.hideCursor();
  }

  mouseMove(e: MouseEvent) {
    if (!this.hasLeft) {
      this.endX = e.clientX;
      this.endY = e.clientY;
      clearTimeout(this.timer);
      this.timer = setTimeout(this.showCursor.bind(this), 1000);
    }
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

  mouseLeaveDocument() {
    clearTimeout(this.timer);
    this.hasLeft = true;
    this.hideCursor();
  }
  mouseEnterDocument() {
    this.hasLeft = false;
  }

  showCursor() {
    if (!this.isHovering) {
      this.isVisible = true;
      this.cursorEl.classList.remove('hide-cursor');
      gsap.to(this.cursorEl, {
        duration: 0.55,
        opacity: 1,
        ease: 'ease',
        onComplete: () => {
          if (this.canvas) this.canvas.classList.add('hide-default-cursor');
        },
      });
    }
  }
  hideCursor() {
    this.isVisible = false;
    gsap.to(this.cursorEl, {
      duration: 0.35,
      opacity: 0,
      ease: 'ease',
      onComplete: () => {
        if (this.canvas) this.canvas.classList.remove('hide-default-cursor');
      },
    });
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
