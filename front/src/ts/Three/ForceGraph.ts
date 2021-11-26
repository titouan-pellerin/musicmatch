import { UserAnalysis } from '../../../typings';

export class ForceGraph {
  relations: Map<string, number>;
  d3Relations: {
    nodes: { index: number }[];
    links: { source: number; target: number; value: number }[];
  } = { nodes: [], links: [] };
  usersAnalysis: UserAnalysis[];

  constructor(usersAnalysis: UserAnalysis[]) {
    this.relations = new Map();
    this.usersAnalysis = usersAnalysis;
  }

  // showRelations() {
  //   this.usersAnalysis.forEach((userAnalysis, index) => {
  //     this.d3Relations.nodes.push({ index });

  //     userAnalysis.usersWithScores.forEach((userWithScores) => {
  //       const usersPair = userAnalysis.user.id + ':' + userWithScores.user.id;
  //       const reversedUsersPair = userWithScores.user.id + ':' + userAnalysis.user.id;

  //       if (!(this.relations.has(usersPair) || this.relations.has(reversedUsersPair))) {
  //         const force =
  //           userWithScores.scores.artistsScore.score +
  //           userWithScores.scores.tracksScore.score +
  //           userWithScores.scores.genresScore.score;
  //         this.relations.set(usersPair, force);

  //         this.d3Relations.links.push({
  //           source: index,
  //           target: this.usersAnalysis.indexOf(
  //             this.usersAnalysis.filter(
  //               (userAnalysis) => userAnalysis.user.id === userWithScores.user.id,
  //             )[0],
  //           ),
  //           value: force,
  //         });
  //       }
  //       console.log(
  //         userAnalysis.user.spotify.name +
  //           ' matches at ' +
  //           (userWithScores.scores.artistsScore.score +
  //             userWithScores.scores.tracksScore.score +
  //             userWithScores.scores.genresScore.score) +
  //           ' with ' +
  //           userWithScores.user.spotify.name,
  //       );
  //     });
  //   });
  //   const forceNode = d3.forceManyBody();
  //   const forceLink = d3
  //     .forceLink(this.d3Relations.links)
  //     .distance((d) => (1 / d.value) * 20);

  //   this.d3Simulation = d3
  //     .forceSimulation(this.d3Relations.nodes)
  //     .force('link', forceLink)
  //     .force('charge', forceNode)
  //     .force('center', d3.forceCenter())
  //     .stop();

  //   for (
  //     let i = 0,
  //       n = Math.ceil(
  //         Math.log(this.d3Simulation.alphaMin()) /
  //           Math.log(1 - this.d3Simulation.alphaDecay()),
  //       );
  //     i < n;
  //     ++i
  //   ) {
  //     console.log(i);

  //     this.d3Simulation.tick();
  //   }
  //   console.log(this.d3Simulation.nodes());

  //   this.d3Simulation.nodes().forEach((node, i) => {
  //     const meshToMove = UserMesh.userMeshes.get(
  //       this.usersAnalysis[i].user.id,
  //     ) as UserMesh;
  //     meshToMove.position.set(node.x * 0.35, node.y * 0.35, 0);
  //   });
  //   // return this.d3Relations.nodes;
  // }
}
