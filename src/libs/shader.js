export const vertexShader = [
  'precision mediump float;',
  'precision mediump int;',
  'attribute vec3 position;',

  'void main()	{',
    'gl_Position = vec4( position, 1.0 );',

  '}'
].join('\n')

export const fragShader = [
  
  'precision mediump float;',
  'precision mediump int;',
  
  'uniform vec3 uColor;',

  'void main()	{',

    'vec4 color = vec4( uColor, 1 );',
    'gl_FragColor = color;',

  '}'


].join('\n')

		