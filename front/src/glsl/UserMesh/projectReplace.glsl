#include <project_vertex>

vNormal = normal;
vec4 modelPosition = modelViewMatrix * vec4(position, 1.0);
float noiseX = cnoise(vec2(normal.x * modelPosition.z * uSeed, uTime * uSeed));
float noiseY = cnoise(vec2(normal.z * (position.x + uSeed), uTime * uSeed));
// float noiseZ = cnoise(vec2(normal.y * modelPosition.y * uSeed, uTime * uSeed));

modelPosition.x -= sin(noiseX * uSeed + uTime * 4. + uSeed) * .1 * - uSeed;
modelPosition.y += sin(noiseY * 3. + uTime * 3. + uSeed * 5.) * .1;
// modelPosition.z += sin(noiseZ * uSeed + uTime * 2. + uSeed) * .1;
// modelPosition.z += sin(uTime) * 10.;
gl_Position = projectionMatrix * modelPosition * uSeed;