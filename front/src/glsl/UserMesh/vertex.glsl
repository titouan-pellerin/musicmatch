varying vec2 vUv;
varying vec3 vNormal;

uniform float uTime;
uniform float uSeed;

#include ../utils/noise.glsl;

void main() {
    vUv = uv;
    vNormal = normal;

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float noiseX = cnoise(vec2(normal.z * modelPosition.z * uSeed, uTime));
    float noiseY = cnoise(vec2(modelPosition.x, uTime));
    float noiseZ = cnoise(vec2(normal.y * modelPosition.y * uSeed, uTime));

    modelPosition.x += sin(noiseX * uSeed * 2. + uTime + uSeed) * .1;
    modelPosition.y += sin(noiseY * 3. + uTime + uSeed * .1) * .1;
    modelPosition.z += sin(noiseZ * uSeed * 2. + uTime + uSeed) * .1;
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
}