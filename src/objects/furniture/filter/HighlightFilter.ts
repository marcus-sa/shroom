import { GlProgram, UniformGroup, Color, Filter } from 'pixi.js';

const vertex = `
  attribute vec2 aVertexPosition;
  attribute vec2 aTextureCoord;

  uniform mat3 projectionMatrix;

  varying vec2 vTextureCoord;

  void main(void)
  {
      gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
      vTextureCoord = aTextureCoord;
  }
`;

const fragment = `
  varying vec2 vTextureCoord;
  uniform sampler2D uSampler;
  uniform vec4 backgroundColor;
  uniform vec4 borderColor;

  void main(void) {
      vec4 currentColor = texture2D(uSampler, vTextureCoord);

      if (currentColor.a > 0.0) {
          if (currentColor.r == 0.0 && currentColor.g == 0.0 && currentColor.b == 0.0) {
              gl_FragColor = borderColor;
          } else {
              gl_FragColor = backgroundColor;
          }
      }
  }
`;

export class HighlightFilter extends Filter {
  constructor(_backgroundColor: number, _borderColor: number) {
    const backgroundColor = new Color(_backgroundColor);
    const borderColor = new Color(_borderColor);


    const colorUniforms = new UniformGroup({
      backgroundColor: {
        value: new Float32Array([
          ...backgroundColor.toRgbArray(),
          1.0,
        ]),
        type: 'vec4<f32>'
      },
      borderColor: {
        value: new Float32Array([
          ...borderColor.toRgbArray(),
          1.0,
        ]),
        type: 'vec4<f32>'
      }
    });

    const glProgram = GlProgram.from({
      vertex,
      fragment,
      name: 'highlight-filter'
    });

    super({
      glProgram,
      resources: {
        colorUniforms,
      }
    });
  }
}
