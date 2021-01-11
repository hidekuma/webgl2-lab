class App {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.left = 0;
    this.canvas.style.top = 0;

    const gl = this.canvas.getContext('webgl2');
    if (!gl) {
      // webgl2를 사용할 수 없는 환경
      return;
    }

    document.body.appendChild(this.canvas);
    //const vertexShaderSource = `#version 300 es

      //// attribute는 버텍스 쉐이더에 대한 입력(in)입니다.
      //// 버퍼로부터 받은 데이터입니다.
      //// vec4 는 4개의 소수점과 같음 ex) {x:0,y:0,z:0,w:0}
      //in vec4 a_position;

    //// 모든 쉐이더는 main 함수를 가지고 있습니다.
    //void main() {

    //// gl_Position는 버텍스 쉐이더가 설정을 담당하는 내장 변수입니다.
    //gl_Position = a_position;
    //}
    //`;
    var vertexShaderSource = `#version 300 es

      // an attribute is an input (in) to a vertex shader.
      // It will receive data from a buffer
      in vec2 a_position;

    // Used to pass in the resolution of the canvas
    uniform vec2 u_resolution;

    // all shaders have a main function
    void main() {

    // convert the position from pixels to 0.0 to 1.0
    vec2 zeroToOne = a_position / u_resolution;

    // convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;

    // convert from 0->2 to -1->+1 (clipspace)
    vec2 clipSpace = zeroToTwo - 1.0;

    gl_Position = vec4(clipSpace, 0, 1);
    }
    `;

    const fragmentShaderSource = `#version 300 es

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

    const vertexShader = this.createShader(
      gl,
      gl.VERTEX_SHADER,
      vertexShaderSource
    );

    const fragmentShader = this.createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );

    const program = this.createProgram(
      gl,
      vertexShader,
      fragmentShader
    );
    // 현재 GLSL 에서 필요한 attribute는 only a_position
    // 작성한 GLSL프로그램을 위해 attribute를 찾기
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');

    var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");

    // attribute는 버퍼에서 데이터를 가져오기에, 버퍼를 생성해준다
    const positionBuffer = gl.createBuffer();
    // 생성된 버퍼는 바인드 해줌으로써, 버퍼에 데이터를 넣을 수 있음
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // 세 개의 2d points
    // javascript array
    //const positions = [
      //0, 0,
      //0, 0.5,
      //0.7, 0
    //];
    const positions = [
      10, 20,
      80, 20,
      10, 30,
      10, 30,
      80, 20,
      80, 30,
    ];


    // Webgl은 엄격한 형식의 데이터를 원하므로, new Float32Array로 변환처리
    // bufferData를 통해 입력한 데이터를 GPU에 있는 positionBuffer에 복사,
    // 위에서ARRAY_BUFFER를 바인드 포인트로 했기에 positionBuffer를 사용
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // 데이터를 전달하였으므로, 이제는 attribute상태 collection을 생성한다
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    // 버텍스 배열에 attributes를 설정한다. webgl에게 버퍼에서 데이터를 가져오고 싶다고 알려주는것
    // 작동 시키지 않으면 상수값을 가짐.
    gl.enableVertexAttribArray(positionAttributeLocation);

    var size = 2;          // 한번 실행할 때마다 2개 구성 요소 사용
    var type = gl.FLOAT;   // 데이터는 32비트 소수점
    var normalize = false; // 정규화 되지 않은 데이터
    var stride = 0;        // 0 은 실행할 때마다 `size * sizeof(type)`만큼 다음 위치로 이동합니다.
    var offset = 0;        // 버퍼의 첫 위치부터 시작
    gl.vertexAttribPointer(
      positionAttributeLocation,
      size,
      type,
      normalize,
      stride,
      offset
    );
    this.resizeCanvasToDisplaySize(gl.canvas);
    // 캔버스 크기 넘겨
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // 캔버스 초기화
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // 사용할 프로그램을 알립니다.(쉐이더 쌍)
    gl.useProgram(program);
    // 원하는 attribute/buffer 집합을 바인드합니다.
    gl.bindVertexArray(vao);

    // 쉐이더 내에서 픽셀 위치를 클립 공간으로 변환 할 수 있도록 캔버스 해상도를 전달합니다.
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    //var count = 3;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);

  }


  resizeCanvasToDisplaySize(canvas) {
    // Lookup the size the browser is displaying the canvas in CSS pixels.
    const displayWidth  = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    // Check if the canvas is not the same size.
    const needResize = canvas.width  !== displayWidth ||
      canvas.height !== displayHeight;

    if (needResize) {
      // Make the canvas the same size
      canvas.width  = displayWidth;
      canvas.height = displayHeight;
    }

    return needResize;
}

  createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
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
}

window.onload = () => {
  new App();
}
