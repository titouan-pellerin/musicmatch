varying vec2 vUv;
varying vec3 vNormal;

void main() {
    // gl_FragColor = vec4(.8, vUv.y, vUv.x, .8);
    gl_FragColor = vec4(vNormal.xy, 1., 1.);
}