var vertexShaderSource = `#version 300 es
 
// attribute는 버텍스 쉐이더에 대한 입력(in)입니다.
// 버퍼로부터 받은 데이터입니다.
in vec4 a_position;
 
// 모든 쉐이더는 main 함수를 가지고 있습니다.
void main() {
 
  // gl_Position는 버텍스 쉐이더가 설정을 담당하는 내장 변수입니다.
  gl_Position = a_position;
}
`;
 
var fragmentShaderSource = `#version 300 es
 
// 프래그먼트 쉐이더는 기본 정밀도를 가지고 있지 않으므로 선언을 해야합니다.
// highp은 기본값으로 적당합니다. "높은 정밀도"를 의미합니다.
precision highp float;
 
// 프래그먼트 쉐이더(fragment shader)에서 출력을 선언 해야합니다.
out vec4 outColor;
 
void main() {
  // 붉은-보라색으로 출력하게 설정합니다.
  outColor = vec4(1, 0, 0.5, 1);
}

`;
class App {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.left = 0;
    this.canvas.style.top = 0;
    document.body.appendChild(this.canvas);

    const gl = this.canvas.getContext('webgl22');
    if (!gl) {
      return;
    }

    const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = this.createProgram(gl, vertexShader, fragmentShader);
  }

  createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
  }

  createShader(gl, type, source) {
    const shader = this.gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
  }
}

window.onload = () => {
  new App();
}
