import { nanoid } from 'nanoid';
export class Room {
  id: string;
  roomUrl: string;
  constructor(id: string | null = null) {
    if (!id) this.id = nanoid(10);
    else this.id = encodeURI(id);
    this.roomUrl =
      window.location.protocol + '//' + window.location.host + '/?room=' + this.id;
  }
}
