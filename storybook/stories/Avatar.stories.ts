import { Room, Avatar } from "@jankuss/shroom";
import { AvatarAction } from "../../dist/objects/avatar/enum/AvatarAction";
import { createShroom } from "./common/createShroom";

export default {
  title: "Avatar",
};

export function Default() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
            xxxxxxxxxxxxxxxx
            x000000000000000
            x000000000000000
            x000000000000000
            x000000000000000
            x000000000000000
            x000000000000000
            x000000000000000
            x000000000000000
            x000000000000000
            x000000000000000
          `,
    });

    const looks: string[] = [
      "ch-255-91.lg-280-64.sh-290-1408.hd-180-2.hr-831-61",
      "hd-180-1.ch-255-66.lg-280-110.sh-305-62.ha-1012-110.hr-828-61",
      "hd-190-1.hr-3163-1356.he-3081-62.fa-1203-62.cc-3153-1336.lg-3058-110",
    ];

    /*
    for (let y = 1; y < 6; y++) {
      for (let x = 0; x < 8; x++) {
        const avatar = new Avatar({
          look: "ch-255-91.lg-280-64.sh-290-1408.hd-180-2.hr-831-61",
          direction: x % 8,
          roomX: 1 + x * 2,
          roomY: y * 2,
          roomZ: 0,
        });

        avatar.addAction(AvatarAction.Respect);

        room.addRoomObject(avatar);
      }
    }*/

    for (let i = 0; i < 8; i++) {
      const avatar = new Avatar({
        look: looks[i % looks.length],
        direction: i,
        roomX: 1 + i * 2,
        roomY: 1,
        roomZ: 0,
      });
      avatar.addAction(AvatarAction.Respect);

      room.addRoomObject(avatar);
    }

    application.stage.addChild(room);
  });
}

export function Walking() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
           xxxxxxxx
           x0000000
           x0000000
           x0000000
           x0000000
          `,
    });

    const avatar = new Avatar({
      look: "hd-180-1.hr-100-61.ch-210-66.lg-280-110.sh-305-62",
      direction: 4,
      roomX: 1,
      roomY: 1,
      roomZ: 0,
    });

    setTimeout(() => {
      avatar.walk(1, 2, 0, { direction: 4 });
    }, 3000);

    setTimeout(() => {
      avatar.walk(2, 2, 0, { direction: 2 });
      avatar.walk(3, 2, 0, { direction: 2 });
    }, 5000);

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;

    room.addRoomObject(avatar);

    application.stage.addChild(room);
  });
}

export function Drinking() {
  return createShroom(({ application, shroom }) => {
    const room = Room.create(shroom, {
      tilemap: `
            0000000
            0000000
            0000000
            0000000
          `,
    });

    const avatars: Avatar[] = [];

    for (let i = 0; i < 4; i++) {
      const avatar = new Avatar({
        look: "hd-180-1.hr-100-61.ch-210-66.lg-280-110.sh-305-62",
        direction: i * 2,
        roomX: i * 2,
        roomY: 0,
        roomZ: 0,
      });

      avatar.item = 40;

      room.addRoomObject(avatar);
      avatars.push(avatar);
    }

    for (let i = 0; i < 4; i++) {
      const avatar = new Avatar({
        look: "hd-180-1.hr-100-61.ch-210-66.lg-280-110.sh-305-62",
        direction: i * 2 + 1,
        roomX: i * 2,
        roomY: 3,
        roomZ: 0,
      });

      avatar.item = 40;

      room.addRoomObject(avatar);
      avatars.push(avatar);
    }

    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;

    application.stage.addChild(room);
  });
}
