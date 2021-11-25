import { UserMesh } from './UserMesh';
import { forceSimulation, Simulation } from 'd3-force';
import { SimpleUser, UserAnalysis } from '../../../typings';
import gsap from 'gsap';

export class ForceGraph {
  relations: Map<string, number>;
  usersAnalysis: UserAnalysis[];
  constructor(usersAnalysis: UserAnalysis[]) {
    this.relations = new Map();
    this.usersAnalysis = usersAnalysis;
  }

  showRelations() {
    this.usersAnalysis.forEach((userAnalysis) => {
      userAnalysis.usersWithScores.forEach((userWithScore) => {
        const usersPair = userAnalysis.user.id + ':' + userWithScore.user.id;
        const reversedUsersPair = userWithScore.user.id + ':' + userAnalysis.user.id;
        console.log(
          usersPair,
          reversedUsersPair,
          this.relations.get(userAnalysis.user.id + ':' + userWithScore.user.id),
          this.relations.get(userWithScore.user.id + ':' + userAnalysis.user.id),
        );

        if (!(this.relations.has(usersPair) || this.relations.has(reversedUsersPair)))
          this.relations.set(
            usersPair,
            userWithScore.scores.artistsScore.score +
              userWithScore.scores.tracksScore.score +
              userWithScore.scores.genresScore.score,
          );
      });
    });

    this.relations.forEach((force, key) => {
      const ids = key.split(':');
      const startMesh = UserMesh.userMeshes.get(ids[0]) as UserMesh;
      const targetMesh = UserMesh.userMeshes.get(ids[1]) as UserMesh;
      const normalizedForce = this.normalize(force, 105.5, 0);
      gsap.to(targetMesh.position, {
        duration: 0.75,
        stagger: 0.3,
        x: startMesh.position.x + Math.cos(normalizedForce) + 2,
        y: startMesh.position.y + Math.sin(normalizedForce) + 2,
      });
    });

    return this.relations;
  }

  normalize(val: number, max: number, min: number) {
    return 1 / ((val - min) / (max - min));
  }
}
