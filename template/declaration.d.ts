/// <reference types="@helfy/helfy/helfy-hf" />

declare module '*.scss' {
  const content: Record<string, string>;
  export default content;
}
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}
declare module '*.svg' {
  const url: string;
  export default url;
}
