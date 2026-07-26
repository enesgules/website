// Based on the Paper Shaders dithering shader, adapted to morph two fields
// through one dither pass on a single WebGL canvas.
export const ditherTransitionFragmentShader = `#version 300 es
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;

uniform vec4 u_colorBack;
uniform vec4 u_colorFronts[5];
uniform vec4 u_params[5];
uniform vec2 u_offsets[5];
uniform vec2 u_motion[5];
uniform vec3 u_masks[5];
uniform vec4 u_weights;
uniform float u_dktWeight;

out vec4 fragColor;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

float hash11(float p) {
  p = fract(p * 0.3183099) + 0.1;
  p *= p + 19.19;
  return fract(p * p);
}

float hash21(vec2 p) {
  p = fract(p * vec2(0.3183099, 0.3678794)) + 0.1;
  p += dot(p, p + 19.19);
  return fract(p.x * p.y);
}

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v) {
  const vec4 C = vec4(
    0.211324865405187,
    0.366025403784439,
    -0.577350269189626,
    0.024390243902439
  );
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = x0.x > x0.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(
    permute(i.y + vec3(0.0, i1.y, 1.0))
      + i.x
      + vec3(0.0, i1.x, 1.0)
  );
  vec3 m = max(
    0.5 - vec3(
      dot(x0, x0),
      dot(x12.xy, x12.xy),
      dot(x12.zw, x12.zw)
    ),
    0.0
  );
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159
    - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float getSimplexNoise(vec2 uv, float t) {
  float noise = 0.5 * snoise(uv - vec2(0.0, 0.3 * t));
  noise += 0.5 * snoise(2.0 * uv + vec2(0.0, 0.32 * t));
  return noise;
}

const int bayer2x2[4] = int[4](0, 2, 3, 1);
const int bayer4x4[16] = int[16](
  0, 8, 2, 10,
  12, 4, 14, 6,
  3, 11, 1, 9,
  15, 7, 13, 5
);
const int bayer8x8[64] = int[64](
  0, 32, 8, 40, 2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44, 4, 36, 14, 46, 6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47, 7, 39, 13, 45, 5, 37,
  63, 31, 55, 23, 61, 29, 53, 21
);

float getBayerValue(vec2 uv, int size) {
  ivec2 pos = ivec2(fract(uv / float(size)) * float(size));
  int index = pos.y * size + pos.x;

  if (size == 2) {
    return float(bayer2x2[index]) / 4.0;
  }
  if (size == 4) {
    return float(bayer4x4[index]) / 16.0;
  }
  return float(bayer8x8[index]) / 64.0;
}

vec2 rotateUv(vec2 uv, float degrees) {
  float radians = degrees * PI / 180.0;
  mat2 rotation = mat2(
    cos(radians),
    sin(radians),
    -sin(radians),
    cos(radians)
  );
  return rotation * uv;
}

vec2 getShapeUv(
  vec2 normalizedUv,
  float shapeType,
  float scale,
  float rotation,
  vec2 offset
) {
  vec2 shapeUv = normalizedUv;

  if (shapeType > 3.5) {
    float objectSize = min(u_resolution.x, u_resolution.y);
    vec2 worldScale = u_resolution / objectSize;
    shapeUv *= worldScale;
    shapeUv += vec2(-offset.x, offset.y);
    shapeUv /= scale;
    return rotateUv(shapeUv, rotation);
  }

  float patternSize = min(u_resolution.x, u_resolution.y);
  vec2 worldScale = u_resolution / patternSize;
  shapeUv += vec2(-offset.x, offset.y) / worldScale;
  shapeUv *= u_resolution;
  shapeUv /= u_pixelRatio;
  shapeUv /= scale;
  shapeUv = rotateUv(shapeUv, rotation);
  return shapeUv + 0.5;
}

float evaluateShape(vec2 shapeUv, float shapeType, float t) {
  if (shapeType < 1.5) {
    shapeUv *= 0.001;
    float shape = 0.5 + 0.5 * getSimplexNoise(shapeUv, t);
    return smoothstep(0.3, 0.9, shape);
  }

  if (shapeType < 2.5) {
    shapeUv *= 0.003;
    for (float i = 1.0; i < 6.0; i++) {
      shapeUv.x += 0.6 / i * cos(i * 2.5 * shapeUv.y + t);
      shapeUv.y += 0.6 / i * cos(i * 1.5 * shapeUv.x + t);
    }
    float shape = 0.15
      / max(0.001, abs(sin(t - shapeUv.y - shapeUv.x)));
    return smoothstep(0.02, 1.0, shape);
  }

  if (shapeType < 3.5) {
    shapeUv *= 0.05;
    float stripeIndex = floor(2.0 * shapeUv.x / TWO_PI);
    float randomValue = hash11(stripeIndex * 10.0);
    randomValue = sign(randomValue - 0.5)
      * pow(0.1 + abs(randomValue), 0.4);
    float shape = sin(shapeUv.x)
      * cos(shapeUv.y - 5.0 * randomValue * t);
    return pow(abs(shape), 6.0);
  }

  if (shapeType < 4.5) {
    shapeUv *= 4.0;
    float wave = cos(0.5 * shapeUv.x - 2.0 * t)
      * sin(1.5 * shapeUv.x + t)
      * (0.75 + 0.25 * cos(3.0 * t));
    return 1.0 - smoothstep(-1.0, 1.0, shapeUv.y + wave);
  }

  if (shapeType < 5.5) {
    float distanceFromCenter = length(shapeUv);
    return 0.5 + 0.5 * sin(
      pow(distanceFromCenter, 1.7) * 7.0 - 3.0 * t
    );
  }

  if (shapeType < 6.5) {
    float radius = length(shapeUv);
    float angle = 6.0 * atan(shapeUv.y, shapeUv.x) + 4.0 * t;
    float twist = 1.2;
    float offset = 1.0 / pow(max(radius, 1e-6), twist)
      + angle / TWO_PI;
    float middle = smoothstep(0.0, 1.0, pow(radius, twist));
    return mix(0.0, fract(offset), middle);
  }

  shapeUv *= 2.0;
  float depth = 1.0 - pow(length(shapeUv), 2.0);
  vec3 position = vec3(shapeUv, sqrt(max(0.0, depth)));
  vec3 lightPosition = normalize(
    vec3(cos(1.5 * t), 0.8, sin(1.25 * t))
  );
  float shape = 0.5 + 0.5 * dot(lightPosition, position);
  return shape * step(0.0, depth);
}

float getDitherThreshold(vec2 pixelUv, float type) {
  int ditherType = int(floor(type));
  if (ditherType == 1) {
    return hash21(pixelUv);
  }
  if (ditherType == 2) {
    return 1.0 - getBayerValue(pixelUv, 2);
  }
  if (ditherType == 3) {
    return 1.0 - getBayerValue(pixelUv, 4);
  }
  return 1.0 - getBayerValue(pixelUv, 8);
}

float getFieldMask(vec2 screenUv, vec3 maskData) {
  vec2 distanceFromCenter = screenUv - maskData.xy;
  distanceFromCenter.x *= 0.78;
  float distanceValue = length(distanceFromCenter);
  return 1.0 - smoothstep(0.0, maskData.z, distanceValue);
}

float getVariantWeight(int index) {
  if (index < 4) {
    return u_weights[index];
  }
  return u_dktWeight;
}

void main() {
  float sharedPxSize = 0.0;
  float maxWeight = 0.0;
  for (int i = 0; i < 5; i++) {
    float weight = getVariantWeight(i);
    sharedPxSize += weight * u_params[i].z;
    maxWeight = max(maxWeight, weight);
  }
  sharedPxSize *= u_pixelRatio;
  vec2 centeredPosition = gl_FragCoord.xy - 0.5 * u_resolution;

  vec2 sharedPixelUv = centeredPosition / sharedPxSize;
  vec2 sharedPixelPosition = (
    floor(sharedPixelUv) + 0.5
  ) * sharedPxSize;
  vec2 sharedNormalizedUv = sharedPixelPosition / u_resolution;

  vec2 screenUv = vec2(
    gl_FragCoord.x / u_resolution.x,
    1.0 - gl_FragCoord.y / u_resolution.y
  );

  float fieldShape = 0.0;
  float fieldThreshold = 0.0;
  float fieldMask = 0.0;
  vec3 frontLinear = vec3(0.0);
  float frontAlpha = 0.0;

  for (int i = 0; i < 5; i++) {
    float weight = getVariantWeight(i);
    if (weight <= 0.0001) {
      continue;
    }

    vec4 params = u_params[i];
    vec2 motion = u_motion[i];
    vec2 shapeUv = getShapeUv(
      sharedNormalizedUv,
      params.x,
      params.w,
      motion.x,
      u_offsets[i]
    );
    fieldShape += weight * evaluateShape(
      shapeUv,
      params.x,
      0.5 * u_time * motion.y
    );
    fieldThreshold += weight * getDitherThreshold(
      sharedPixelUv,
      params.y
    );
    fieldMask += weight * getFieldMask(screenUv, u_masks[i]);

    vec4 frontColor = u_colorFronts[i];
    frontLinear += weight * pow(
      max(frontColor.rgb, vec3(0.0)),
      vec3(2.2)
    );
    frontAlpha += weight * frontColor.a;
  }

  float transitionAmount = clamp((1.0 - maxWeight) * 2.0, 0.0, 1.0);
  float coverageFeather = mix(
    0.008,
    0.085,
    transitionAmount
  );
  float ditheredField = smoothstep(
    fieldThreshold - coverageFeather,
    fieldThreshold + coverageFeather,
    fieldShape
  ) * fieldMask;

  vec3 frontColor = pow(
    max(frontLinear, vec3(0.0)),
    vec3(1.0 / 2.2)
  );
  vec3 foreground = frontColor * frontAlpha;
  vec3 background = u_colorBack.rgb * u_colorBack.a;
  float foregroundOpacity = frontAlpha * ditheredField;
  vec3 color = foreground * ditheredField;
  color += background * (1.0 - foregroundOpacity);
  float opacity = foregroundOpacity
    + u_colorBack.a * (1.0 - foregroundOpacity);

  fragColor = vec4(color, opacity);
}
`;
