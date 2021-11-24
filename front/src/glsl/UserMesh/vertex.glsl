varying vec2 vUv;
varying vec3 vNormal;
uniform float uTime;

#include ../utils/noise.glsl;

void main() {
    vUv = uv;
    vNormal = normal;

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float noiseX = cnoise(vec2(normal.z * uTime, uTime));
    float noiseY = cnoise(vec2(normal.x * uTime, uTime));
    float noiseZ = cnoise(vec2(normal.y * uTime, uTime));

    modelPosition.x += sin(noiseX * 3.) * .1;
    modelPosition.y += sin(noiseY * 3.) * .1;
    modelPosition.z += sin(noiseZ * 3.) * .1;
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
}